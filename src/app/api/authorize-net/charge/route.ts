import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '~/lib/ratelimit';
import { getApiClient } from '~/lib/api-client';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, 'checkout');

  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const body = await request.json();
    const result = await getApiClient().post<{
      success: boolean;
      providerType: 'authorize_net';
      transactionId: string;
      orderId: number;
      orderNumber: string;
      total: number;
    }>('/checkout/authorize-net/charge', body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[authorize-net/charge] Proxy error:', error);
    const message =
      error instanceof Error ? error.message : 'Authorize.net checkout failed';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
