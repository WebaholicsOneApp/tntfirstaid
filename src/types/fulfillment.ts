/**
 * Types for order fulfillment notifications from OneApp
 */

export type FulfillmentStatus = "SHIPPED" | "DELIVERED";

export interface FulfillmentItem {
  orderItemId: number;
  trackingNumber: string;
  carrier: string;
  trackedBy?: number;
}

export interface FulfillmentPayload {
  orderId: number;
  status: FulfillmentStatus;
  items: FulfillmentItem[];
  estimatedDelivery?: string;
  timestamp: string;
}

export interface FulfillmentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface OrderWithCustomerInfo {
  id: number;
  channelId: number;
  orderStatus: string;
  shippingName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  customerEmail?: string;
}

export interface NotificationConfig {
  email: boolean;
  template: "order-shipped" | "order-delivered";
}
