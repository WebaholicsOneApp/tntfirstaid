import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderById } from '~/lib/orders';

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
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const id = Number(orderId);

    if (!orderId || isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Valid order ID is required' },
        { status: 400 }
      );
    }

    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get customer email from Stripe using the payment intent stored in channelOrderId
    let customerEmail: string | null = null;
    const paymentIntentId = order.channelOrderId;

    if (paymentIntentId?.startsWith('pi_')) {
      try {
        const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
        customerEmail = paymentIntent.receipt_email || null;

        // If no receipt_email, try to get it from the associated charge
        if (!customerEmail && paymentIntent.latest_charge) {
          const chargeId = typeof paymentIntent.latest_charge === 'string'
            ? paymentIntent.latest_charge
            : paymentIntent.latest_charge.id;
          const charge = await getStripe().charges.retrieve(chargeId);
          customerEmail = charge.billing_details?.email || null;
        }
      } catch (stripeError) {
        console.error('Error fetching email from Stripe:', stripeError);
      }
    }

    const orderNumber = `AM-${order.id}`;

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      customerEmail,
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
