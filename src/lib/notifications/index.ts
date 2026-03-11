/**
 * Notifications Service
 * Orchestrates sending order notifications via email
 */

import { sendOrderEmail, type OrderEmailData } from './email-service';
import type { FulfillmentStatus } from '~/types/fulfillment';

interface SendNotificationParams {
  status: FulfillmentStatus;
  customerEmail: string;
  customerName: string;
  orderId: number;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: {
    name: string;
    imageUrl?: string;
    quantity: number;
    price: number;
  }[];
}

/**
 * Send order notification based on fulfillment status
 */
export async function sendOrderNotification(params: SendNotificationParams): Promise<void> {
  console.log(`[NOTIFICATION] Sending ${params.status} notification for order ${params.orderId}`);

  const emailData: OrderEmailData = {
    status: params.status,
    customerEmail: params.customerEmail,
    customerName: params.customerName,
    orderId: params.orderId,
    trackingNumber: params.trackingNumber,
    carrier: params.carrier,
    estimatedDelivery: params.estimatedDelivery,
    shippingAddress: params.shippingAddress,
    items: params.items,
  };

  const result = await sendOrderEmail(emailData);

  if (result.success) {
    console.log(`[NOTIFICATION] Email sent successfully for order ${params.orderId}`);
  } else {
    console.error(`[NOTIFICATION] Failed to send email for order ${params.orderId}: ${result.error}`);
    throw new Error(result.error);
  }
}

export { sendOrderEmail } from './email-service';
export type { OrderEmailData } from './email-service';
