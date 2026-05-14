/**
 * POST /api/notifications/abandoned-cart
 *
 * Webhook called by OneApp when a captured cart (see /checkout/capture-cart)
 * has been abandoned. Storefront renders the recovery email template and
 * sends via Resend. Authenticated via Bearer token using ONEAPP_WEBHOOK_SECRET.
 *
 * Expected payload (JSON):
 *   {
 *     "customerEmail": "buyer@example.com",
 *     "customerName": "Sam Smith",   // optional
 *     "items": [
 *       {
 *         "name": "Loggers First Aid Kit",
 *         "variationName": "Standard",   // optional
 *         "sku": "TNT-LOG-01",           // optional
 *         "imageUrl": "https://...",     // optional
 *         "productSlug": "loggers-first-aid-kit", // optional, used to deep-link
 *         "quantity": 1,
 *         "price": 4999                  // cents
 *       }
 *     ],
 *     "subtotal": 4999,                  // cents
 *     "incentiveCode": "COMEBACK10",     // optional
 *     "incentiveDescription": "Save 10% on your order"  // optional
 *   }
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { sendAbandonedCartEmail } from "~/lib/notifications/email-service";

interface AbandonedCartPayload {
  customerEmail: string;
  customerName?: string;
  items: Array<{
    name: string;
    variationName?: string;
    sku?: string;
    imageUrl?: string;
    productSlug?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  incentiveCode?: string;
  incentiveDescription?: string;
}

function isValidPayload(p: unknown): p is AbandonedCartPayload {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  if (typeof o.customerEmail !== "string" || !o.customerEmail.includes("@"))
    return false;
  if (!Array.isArray(o.items) || o.items.length === 0) return false;
  if (typeof o.subtotal !== "number" || o.subtotal < 0) return false;
  for (const item of o.items) {
    if (!item || typeof item !== "object") return false;
    const it = item as Record<string, unknown>;
    if (typeof it.name !== "string" || !it.name.trim()) return false;
    if (typeof it.quantity !== "number" || it.quantity <= 0) return false;
    if (typeof it.price !== "number" || it.price < 0) return false;
  }
  return true;
}

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.ONEAPP_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error(
        "[abandoned-cart] ONEAPP_WEBHOOK_SECRET is not configured",
      );
      return NextResponse.json(
        { success: false, error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    const hdrs = await headers();
    const authHeader = hdrs.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      console.warn("[abandoned-cart] Invalid or missing authorization header");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const raw = (await req.json().catch(() => null)) as unknown;
    if (!isValidPayload(raw)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    const payload = raw;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://tntfirstaid.com";
    const recoveryUrl = `${siteUrl.replace(/\/$/, "")}/cart?utm_source=email&utm_medium=lifecycle&utm_campaign=abandoned_cart`;

    const result = await sendAbandonedCartEmail({
      customerEmail: payload.customerEmail,
      customerName: payload.customerName,
      items: payload.items,
      subtotal: payload.subtotal,
      recoveryUrl,
      incentiveCode: payload.incentiveCode,
      incentiveDescription: payload.incentiveDescription,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Send failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (err) {
    console.error("[abandoned-cart] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 },
    );
  }
}
