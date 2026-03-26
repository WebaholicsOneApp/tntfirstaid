import { NextResponse } from 'next/server';
import {
  validateCheckoutItems,
  type CheckoutItem,
} from '~/lib/validation';
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '~/lib/ratelimit';
import { getApiClient } from '~/lib/api-client';

export async function POST(request: Request) {
  // Rate limit (10 per minute per IP)
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, 'checkout');

  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { message: 'Request body must be an object' },
        { status: 400 }
      );
    }

    const { items, shippingAddress } = body as Record<string, unknown>;

    // Validate items array
    const itemsValidation = validateCheckoutItems(items);
    if (!itemsValidation.valid) {
      return NextResponse.json(
        { message: itemsValidation.error },
        { status: 400 }
      );
    }

    const validatedItems = items as CheckoutItem[];

    const paymentIntent = await getApiClient().post<{
      clientSecret: string;
      paymentIntentId: string;
      amount: number;
      subtotal: number;
      tax: number;
      publishableKey?: string;
      stripeConnectAccountId?: string;
    }>('/checkout/payment-intent', {
      items: validatedItems.map((item) => ({
        variationId: item.variationId,
        quantity: item.quantity,
      })),
      ...(shippingAddress ? { shippingAddress } : {}),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount: paymentIntent.amount,
      subtotal: paymentIntent.subtotal,
      tax: paymentIntent.tax,
      publishableKey: paymentIntent.publishableKey || null,
      stripeConnectAccountId: paymentIntent.stripeConnectAccountId || null,
    });
  } catch (error: unknown) {
    console.error('PaymentIntent proxy error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create payment. Please try again.' },
      { status: 500 },
    );
  }
}
