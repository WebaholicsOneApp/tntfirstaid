/**
 * Email Service using Resend
 * Sends order notification emails to customers
 */
import { Resend } from "resend";
import { orderShippedTemplate } from "./templates/order-shipped";
import { orderDeliveredTemplate } from "./templates/order-delivered";
import { orderConfirmedTemplate } from "./templates/order-confirmed";
import type { FulfillmentStatus } from "~/types/fulfillment";

// Lazy initialize Resend to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface OrderEmailData {
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
    variationName?: string;
    sku?: string;
    imageUrl?: string;
    quantity: number;
    price: number; // in cents
  }[];
}

/**
 * Get the tracking URL for a carrier
 */
function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const carrierUrls: Record<string, string> = {
    UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    FEDEX: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  };

  const normalizedCarrier = carrier.toUpperCase();
  return (
    carrierUrls[normalizedCarrier] ||
    `https://www.google.com/search?q=${trackingNumber}+tracking`
  );
}

/**
 * Send order notification email
 */
export async function sendOrderEmail(
  data: OrderEmailData,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
  const storeName = process.env.STORE_NAME || "Alpha Munitions";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://alphamunitions.com";

  try {
    // Generate tracking URL if available
    const trackingUrl =
      data.trackingNumber && data.carrier
        ? getTrackingUrl(data.carrier, data.trackingNumber)
        : undefined;

    // Select template based on status
    const { subject, html } =
      data.status === "SHIPPED"
        ? orderShippedTemplate({
            customerName: data.customerName,
            orderId: data.orderId,
            trackingNumber: data.trackingNumber,
            carrier: data.carrier,
            trackingUrl,
            estimatedDelivery: data.estimatedDelivery,
            shippingAddress: data.shippingAddress,
            items: data.items,
            storeName,
            siteUrl,
          })
        : orderDeliveredTemplate({
            customerName: data.customerName,
            orderId: data.orderId,
            shippingAddress: data.shippingAddress,
            items: data.items,
            storeName,
            siteUrl,
          });

    console.log(
      `[EMAIL] Sending ${data.status} email to ${data.customerEmail}`,
    );

    const result = await getResend().emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: data.customerEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error("[EMAIL] Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[EMAIL] Email sent successfully. ID: ${result.data?.id}`);
    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error("[EMAIL] Error sending email:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Order confirmation email data
 */
export interface OrderConfirmationEmailData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: {
    name: string;
    variationName?: string;
    sku?: string;
    imageUrl?: string;
    quantity: number;
    price: number; // in cents
    downloadUrl?: string;
  }[];
  subtotal: number; // in cents
  shippingCost: number; // in cents
  tax: number; // in cents
  total: number; // in cents
  isDigitalOnly?: boolean;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  data: OrderConfirmationEmailData,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
  const storeName = process.env.STORE_NAME || "Alpha Munitions";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://alphamunitions.com";

  try {
    const { subject, html } = orderConfirmedTemplate({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      customerEmail: data.customerEmail,
      shippingAddress: data.shippingAddress
        ? {
            name: data.shippingAddress.name,
            line1: data.shippingAddress.line1,
            line2: data.shippingAddress.line2 || undefined,
            city: data.shippingAddress.city,
            state: data.shippingAddress.state,
            postalCode: data.shippingAddress.postalCode,
            country: data.shippingAddress.country,
          }
        : undefined,
      items: data.items,
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      tax: data.tax,
      total: data.total,
      isDigitalOnly: data.isDigitalOnly,
      storeName,
      siteUrl,
    });

    console.log(
      `[EMAIL] Sending order confirmation email to ${data.customerEmail}`,
    );

    const result = await getResend().emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: data.customerEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error("[EMAIL] Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log(
      `[EMAIL] Order confirmation email sent successfully. ID: ${result.data?.id}`,
    );
    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error("[EMAIL] Error sending order confirmation email:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
