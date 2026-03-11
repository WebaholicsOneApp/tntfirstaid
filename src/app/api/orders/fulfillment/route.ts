import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { pgKnex as knex, STOREFRONT_CHANNEL_ID, tableNames } from '~/lib/db';
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
  // 1. Try the specific variation image
  if (variationId) {
    const varImage = await knex(tableNames.variationImages)
      .select('imageUrl')
      .where('variationId', variationId)
      .whereNull('deletedAt')
      .first();
    if (varImage?.imageUrl) {
      const url = Array.isArray(varImage.imageUrl) ? varImage.imageUrl[0] : varImage.imageUrl;
      if (url && isValidProductImage(url)) return url;
    }
  }

  // 2. Fall back to product-level images (sorted by domain reliability)
  if (productId) {
    const prodImages = await knex(tableNames.productImages)
      .select('imageUrl')
      .where('productId', productId)
      .whereNull('deletedAt')
      .orderBy('sortOrder', 'asc');

    const validProdUrls = prodImages
      .map((img: any) => Array.isArray(img.imageUrl) ? img.imageUrl[0] : img.imageUrl)
      .filter((url: string) => url && isValidProductImage(url));

    if (validProdUrls.length > 0) {
      validProdUrls.sort((a: string, b: string) => getImageDomainScore(a) - getImageDomainScore(b));
      return validProdUrls[0];
    }
  }

  // 3. Fall back to ALL variation images for this product (not just the specific variationId)
  if (productId) {
    const allVariationIds = await knex(tableNames.variations)
      .select('id')
      .where('productId', productId)
      .whereNull('deletedAt');

    const varIds = allVariationIds.map((v: any) => v.id);
    if (varIds.length > 0) {
      const allVarImages = await knex(tableNames.variationImages)
        .select('imageUrl')
        .whereIn('variationId', varIds)
        .whereNull('deletedAt');

      const validVarUrls = allVarImages
        .map((img: any) => Array.isArray(img.imageUrl) ? img.imageUrl[0] : img.imageUrl)
        .filter((url: string) => url && isValidProductImage(url));

      if (validVarUrls.length > 0) {
        validVarUrls.sort((a: string, b: string) => getImageDomainScore(a) - getImageDomainScore(b));
        return validVarUrls[0];
      }
    }
  }

  return null;
}

/**
 * POST /api/orders/fulfillment
 *
 * Webhook endpoint called by OneApp when order status changes.
 * Updates order status in database and sends email notifications.
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

    // 4. Look up order (must be Storefront channel)
    const order = await knex('orders')
      .select([
        'orders.id',
        'orders.channelId',
        'orders.orderStatus',
        'orders.shippingName',
        'orders.addressLine1',
        'orders.addressLine2',
        'orders.city',
        'orders.state',
        'orders.zipCode',
        'orders.country',
      ])
      .where('orders.id', payload.orderId)
      .where('orders.channelId', STOREFRONT_CHANNEL_ID)
      .first() as OrderWithCustomerInfo | undefined;

    if (!order) {
      console.error(`[FULFILLMENT] Order ${payload.orderId} not found or not a Storefront order`);
      return NextResponse.json(
        { success: false, error: 'Order not found or not a Storefront order' },
        { status: 404 }
      );
    }

    console.log(`[FULFILLMENT] Order found: ${order.id}`);
    console.log(`[FULFILLMENT] Current status: ${order.orderStatus}`);

    // 5. Get customer email from order_notes.metadata
    const orderNote = await knex('order_notes')
      .select('metadata')
      .where('orderId', payload.orderId)
      .where('type', 'system')
      .whereRaw(`metadata->>'customerEmail' IS NOT NULL`)
      .first();

    const customerEmail = orderNote?.metadata?.customerEmail;

    if (!customerEmail) {
      console.warn(`[FULFILLMENT] No customer email found for order ${payload.orderId}`);
    } else {
      console.log(`[FULFILLMENT] Customer email: ${customerEmail}`);
    }

    // Note: Database updates (order status, tracking info, order notes) are handled by OneApp
    // This webhook only sends email notifications to customers

    // 6. Send email notification
    if (!customerEmail) {
      console.log('[FULFILLMENT] No customer email - skipping notification');
      return NextResponse.json({
        success: true,
        message: `No customer email for order ${payload.orderId} - notification skipped`,
      });
    }

    // Get order items with product name and variation for email
    const orderItems = await knex('order_items')
      .select([
        'order_items.id',
        'order_items.productId',
        'order_items.variationId',
        'order_items.listingSku',
        'order_items.quantity',
        'order_items.itemPrice',
        'order_items.supplierTrackingNo',
        'order_items.supplierTrackingCarrier',
        'store_products.name as productName',
        'variations.variation as variationName',
      ])
      .leftJoin('store_products', 'store_products.id', 'order_items.productId')
      .leftJoin('variations', 'variations.id', 'order_items.variationId')
      .where('order_items.orderId', payload.orderId);

    // Fetch images for each item
    const itemsWithImages = await Promise.all(
      orderItems.map(async (item) => {
        const imageUrl = await getProductImage(item.productId, item.variationId);
        return {
          name: item.productName || item.listingSku,
          variationName: item.variationName || undefined,
          sku: item.listingSku || undefined,
          imageUrl: imageUrl || undefined,
          quantity: item.quantity,
          price: item.itemPrice,
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
