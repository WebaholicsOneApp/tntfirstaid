import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitResponse } from '~/lib/ratelimit';

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, 'checkout');
  if (!rateLimit.success) return rateLimitResponse(rateLimit);

  const apiKey = process.env.PRECISIONPAY_API_KEY;
  const apiSecret = process.env.PRECISIONPAY_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'PrecisionPay not configured' }, { status: 500 });
  }

  try {
    const ppEnv = process.env.PRECISIONPAY_ENV || 'sandbox';
    const PP_API_URL = ppEnv === 'production'
      ? 'https://api.myprecisionpay.com/api'
      : 'https://sandbox.myprecisionpay.com/api';
    const siteUrl = process.env.CORS_ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_SITE_URL || 'https://alphamunitions.com';

    const response = await fetch(`${PP_API_URL}/merchant-nonce`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Application-Access': JSON.stringify({ apiKey, apiSecret }),
        'Referer': siteUrl,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('[PrecisionPay] Failed to get merchant nonce:', response.status, errorBody);
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
    }

    const data = await response.json();

    if (!data.merchantNonce) {
      console.error('[PrecisionPay] No merchantNonce in response:', data);
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
    }

    const checkoutPortalUrl = ppEnv === 'production'
      ? 'https://checkout.myprecisionpay.com'
      : 'https://sandbox-checkout.myprecisionpay.com';

    return NextResponse.json({
      merchantNonce: data.merchantNonce,
      checkoutPortalUrl,
      env: ppEnv === 'production' ? 'production' : 'sandbox',
    });
  } catch (error) {
    console.error('[PrecisionPay] Nonce error:', error);
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
  }
}
