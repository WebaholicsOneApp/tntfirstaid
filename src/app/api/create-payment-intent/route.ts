import { NextResponse } from "next/server";
import { validateCheckoutItems, type CheckoutItem } from "~/lib/validation";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";
import { getApiClient } from "~/lib/api-client";

export async function POST(request: Request) {
  // Rate limit (10 per minute per IP)
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

    const { items, shippingAddress, discountCode } = body as Record<
      string,
      unknown
    >;

    // Validate items array
    const itemsValidation = validateCheckoutItems(items);
    if (!itemsValidation.valid) {
      return NextResponse.json(
        { message: itemsValidation.error },
        { status: 400 },
      );
    }

    const validatedItems = items as CheckoutItem[];

    const normalizedDiscountCode =
      typeof discountCode === "string" &&
      /^[A-Za-z0-9_-]{3,32}$/.test(discountCode)
        ? discountCode.toUpperCase()
        : undefined;

    const paymentIntent = await getApiClient().post<{
      clientSecret: string;
      paymentIntentId: string;
      amount: number;
      subtotal: number;
      discountCents?: number;
      tax: number;
      publishableKey?: string;
      stripeConnectAccountId?: string;
    }>("/checkout/payment-intent", {
      items: validatedItems.map((item) => ({
        variationId: item.variationId,
        quantity: item.quantity,
      })),
      ...(shippingAddress ? { shippingAddress } : {}),
      ...(normalizedDiscountCode
        ? { discountCode: normalizedDiscountCode }
        : {}),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount: paymentIntent.amount,
      subtotal: paymentIntent.subtotal,
      discountCents: paymentIntent.discountCents ?? 0,
      tax: paymentIntent.tax,
      publishableKey: paymentIntent.publishableKey || null,
      stripeConnectAccountId: paymentIntent.stripeConnectAccountId || null,
    });
  } catch (error: unknown) {
    console.error("PaymentIntent proxy error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create payment. Please try again.",
      },
      { status: 500 },
    );
  }
}
