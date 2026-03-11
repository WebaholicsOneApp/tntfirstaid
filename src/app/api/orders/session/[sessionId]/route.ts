import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderByPaymentIntent } from '~/lib/orders';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the Stripe checkout session to get customer email and payment intent
    if (!sessionId.startsWith('cs_')) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const customerEmail = session.customer_email || session.customer_details?.email || null;
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null;

    // Try to find the order in DB by payment intent (what OneApp stores as channelOrderId)
    let orderId: number | string = sessionId;
    let orderNumber: string | null = null;

    if (paymentIntentId) {
      const order = await getOrderByPaymentIntent(paymentIntentId);
      if (order) {
        orderId = order.id;
        orderNumber = `AM-${order.id}`;
      }
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      orderId,
      orderNumber,
      customerEmail,
    });
  } catch (error) {
    console.error('Error fetching order by session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
