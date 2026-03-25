import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  validateCheckoutItems,
  type CheckoutItem,
} from '~/lib/validation';
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '~/lib/ratelimit';
import { getCheckoutCustomer } from '~/lib/auth/get-checkout-customer';

// Lazy initialize Stripe
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(apiKey, {
      apiVersion: '2026-02-25.clover',
    });
  }
  return stripe;
}

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

    const { items } = body as Record<string, unknown>;

    // Validate items array
    const itemsValidation = validateCheckoutItems(items);
    if (!itemsValidation.valid) {
      return NextResponse.json(
        { message: itemsValidation.error },
        { status: 400 }
      );
    }

    const validatedItems = items as CheckoutItem[];

    // Look up logged-in customer (if any) for receipt email and metadata
    const customer = await getCheckoutCustomer();

    // Calculate total in cents
    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.08); // ~8% tax
    const total = subtotal + tax;

    // Create PaymentIntent with automatic payment methods
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      ...(customer?.email && { receipt_email: customer.email }),
      metadata: {
        orderType: 'storefront_express_checkout',
        itemCount: String(validatedItems.length),
        subtotal: String(subtotal),
        tax: String(tax),
        ...(customer && {
          customerId: String(customer.id),
          customerEmail: customer.email,
        }),
        // Store item details for order creation
        items: JSON.stringify(
          validatedItems.map((item) => ({
            variationId: item.variationId,
            productId: item.productId,
            name: item.name,
            variation: item.variation || null,
            manufacturerNo: item.manufacturerNo || null,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl || null,
          }))
        ),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      subtotal,
      tax,
    });
  } catch (error: unknown) {
    console.error('PaymentIntent Error:', error);
    return NextResponse.json(
      { message: 'Failed to create payment. Please try again.' },
      { status: 500 }
    );
  }
}
