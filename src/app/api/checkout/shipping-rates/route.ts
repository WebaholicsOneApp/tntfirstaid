import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";
import { getApiClient } from "~/lib/api-client";
import { env } from "~/env";

const MOCK_RATES = [
  {
    serviceCode: "03",
    serviceName: "UPS Ground",
    totalCents: 950,
    deliveryDays: 4,
    estimatedDelivery: null,
  },
  {
    serviceCode: "02",
    serviceName: "UPS 2nd Day Air",
    totalCents: 2499,
    deliveryDays: 2,
    estimatedDelivery: null,
  },
  {
    serviceCode: "01",
    serviceName: "UPS Next Day Air",
    totalCents: 4999,
    deliveryDays: 1,
    estimatedDelivery: null,
  },
];

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

    const { items, shippingAddress } = body as Record<string, unknown>;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "items is required and must not be empty" },
        { status: 400 },
      );
    }

    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json(
        { message: "shippingAddress is required" },
        { status: 400 },
      );
    }

    // Dev-only: return canned UPS rates so checkout works without OneApp.
    // Hard-gated to non-production to prevent accidental enablement in prod.
    if (
      env.NODE_ENV !== "production" &&
      env.DEV_FAKE_SHIPPING_RATES === "1"
    ) {
      return NextResponse.json({ rates: MOCK_RATES });
    }

    const result = await getApiClient().post<{
      rates: Array<{
        serviceCode: string;
        serviceName: string;
        totalCents: number;
        deliveryDays: number | null;
        estimatedDelivery: string | null;
      }>;
    }>("/checkout/shipping-rates", { items, shippingAddress });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[shipping-rates proxy] Error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch shipping rates. Please try again.",
      },
      { status: 500 },
    );
  }
}
