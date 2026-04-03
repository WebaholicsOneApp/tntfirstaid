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
    const { customerEmail, phoneNumber, items, opaqueData, shippingAddress } = body;

    if (!customerEmail || !items?.length || !opaqueData || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await getApiClient().post<{
      success: boolean;
      providerType: 'authorize_net';
      transactionId: string;
      orderId: number;
      orderNumber: string;
      total: number;
    }>('/checkout/authorize-net/charge', {
      customerEmail,
      phoneNumber,
      items: items.map((item: { variationId: number; quantity: number }) => ({
        variationId: item.variationId,
        quantity: item.quantity,
      })),
      opaqueData: {
        dataDescriptor: opaqueData.dataDescriptor,
        dataValue: opaqueData.dataValue,
      },
      shippingAddress: {
        name: shippingAddress.name,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || undefined,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'US',
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[authorize-net/charge] Error:', error);
    return NextResponse.json({ error: 'Payment processing failed. Please try again.' }, { status: 400 });
  }
}
