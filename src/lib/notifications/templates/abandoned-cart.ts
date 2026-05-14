/**
 * Abandoned Cart Recovery Email Template
 * Sent when a customer captures a cart at /api/checkout but doesn't complete checkout.
 * Branding: Gold (#C4A035) and Charcoal (#1A1A1A) — matches order-confirmed template.
 */

interface AbandonedCartTemplateData {
  customerName?: string;
  customerEmail: string;
  items: {
    name: string;
    variationName?: string;
    sku?: string;
    imageUrl?: string;
    quantity: number;
    price: number; // cents
    productSlug?: string;
  }[];
  subtotal: number; // cents
  recoveryUrl: string;
  storeName: string;
  siteUrl: string;
  /** Optional discount code to incentivize completion. */
  incentiveCode?: string;
  incentiveDescription?: string;
}

export function abandonedCartTemplate(data: AbandonedCartTemplateData): {
  subject: string;
  html: string;
  text: string;
} {
  const firstItemName = data.items[0]?.name ?? "your kit";
  const subject =
    data.items.length === 1
      ? `Still thinking about ${firstItemName}?`
      : `You left ${data.items.length} items in your cart`;

  const baseUrl = data.siteUrl.replace(/\/$/, "");

  const itemsHtml = data.items
    .map((item) => {
      const productLink = item.productSlug
        ? `${baseUrl}/product/${item.productSlug}`
        : data.recoveryUrl;
      return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; width: 60px; vertical-align: middle;">
          ${
            item.imageUrl
              ? `<a href="${productLink}" style="text-decoration: none;"><img src="${item.imageUrl}" alt="${escapeHtml(item.name)}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; background-color: #f9fafb;" /></a>`
              : `<div style="width: 50px; height: 50px; background-color: #f3f4f6; border-radius: 4px;"></div>`
          }
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">
          <a href="${productLink}" style="color: #1A1A1A; text-decoration: none; font-weight: 600;">${escapeHtml(item.name)}</a>
          ${item.variationName ? `<br><span style="color: #6b7280; font-size: 13px;">${escapeHtml(item.variationName)}</span>` : ""}
          ${item.sku ? `<br><span style="color: #9ca3af; font-size: 12px;">SKU: ${escapeHtml(item.sku)}</span>` : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: middle;">$${(item.price / 100).toFixed(2)}</td>
      </tr>
    `;
    })
    .join("");

  const incentiveBlock =
    data.incentiveCode && data.incentiveDescription
      ? `
    <div style="margin: 24px 0; padding: 18px; border: 2px dashed #C4A035; border-radius: 8px; background-color: #FFFBEB; text-align: center;">
      <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">A little something to help you finish</p>
      <p style="margin: 0 0 4px 0; color: #1A1A1A; font-size: 22px; font-weight: 700; letter-spacing: 1px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;">${escapeHtml(data.incentiveCode)}</p>
      <p style="margin: 0; color: #6b7280; font-size: 13px;">${escapeHtml(data.incentiveDescription)}</p>
    </div>`
      : "";

  const greeting = data.customerName
    ? `Hey ${escapeHtml(data.customerName.split(" ")[0] || data.customerName)},`
    : "Hey there,";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #1A1A1A; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #C4A035; letter-spacing: -0.5px;">${escapeHtml(data.storeName)}</h1>
    </div>

    <div style="background-color: #ffffff; padding: 32px 28px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
      <p style="margin: 0 0 12px 0; color: #1A1A1A; font-size: 16px;">${greeting}</p>
      <p style="margin: 0 0 18px 0; color: #374151; font-size: 16px; line-height: 1.6;">
        Your cart is still here. We saved everything so you can pick up where you left off &mdash; no need to start over.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${data.recoveryUrl}" style="display: inline-block; background-color: #C4A035; color: #1A1A1A; padding: 14px 32px; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 6px; letter-spacing: 0.5px;">Return to Your Cart</a>
      </div>

      ${incentiveBlock}

      <h3 style="margin: 24px 0 12px 0; color: #374151; font-size: 16px;">What you left behind</h3>
      <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #e5e7eb;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;"></th>
            <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Item</th>
            <th style="padding: 10px 12px; text-align: center; color: #6b7280; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Qty</th>
            <th style="padding: 10px 12px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 14px 12px; text-align: right; color: #1A1A1A; font-weight: 600;">Subtotal</td>
            <td style="padding: 14px 12px; text-align: right; color: #1A1A1A; font-weight: 700;">$${(data.subtotal / 100).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p style="margin: 28px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
        Have a question? Reply to this email or reach our team at
        <a href="mailto:jeffm@tntfirstaid.com" style="color: #C4A035; text-decoration: none;">jeffm@tntfirstaid.com</a>.
        We&rsquo;re happy to help.
      </p>

      <p style="margin: 18px 0 0 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
        You&rsquo;re receiving this because you started a checkout at ${escapeHtml(data.storeName)} with this email
        (${escapeHtml(data.customerEmail)}). If you didn&rsquo;t, you can safely ignore this email.
      </p>
    </div>

    <p style="text-align: center; margin: 16px 0 0 0; color: #9ca3af; font-size: 11px;">
      &copy; ${new Date().getFullYear()} ${escapeHtml(data.storeName)}. All rights reserved.
    </p>
  </div>
</body>
</html>`;

  const text = [
    `${greeting}`,
    "",
    `Your ${escapeHtml(data.storeName)} cart is still here. Pick up where you left off:`,
    data.recoveryUrl,
    "",
    "What you left behind:",
    ...data.items.map(
      (i) =>
        `  - ${i.name}${i.variationName ? ` (${i.variationName})` : ""} x${i.quantity} — $${(i.price / 100).toFixed(2)}`,
    ),
    "",
    `Subtotal: $${(data.subtotal / 100).toFixed(2)}`,
    data.incentiveCode && data.incentiveDescription
      ? `\nUse code ${data.incentiveCode} — ${data.incentiveDescription}\n`
      : "",
    "Questions? jeffm@tntfirstaid.com",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
