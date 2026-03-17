/**
 * Order Management
 * All order operations proxy through the OneApp Storefront API.
 * No direct database access.
 */
import { getApiClient } from './api-client';

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

export type { OrderItemInput, ShippingAddress, CreateOrderInput };

/**
 * Create an order by proxying to OneApp API
 */
export async function createOrder(input: CreateOrderInput): Promise<{ orderId: number; orderNumber: string } | null> {
  console.log('\n[ORDER] Creating order via OneApp...');
  console.log(`[ORDER] Session ID: ${input.stripeSessionId}`);
  console.log(`[ORDER] Customer Email: ${input.customerEmail}`);
  console.log(`[ORDER] Items Count: ${input.items.length}`);
  console.log(`[ORDER] Total: $${(input.total / 100).toFixed(2)}`);

  try {
    const api = getApiClient();
    const result = await api.post<any>('/orders/storefront-create', input);

    if (!result || !result.orderId) {
      console.error('[ORDER] OneApp returned invalid result:', result);
      return null;
    }

    console.log(`[ORDER] Order created successfully!`);
    console.log(`[ORDER] Order ID: ${result.orderId}`);
    console.log(`[ORDER] Order Number: ${result.orderNumber}`);

    return {
      orderId: result.orderId,
      orderNumber: result.orderNumber,
    };
  } catch (error) {
    console.error('[ORDER] OneApp fetch error:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Get order by Stripe payment intent ID via OneApp API
 */
export async function getOrderByPaymentIntent(paymentIntentId: string): Promise<any | null> {
  try {
    const api = getApiClient();
    const order = await api.getOrderBySession(paymentIntentId);
    return order || null;
  } catch (error) {
    console.error('Error getting order by payment intent:', error);
    return null;
  }
}

/**
 * @deprecated Use getOrderByPaymentIntent instead.
 */
export async function getOrderByStripeSession(sessionId: string): Promise<any | null> {
  try {
    const api = getApiClient();
    const order = await api.getOrderBySession(sessionId);
    return order || null;
  } catch (error) {
    console.error('Error getting order by Stripe session:', error);
    return null;
  }
}

/**
 * Get order by ID via OneApp API
 */
export async function getOrderById(orderId: number): Promise<any | null> {
  try {
    const api = getApiClient();
    const order = await api.get<any>(`/orders/${orderId}`);
    return order || null;
  } catch (error) {
    console.error('Error getting order by ID:', error);
    return null;
  }
}
