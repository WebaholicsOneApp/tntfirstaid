import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createOrder } from '~/lib/orders';
import { sendOrderConfirmationEmail } from '~/lib/notifications/email-service';
import { getApiClient } from '~/lib/api-client';

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

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return secret;
}

export async function POST(req: Request) {
  console.log('\n[WEBHOOK] ============================================');
  console.log('[WEBHOOK] Stripe Webhook Received');
  console.log('[WEBHOOK] ============================================\n');

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[WEBHOOK] Missing Stripe signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    console.log('[WEBHOOK] Signature header present');

    let event: Stripe.Event;

    try {
      console.log('[WEBHOOK] Verifying webhook signature...');
      event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
      console.log('[WEBHOOK] Signature verified successfully');
    } catch (err) {
      console.error('[WEBHOOK] Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`[WEBHOOK] Event type: ${event.type}`);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('\n[WEBHOOK] Processing checkout.session.completed');
      console.log(`[WEBHOOK] Session ID: ${session.id}`);

      // Retrieve full session with line items
      console.log('[WEBHOOK] Retrieving full session details from Stripe...');
      const fullSession = await getStripe().checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'line_items.data.price.product', 'payment_intent', 'shipping_cost'],
      });
      console.log('[WEBHOOK] Full session retrieved');

      // Extract customer information
      const customerEmail = fullSession.customer_email || fullSession.customer_details?.email || '';
      const shippingDetails = fullSession.collected_information?.shipping_details;
      const paymentIntentId = typeof fullSession.payment_intent === 'string'
        ? fullSession.payment_intent
        : fullSession.payment_intent?.id || '';

      console.log(`[WEBHOOK] Customer Email: ${customerEmail}`);
      console.log(`[WEBHOOK] Payment Intent ID: ${paymentIntentId}`);

      if (!shippingDetails || !shippingDetails.address) {
        console.error('[WEBHOOK] Missing shipping details in session:', session.id);
        return NextResponse.json({ error: 'Missing shipping details' }, { status: 400 });
      }

      console.log(`[WEBHOOK] Shipping to: ${shippingDetails.name}, ${shippingDetails.address.city}, ${shippingDetails.address.state}`);

      // Extract line items
      console.log('\n[WEBHOOK] Extracting line items...');
      const lineItems = fullSession.line_items?.data || [];
      console.log(`[WEBHOOK] Found ${lineItems.length} line items`);

      const orderItems = await Promise.all(lineItems.map(async (item, index) => {
        const product = item.price?.product as Stripe.Product;
        const metadata = product?.metadata || {};
        const quantity = item.quantity || 1;

        // Stripe provides amounts in cents
        // We want the unit price and unit tax
        const totalLinePrice = item.amount_subtotal; // Total before tax
        const totalLineTax = item.amount_tax;       // Total tax for this line

        const unitPrice = Math.round(totalLinePrice / quantity);
        const unitTax = Math.round(totalLineTax / quantity);

        const productId = parseInt(metadata.productId || '0', 10);
        const variationId = parseInt(metadata.variationId || '0', 10);

        // Fetch product image via API (fallback to Stripe-provided image or metadata)
        let imageUrl = product?.images?.[0] || metadata.imageUrl || null;

        if (!imageUrl && productId) {
          try {
            const api = getApiClient();
            const resp = await api.get<any>('/products', { productIds: String(productId), limit: 1 });
            const productData = resp?.data?.[0];
            if (productData) {
              // Try variation-specific image first
              if (variationId && productData.variations) {
                const variation = productData.variations.find((v: any) => v.id === variationId);
                if (variation?.images?.[0]) imageUrl = variation.images[0];
              }
              // Fall back to product image
              if (!imageUrl) {
                imageUrl = productData.primaryImage ?? productData.imageUrl ?? productData.images?.[0] ?? null;
              }
            }
          } catch {
            // Image is non-critical — proceed without it
          }
        }

        const orderItem = {
          variationId: parseInt(metadata.variationId || '0', 10),
          productId,
          name: item.description || 'Unknown Product',
          variation: metadata.variation || null,
          manufacturerNo: metadata.manufacturerNo || null,
          imageUrl,
          quantity,
          price: unitPrice, // Base price per unit (cents)
          tax: unitTax,     // Tax per unit (cents)
        };

        console.log(`   Item ${index + 1}: ${orderItem.name} (x${orderItem.quantity}) - Price: $${(orderItem.price / 100).toFixed(2)}, Tax: $${(orderItem.tax / 100).toFixed(2)}`);
        console.log(`      ProductId: ${productId}, VariationId: ${variationId}, Image: ${orderItem.imageUrl ? orderItem.imageUrl.substring(0, 50) + '...' : 'None found'}`);

        return orderItem;
      }));

      // Calculate totals (Stripe amounts are in cents)
      const subtotal = fullSession.amount_subtotal || 0;
      const shippingCost = fullSession.total_details?.amount_shipping || 0;
      const tax = fullSession.total_details?.amount_tax || 0;
      const total = fullSession.amount_total || 0;

      console.log('\n[WEBHOOK] Order Totals:');
      console.log(`   Subtotal: $${(subtotal / 100).toFixed(2)}`);
      console.log(`   Shipping: $${(shippingCost / 100).toFixed(2)}`);
      console.log(`   Tax: $${(tax / 100).toFixed(2)}`);
      console.log(`   Total: $${(total / 100).toFixed(2)}`);

      // Create order in OneApp database
      console.log('\n[WEBHOOK] Calling createOrder function...');
      const result = await createOrder({
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        customerEmail,
        items: orderItems,
        subtotal,
        shippingCost,
        tax,
        total,
        shippingAddress: {
          name: shippingDetails.name || '',
          line1: shippingDetails.address.line1 || '',
          line2: shippingDetails.address.line2 || null,
          city: shippingDetails.address.city || '',
          state: shippingDetails.address.state || '',
          postalCode: shippingDetails.address.postal_code || '',
          country: shippingDetails.address.country || 'US',
        },
        phoneNumber: fullSession.customer_details?.phone || undefined,
      });

      if (result) {
        console.log(`\n[WEBHOOK] ============================================`);
        console.log(`[WEBHOOK] Order Created Successfully!`);
        console.log(`[WEBHOOK] Order Number: ${result.orderNumber}`);
        console.log(`[WEBHOOK] Order ID: ${result.orderId}`);
        console.log(`[WEBHOOK] ============================================\n`);

        // Send order confirmation email
        console.log(`[WEBHOOK] Sending order confirmation email...`);
        const emailResult = await sendOrderConfirmationEmail({
          customerEmail,
          customerName: shippingDetails.name || 'Valued Customer',
          orderNumber: result.orderNumber,
          shippingAddress: {
            name: shippingDetails.name || '',
            line1: shippingDetails.address.line1 || '',
            line2: shippingDetails.address.line2 || null,
            city: shippingDetails.address.city || '',
            state: shippingDetails.address.state || '',
            postalCode: shippingDetails.address.postal_code || '',
            country: shippingDetails.address.country || 'US',
          },
          items: orderItems.map(item => ({
            name: item.name,
            variationName: item.variation || undefined,
            sku: item.manufacturerNo || undefined,
            imageUrl: item.imageUrl || undefined,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          shippingCost,
          tax,
          total,
        });

        if (emailResult.success) {
          console.log(`[WEBHOOK] Order confirmation email sent! ID: ${emailResult.messageId}`);
        } else {
          console.error(`[WEBHOOK] Failed to send confirmation email: ${emailResult.error}`);
        }

        return NextResponse.json({
          received: true,
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          emailSent: emailResult.success,
        });
      } else {
        console.error('\n[WEBHOOK] ============================================');
        console.error('[WEBHOOK] Failed to create order!');
        console.error(`[WEBHOOK] Session ID: ${session.id}`);
        console.error('[WEBHOOK] Check logs above for error details');
        console.error('[WEBHOOK] ============================================\n');

        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }
    }

    // Handle other event types if needed
    console.log(`\n[WEBHOOK] Unhandled event type: ${event.type}`);
    console.log('[WEBHOOK] This event was received but not processed\n');
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('\n[WEBHOOK] ============================================');
    console.error('[WEBHOOK] Critical Error Processing Webhook!');
    console.error('[WEBHOOK] ============================================');
    console.error(error);
    console.error('[WEBHOOK] ============================================\n');

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
