import { NextResponse } from 'next/server';
import {
  validateCheckoutItems,
  validateRedirectUrl,
  type CheckoutItem,
} from '~/lib/validation';
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '~/lib/ratelimit';
import { getCheckoutCustomer } from '~/lib/auth/get-checkout-customer';
import { getApiClient } from '~/lib/api-client';

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

    const { items, successUrl, cancelUrl, customerEmail, shippingAddress } = body as Record<string, unknown>;

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

    // Build the full URLs (ensure they're absolute)
    const fullSuccessUrl = successUrl.startsWith('/')
      ? `${SITE_URL}${successUrl}`
      : successUrl;
    const fullCancelUrl = cancelUrl.startsWith('/')
      ? `${SITE_URL}${cancelUrl}`
      : cancelUrl;

    const customer = await getCheckoutCustomer();
    // Prefer email from shipping form, then authenticated customer, then omit
    const resolvedEmail =
      (typeof customerEmail === 'string' && customerEmail.trim()) ||
      customer?.email ||
      undefined;

    const session = await getApiClient().post<{ url?: string; checkoutUrl?: string }>(
      '/checkout/session',
      {
        items: validatedItems.map((item: CheckoutItem) => ({
          variationId: item.variationId,
          quantity: item.quantity,
        })),
        successUrl: fullSuccessUrl,
        cancelUrl: fullCancelUrl,
        ...(resolvedEmail ? { customerEmail: resolvedEmail } : {}),
        ...(shippingAddress && typeof shippingAddress === 'object' && !Array.isArray(shippingAddress)
          ? { shippingAddress }
          : {}),
      },
    );

    return NextResponse.json({ url: session.url || session.checkoutUrl });
  } catch (error: unknown) {
    console.error('Checkout proxy error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Checkout failed. Please try again.' },
      { status: 500 },
    );
  }
}
