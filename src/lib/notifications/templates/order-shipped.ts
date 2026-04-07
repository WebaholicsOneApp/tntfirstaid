/**
 * Order Shipped Email Template
 * Branding: Gold (#C4A035) and Charcoal (#1A1A1A)
 */

interface OrderShippedTemplateData {
  customerName: string;
  orderId: number;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
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
  storeName: string;
  siteUrl: string;
}

export function orderShippedTemplate(data: OrderShippedTemplateData): {
  subject: string;
  html: string;
} {
  const subject = `Your ${data.storeName} Order Has Shipped! - Order #${data.orderId}`;

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; width: 60px; vertical-align: middle;">
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; background-color: #f9fafb;" />`
              : `<div style="width: 50px; height: 50px; background-color: #f3f4f6; border-radius: 4px;"></div>`
          }
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">
          ${item.name}
          ${item.variationName ? `<br><span style="color: #6b7280; font-size: 13px;">${item.variationName}</span>` : ""}
          ${item.sku ? `<br><span style="color: #9ca3af; font-size: 12px;">SKU: ${item.sku}</span>` : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: middle;">$${(item.price / 100).toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  const trackingSection = data.trackingNumber
    ? `
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Tracking Information</h3>
        <p style="margin: 0 0 8px 0; color: #6b7280;">
          <strong>Carrier:</strong> ${data.carrier || "N/A"}
        </p>
        <p style="margin: 0 0 16px 0; color: #6b7280;">
          <strong>Tracking Number:</strong> ${data.trackingNumber}
        </p>
        ${
          data.trackingUrl
            ? `<a href="${data.trackingUrl}" style="display: inline-block; background-color: #C4A035; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Track Your Package</a>`
            : ""
        }
        ${
          data.estimatedDelivery
            ? `<p style="margin: 16px 0 0 0; color: #6b7280;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>`
            : ""
        }
      </div>
    `
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: #1A1A1A; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #C4A035; letter-spacing: -0.5px;">${data.storeName}</h1>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

      <h2 style="margin: 0 0 16px 0; color: #1A1A1A; font-size: 20px; text-align: center;">Your Order Has Shipped!</h2>

      <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${data.customerName},<br><br>
        Great news! Your order #${data.orderId} has been shipped and is on its way to you.
      </p>

      ${trackingSection}

      <!-- Shipping Address -->
      <div style="margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Shipping To</h3>
        <p style="margin: 0; color: #6b7280; line-height: 1.6;">
          ${data.shippingAddress.name}<br>
          ${data.shippingAddress.line1}<br>
          ${data.shippingAddress.line2 ? `${data.shippingAddress.line2}<br>` : ""}
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
          ${data.shippingAddress.country}
        </p>
      </div>

      <!-- Order Items -->
      <div style="margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; border-bottom: 2px solid #e5e7eb; width: 60px;"></th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; color: #374151;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <p style="color: #6b7280; line-height: 1.6; margin: 24px 0 0 0;">
        Thank you for shopping with ${data.storeName}! If you have any questions about your order, please don't hesitate to contact us.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 24px; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        This email was sent regarding order #${data.orderId}
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
