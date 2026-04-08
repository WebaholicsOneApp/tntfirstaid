/**
 * Order Confirmed Email Template
 * Branding: Gold (#C4A035) and Charcoal (#1A1A1A)
 */

interface OrderConfirmedTemplateData {
  customerName: string;
  orderNumber: string;
  customerEmail: string;
  shippingAddress?: {
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
    downloadUrl?: string;
  }[];
  subtotal: number; // in cents
  shippingCost: number; // in cents
  tax: number; // in cents
  total: number; // in cents
  isDigitalOnly?: boolean;
  storeName: string;
  siteUrl: string;
}

export function orderConfirmedTemplate(data: OrderConfirmedTemplateData): {
  subject: string;
  html: string;
} {
  const subject = `Order Confirmed - ${data.orderNumber} | ${data.storeName}`;

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
          ${item.downloadUrl ? `<br><a href="${item.downloadUrl}" style="display: inline-block; margin-top: 6px; padding: 4px 12px; background-color: #C4A035; color: #ffffff; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 4px;">Download</a>` : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: middle;">$${(item.price / 100).toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  const addr = data.shippingAddress;
  const shippingHtml =
    !data.isDigitalOnly && addr
      ? `<div style="margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Shipping To</h3>
        <p style="margin: 0; color: #6b7280; line-height: 1.6;">
          ${addr.name}<br>
          ${addr.line1}<br>
          ${addr.line2 ? `${addr.line2}<br>` : ""}
          ${addr.city}, ${addr.state} ${addr.postalCode}<br>
          ${addr.country}
        </p>
      </div>`
      : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: #1A1A1A; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #C4A035; letter-spacing: -0.5px;">${data.storeName}</h1>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

      <h2 style="margin: 0 0 8px 0; color: #1A1A1A; font-size: 24px; text-align: center;">Order Confirmed!</h2>
      <p style="margin: 0 0 24px 0; color: #6b7280; text-align: center; font-size: 16px;">
        Order ${data.orderNumber}
      </p>

      <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${data.customerName},<br><br>
        ${data.isDigitalOnly ? "Thank you for your order! We've received your payment and your download is ready. You'll find the download link below in your order summary." : "Thank you for your order! We've received your payment and are preparing your items for shipment. You'll receive another email with tracking information once your order ships."}
      </p>

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

      <!-- Order Totals -->
      <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Subtotal</td>
            <td style="padding: 4px 0; text-align: right; color: #374151;">$${(data.subtotal / 100).toFixed(2)}</td>
          </tr>
          ${
            !data.isDigitalOnly
              ? `<tr>
            <td style="padding: 4px 0; color: #6b7280;">Shipping</td>
            <td style="padding: 4px 0; text-align: right; color: #374151;">$${(data.shippingCost / 100).toFixed(2)}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Tax</td>
            <td style="padding: 4px 0; text-align: right; color: #374151;">$${(data.tax / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0 0; color: #1A1A1A; font-weight: 600; border-top: 1px solid #e5e7eb;">Total</td>
            <td style="padding: 8px 0 0 0; text-align: right; color: #1A1A1A; font-weight: 600; font-size: 18px; border-top: 1px solid #e5e7eb;">$${(data.total / 100).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      ${shippingHtml}

      <p style="color: #6b7280; line-height: 1.6; margin: 24px 0 0 0;">
        If you have any questions about your order, please don't hesitate to contact us.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 24px; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        This email was sent to ${data.customerEmail}
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
