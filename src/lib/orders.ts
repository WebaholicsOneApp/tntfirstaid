/**
 * Order Management
 * Proxies order creation to OneApp (storefront is read-only)
 */
import { pgKnex as knex, STOREFRONT_COMPANY_ID, STOREFRONT_STORE_ID } from './db';

function getOneAppApiUrl(): string {
  return process.env.ONEAPP_API_URL || 'http://localhost:3001';
}

interface OrderItemInput {
  variationId: number;
  productId: number;
  name: string;
  variation?: string | null;
  manufacturerNo?: string | null;
  imageUrl?: string | null;
  quantity: number;
  price: number; // in cents (base price before tax)
  tax: number;   // in cents
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CreateOrderInput {
  stripeSessionId: string;
  stripePaymentIntentId: string;
  customerEmail: string;
  items: OrderItemInput[];
  subtotal: number; // in cents
  shippingCost: number; // in cents
  tax: number; // in cents
  total: number; // in cents
  shippingAddress: ShippingAddress;
  phoneNumber?: string;
}

/**
 * Create an order by proxying to OneApp API
 */
export async function createOrder(input: CreateOrderInput): Promise<{ orderId: number; orderNumber: string } | null> {
  console.log('\n[ORDER] Creating order via OneApp...');
  console.log(`[ORDER] Session ID: ${input.stripeSessionId}`);
  console.log(`[ORDER] Customer Email: ${input.customerEmail}`);
  console.log(`[ORDER] Items Count: ${input.items.length}`);
  console.log(`[ORDER] Total: $${(input.total / 100).toFixed(2)}`);

  // Determine store ID (read-only query is fine)
  let storeId = STOREFRONT_STORE_ID;
  if (!storeId) {
    const store = await knex('stores')
      .where('companyId', STOREFRONT_COMPANY_ID)
      .first();
    storeId = store?.id || null;
  }

  if (!storeId) {
    console.error('[ORDER] Unable to determine store ID');
    return null;
  }

  const oneAppUrl = getOneAppApiUrl();
  console.log(`[ORDER] Proxying to OneApp: ${oneAppUrl}/api/v1/orders/storefront-create`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${oneAppUrl}/api/v1/orders/storefront-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        ...input,
        storeId,
        companyId: STOREFRONT_COMPANY_ID,
      }),
    });

    clearTimeout(timeout);

    const result = await response.json();

    if (!response.ok) {
      console.error('[ORDER] OneApp error:', result.error || result);
      return null;
    }

    console.log(`[ORDER] Order created successfully!`);
    console.log(`[ORDER] Order ID: ${result.orderId}`);
    console.log(`[ORDER] Order Number: ${result.orderNumber}`);

    return {
      orderId: result.orderId,
      orderNumber: result.orderNumber,
    };
  } catch (fetchError: any) {
    clearTimeout(timeout);
    if (fetchError.name === 'AbortError') {
      console.error('[ORDER] OneApp request timed out');
    } else {
      console.error('[ORDER] OneApp fetch error:', fetchError.message);
    }
    return null;
  }
}

/**
 * Get order by Stripe payment intent ID (read-only query)
 * OneApp stores the payment intent ID in channelOrderId, not the session ID
 */
export async function getOrderByPaymentIntent(paymentIntentId: string): Promise<any | null> {
  try {
    const order = await knex('orders')
      .where('channelOrderId', paymentIntentId)
      .first();

    return order || null;
  } catch (error) {
    console.error('Error getting order by payment intent:', error);
    return null;
  }
}

/**
 * @deprecated Use getOrderByPaymentIntent instead.
 * Legacy function kept for backward compatibility with sync route.
 * Note: channelOrderId stores payment intent IDs (pi_...), not session IDs (cs_...).
 */
export async function getOrderByStripeSession(sessionId: string): Promise<any | null> {
  try {
    const order = await knex('orders')
      .where('channelOrderId', sessionId)
      .first();

    return order || null;
  } catch (error) {
    console.error('Error getting order by Stripe session:', error);
    return null;
  }
}

/**
 * Get order by ID (read-only query)
 */
export async function getOrderById(orderId: number): Promise<any | null> {
  try {
    const order = await knex('orders')
      .where('id', orderId)
      .first();

    return order || null;
  } catch (error) {
    console.error('Error getting order by ID:', error);
    return null;
  }
}
