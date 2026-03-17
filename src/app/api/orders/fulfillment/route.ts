import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getApiClient } from '~/lib/api-client';
import { sendOrderNotification } from '~/lib/notifications';
import type { FulfillmentPayload, FulfillmentResponse, OrderWithCustomerInfo } from '~/types/fulfillment';

function isValidProductImage(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('placeholder')) return false;
  if (lowerUrl.includes('no-image')) return false;
  if (lowerUrl.includes('noimage')) return false;
  return true;
}

/**
 * Domain reliability scoring for image URLs.
 * Lower score = more reliable. Used to pick the best image when multiple are available.
 */
function getImageDomainScore(url: string): number {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('rockymountainatvmc.com')) return 1;
  if (lowerUrl.includes('wpsstatic.com')) return 2;
  if (lowerUrl.includes('walmartimages.com')) return 2;
  if (lowerUrl.includes('media-amazon.com')) return 3;
  if (lowerUrl.includes('cloudfront.net')) return 4;
  if (lowerUrl.includes('shopify.com')) return 8;
  if (lowerUrl.includes('ebayimg.com')) return 10;
  if (lowerUrl.includes('ebay.com')) return 10;
  return 6;
}

async function getProductImage(productId: number, variationId: number | null): Promise<string | null> {
  try {
    const api = getApiClient();
    const response = await api.getProductBySlug<any>(`__id_${productId}`).catch(async () => {
      // Fall back to products endpoint with productId filter
      return api.get<any>('/products', { productIds: String(productId), limit: 1 });
    });

    // Try to extract image from the API response
    const product = response?.product ?? response?.data?.[0] ?? response;
    if (!product) return null;

    // Try variation-specific image first
    if (variationId && product.variations) {
      const variation = product.variations.find((v: any) => v.id === variationId);
      if (variation?.images?.length) {
        const validUrls = variation.images.filter(isValidProductImage);
        if (validUrls.length > 0) {
          validUrls.sort((a: string, b: string) => getImageDomainScore(a) - getImageDomainScore(b));
          return validUrls[0];
        }
      }
    }

    // Fall back to product-level image
    if (product.images?.length) {
      const validUrls = product.images.filter(isValidProductImage);
      if (validUrls.length > 0) {
        validUrls.sort((a: string, b: string) => getImageDomainScore(a) - getImageDomainScore(b));
        return validUrls[0];
      }
    }

    // Fall back to primaryImage
    if (product.primaryImage && isValidProductImage(product.primaryImage)) {
      return product.primaryImage;
    }
    if (product.imageUrl && isValidProductImage(product.imageUrl)) {
      return product.imageUrl;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * POST /api/orders/fulfillment
 *
 * Webhook endpoint called by OneApp when order status changes.
 * Sends email notifications to customers.
 */
export async function POST(req: Request): Promise<NextResponse<FulfillmentResponse>> {
  console.log('\n========================================');
  console.log('[FULFILLMENT] Webhook Received');
  console.log('========================================\n');

  try {
    // 1. Verify webhook secret
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const webhookSecret = process.env.ONEAPP_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[FULFILLMENT] ONEAPP_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      console.error('[FULFILLMENT] Invalid or missing authorization header');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[FULFILLMENT] Authorization verified');

    // 2. Parse request body
    const payload: FulfillmentPayload = await req.json();
    console.log(`[FULFILLMENT] Order ID: ${payload.orderId}`);
    console.log(`[FULFILLMENT] Status: ${payload.status}`);
    console.log(`[FULFILLMENT] Items: ${payload.items?.length || 0}`);

    // 3. Validate payload
    if (!payload.orderId || !payload.status) {
      console.error('[FULFILLMENT] Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing orderId or status' },
        { status: 400 }
      );
    }

    if (!['SHIPPED', 'DELIVERED'].includes(payload.status)) {
      console.error(`[FULFILLMENT] Invalid status: ${payload.status}`);
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be SHIPPED or DELIVERED' },
        { status: 400 }
      );
    }

    // 4. Look up order via OneApp API
    let order: OrderWithCustomerInfo | undefined;
    try {
      const api = getApiClient();
      const orderData = await api.get<any>(`/orders/${payload.orderId}`);
      if (orderData && orderData.id) {
        order = orderData as OrderWithCustomerInfo;
      }
    } catch {
      // order not found
    }

    if (!order) {
      console.error(`[FULFILLMENT] Order ${payload.orderId} not found`);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`[FULFILLMENT] Order found: ${order.id}`);
    console.log(`[FULFILLMENT] Current status: ${order.orderStatus}`);

    // 5. Extract customer email from order data
    const customerEmail = (order as any).customerEmail ?? (order as any).email;

    if (!customerEmail) {
      console.warn(`[FULFILLMENT] No customer email found for order ${payload.orderId}`);
      return NextResponse.json({
        success: true,
        message: `No customer email for order ${payload.orderId} - notification skipped`,
      });
    }

    console.log(`[FULFILLMENT] Customer email: ${customerEmail}`);

    // 6. Get order items with images
    const rawItems: any[] = (order as any).items ?? payload.items ?? [];
    const itemsWithImages = await Promise.all(
      rawItems.map(async (item: any) => {
        const imageUrl = await getProductImage(item.productId, item.variationId);
        return {
          name: item.productName || item.name || item.listingSku,
          variationName: item.variationName || item.variation || undefined,
          sku: item.listingSku || item.sku || undefined,
          imageUrl: imageUrl || undefined,
          quantity: item.quantity,
          price: item.itemPrice || item.price,
        };
      })
    );

    await sendOrderNotification({
      status: payload.status,
      customerEmail,
      customerName: order.shippingName,
      orderId: payload.orderId,
      trackingNumber: payload.items?.[0]?.trackingNumber,
      carrier: payload.items?.[0]?.carrier,
      estimatedDelivery: payload.estimatedDelivery,
      shippingAddress: {
        name: order.shippingName,
        line1: order.addressLine1,
        line2: order.addressLine2 || undefined,
        city: order.city,
        state: order.state,
        postalCode: order.zipCode,
        country: order.country,
      },
      items: itemsWithImages,
    });
    console.log('[FULFILLMENT] Email notification sent to:', customerEmail);

    console.log('\n========================================');
    console.log('[FULFILLMENT] Webhook Processed Successfully');
    console.log('========================================\n');

    return NextResponse.json({
      success: true,
      message: `Notification sent for order ${payload.orderId} (${payload.status})`,
    });

  } catch (error) {
    console.error('\n========================================');
    console.error('[FULFILLMENT] Error Processing Webhook');
    console.error('========================================');
    console.error(error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
