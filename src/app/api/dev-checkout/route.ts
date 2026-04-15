import { type NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";
import { calculateTax } from "~/lib/tax";
import { getApiClient, ApiClientError } from "~/lib/api-client";

/**
 * Dev-only checkout bypass — creates orders in OneApp without a payment provider.
 *
 * Uses the v2 custom-pay-verified-order endpoint (same as production flows).
 *
 * Triple guard:
 * 1. NODE_ENV !== 'production'
 * 2. DEV_CHECKOUT_BYPASS === 'true'
 * 3. Returns 404 (not 403) in production to hide endpoint
 */

function isDevBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_CHECKOUT_BYPASS === "true"
  );
}

interface DevCheckoutBody {
  customerEmail: string;
  items: { variationId: number; quantity: number; price: number }[];
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber?: string;
  discountCode?: string;
  discountCents?: number;
  shippingCostCents?: number;
  shippingServiceName?: string;
  shippingServiceCode?: string;
  sendEmail?: boolean;
}

export async function POST(request: NextRequest) {
  if (!isDevBypassEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be an object" },
        { status: 400 },
      );
    }

    const {
      customerEmail,
      items,
      shippingAddress,
      phoneNumber,
      sendEmail,
      discountCode,
      discountCents: rawDiscountCents,
      shippingCostCents,
      shippingServiceName,
      shippingServiceCode,
    } = body as DevCheckoutBody;

    if (!customerEmail || typeof customerEmail !== "string") {
      return NextResponse.json(
        { error: "customerEmail is required" },
        { status: 400 },
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 },
      );
    }
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json(
        { error: "shippingAddress is required" },
        { status: 400 },
      );
    }

    // --- Discount ---
    const normalizedDiscountCents =
      typeof discountCode === "string" &&
      /^[A-Za-z0-9_-]{3,32}$/.test(discountCode) &&
      typeof rawDiscountCents === "number" &&
      Number.isFinite(rawDiscountCents) &&
      rawDiscountCents > 0
        ? Math.floor(rawDiscountCents)
        : 0;

    // Calculate verifiedAmount from client-side prices (v2 will verify against DB prices)
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const discountedSubtotal = Math.max(0, subtotal - normalizedDiscountCents);
    const tax = calculateTax(discountedSubtotal, shippingAddress.state);
    const verifiedAmount = discountedSubtotal + tax + (shippingCostCents ?? 0);

    const data = await getApiClient().post<{
      success: boolean;
      orderId: number;
      orderNumber: string;
      total: number;
    }>("/checkout/custom-pay-verified-order", {
      providerType: "dev_bypass",
      providerPaymentId: `dev_bypass_${Date.now()}`,
      verifiedAmount,
      customerEmail,
      items: items.map((item) => ({
        variationId: item.variationId,
        quantity: item.quantity,
      })),
      shippingAddress,
      phoneNumber,
      shippingCostCents: shippingCostCents ?? 0,
      shippingServiceName,
      shippingServiceCode,
      discountCents: normalizedDiscountCents || undefined,
      sendEmail: sendEmail ?? false,
    });

    return NextResponse.json({
      orderId: data.orderId,
      orderNumber: data.orderNumber,
    });
  } catch (error: unknown) {
    if (error instanceof ApiClientError) {
      console.error("[DEV_CHECKOUT] OneApp error:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 400 ? error.status : 500 },
      );
    }
    console.error(
      "[DEV_CHECKOUT] Error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
