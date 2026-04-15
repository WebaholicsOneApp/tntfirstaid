import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";
import { getApiClient } from "~/lib/api-client";

/**
 * Proxies the storefront discount-code preview endpoint to oneapp.
 * The upstream /checkout/apply-discount handler is the authoritative
 * validator — we just forward the request and surface the response shape.
 *
 * Upstream (oneapp) also layers its own per-(ip, storeChannelId) rate limit
 * at 10/min on top of the existing storefront-wide limiter.
 */
export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, "checkout");
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Request body must be an object" },
        { status: 400 },
      );
    }

    const { code, items } = body as Record<string, unknown>;

    if (typeof code !== "string" || !/^[A-Za-z0-9_-]{3,32}$/.test(code)) {
      return NextResponse.json(
        { message: "Invalid code format" },
        { status: 400 },
      );
    }

    // Minimal items validation — apply-discount only forwards
    // `variationId` + `quantity` downstream, so the full CheckoutItem shape
    // that validateCheckoutItems requires is overkill. Matches the pattern
    // in /api/authorize-net/charge/route.ts.
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "items is required and must not be empty" },
        { status: 400 },
      );
    }
    if (items.length > 100) {
      return NextResponse.json(
        { message: "items may not exceed 100 entries" },
        { status: 400 },
      );
    }

    const normalizedItems: Array<{ variationId: number; quantity: number }> =
      [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || typeof it !== "object") {
        return NextResponse.json(
          { message: `Item ${i + 1}: invalid format` },
          { status: 400 },
        );
      }
      const obj = it as Record<string, unknown>;
      // Accept either `variationId` (preferred) or `id` — the
      // TNT First Aid cart uses `id` as the variationId.
      const variationId =
        typeof obj.variationId === "number"
          ? obj.variationId
          : typeof obj.id === "number"
            ? obj.id
            : NaN;
      const quantity = obj.quantity;
      if (!Number.isInteger(variationId) || variationId <= 0) {
        return NextResponse.json(
          { message: `Item ${i + 1}: invalid variationId` },
          { status: 400 },
        );
      }
      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return NextResponse.json(
          { message: `Item ${i + 1}: invalid quantity` },
          { status: 400 },
        );
      }
      normalizedItems.push({ variationId: variationId as number, quantity });
    }

    const result = await getApiClient().post<
      | {
          valid: true;
          discountCents: number;
          discountType: "p" | "f";
          discountAmount: number;
          subtotalCents: number;
          newSubtotalCents: number;
        }
      | { valid: false; reason: string }
    >("/checkout/apply-discount", {
      code: code.toUpperCase(),
      items: normalizedItems,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[checkout/apply-discount] proxy error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to validate discount code right now.",
      },
      { status: 500 },
    );
  }
}
