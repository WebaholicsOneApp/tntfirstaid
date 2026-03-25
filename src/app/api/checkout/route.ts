import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  validateCheckoutItems,
  validateRedirectUrl,
  sanitizeString,
  type CheckoutItem,
} from '~/lib/validation';
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '~/lib/ratelimit';
import { getCheckoutCustomer } from '~/lib/auth/get-checkout-customer';
import { getOrCreateStripeCustomer } from '~/lib/stripe/get-or-create-stripe-customer';

// Lazy initialize Stripe to avoid build-time errors when API key is missing
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

// Get the site URL from environment
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005';

// NOTE: Checkout is intentionally public (no auth required)
// Customers should be able to purchase without logging in
export async function POST(request: Request) {
  // Rate limit checkout requests (10 per minute per IP)
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

    const { items, successUrl, cancelUrl } = body as Record<string, unknown>;

    // Validate items array
    const itemsValidation = validateCheckoutItems(items);
    if (!itemsValidation.valid) {
      return NextResponse.json(
        { message: itemsValidation.error },
        { status: 400 }
      );
    }

    // Validate success URL (required, must be same origin to prevent open redirect)
    if (!successUrl || typeof successUrl !== 'string') {
      return NextResponse.json(
        { message: 'Success URL is required' },
        { status: 400 }
      );
    }

    const successUrlValidation = validateRedirectUrl(successUrl, SITE_URL);
    if (!successUrlValidation.valid) {
      return NextResponse.json(
        { message: `Invalid success URL: ${successUrlValidation.error}` },
        { status: 400 }
      );
    }

    // Validate cancel URL (required, must be same origin to prevent open redirect)
    if (!cancelUrl || typeof cancelUrl !== 'string') {
      return NextResponse.json(
        { message: 'Cancel URL is required' },
        { status: 400 }
      );
    }

    const cancelUrlValidation = validateRedirectUrl(cancelUrl, SITE_URL);
    if (!cancelUrlValidation.valid) {
      return NextResponse.json(
        { message: `Invalid cancel URL: ${cancelUrlValidation.error}` },
        { status: 400 }
      );
    }

    // Cast items to typed array after validation
    const validatedItems = items as CheckoutItem[];

    // Create line items for Stripe with sanitized data
    const lineItems = validatedItems.map((item) => {
      // Build image URL - ensure it's absolute for Stripe
      let imageUrl: string | undefined;
      if (item.imageUrl) {
        imageUrl = item.imageUrl.startsWith('http')
          ? item.imageUrl
          : `${SITE_URL}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`;
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: sanitizeString(item.name),
            description: item.variation ? sanitizeString(item.variation) : undefined,
            images: imageUrl ? [imageUrl] : undefined,
            metadata: {
              productId: String(item.productId),
              variationId: item.variationId ? String(item.variationId) : '',
              variation: item.variation ? sanitizeString(item.variation) : '',
              manufacturerNo: item.manufacturerNo ? sanitizeString(item.manufacturerNo) : '',
              imageUrl: item.imageUrl || '',
            },
          },
          unit_amount: item.price, // Price is already in cents and validated
        },
        quantity: item.quantity,
      };
    });

    // Build the full URLs (ensure they're absolute)
    const fullSuccessUrl = successUrl.startsWith('/')
      ? `${SITE_URL}${successUrl}`
      : successUrl;
    const fullCancelUrl = cancelUrl.startsWith('/')
      ? `${SITE_URL}${cancelUrl}`
      : cancelUrl;

    // If a customer is logged in, find or create a Stripe Customer so
    // the checkout form is pre-filled with their name, email, phone, and address.
    const customer = await getCheckoutCustomer();
    const stripeCustomerId = customer
      ? await getOrCreateStripeCustomer(getStripe(), customer)
      : null;

    // Create checkout session
    // Using automatic_payment_methods to show all enabled methods from Stripe Dashboard
    // (PayPal, Apple Pay, Google Pay, Affirm, cards, etc.)
    const session = await getStripe().checkout.sessions.create({
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
      line_items: lineItems,
      mode: 'payment',
      success_url: fullSuccessUrl,
      cancel_url: fullCancelUrl,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      // Free shipping on all orders
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Free Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
      // Enable all payment methods - wallets show at top when available
      payment_method_types: [
        'card',
        'klarna',
        'affirm',
        'cashapp',
        'amazon_pay',
        'link',
      ],
      // Configure wallet behavior
      payment_method_options: {
        card: {
          // This enables Google Pay and Apple Pay on the card form
          request_three_d_secure: 'automatic',
        },
      },
      metadata: {
        orderType: 'storefront_checkout',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe Checkout Error:', error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { message: 'Checkout failed. Please try again.' },
      { status: 500 }
    );
  }
}
