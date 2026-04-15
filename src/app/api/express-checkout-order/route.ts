import { type NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";

/**
 * Express Checkout Order API Route -- proxies order creation to OneApp.
 *
 * This storefront is READ-ONLY on the database. Order creation is handled
 * by OneApp's storefront-create endpoint. This route adds storeId and
 * companyId from server env (avoiding client-side exposure and CORS issues).
 */

const ONEAPP_API_URL = process.env.ONEAPP_API_URL || "http://localhost:3001";
const STOREFRONT_COMPANY_ID = process.env.STOREFRONT_COMPANY_ID
  ? Number(process.env.STOREFRONT_COMPANY_ID)
  : null;
const STOREFRONT_STORE_ID = process.env.STOREFRONT_STORE_ID
  ? Number(process.env.STOREFRONT_STORE_ID)
  : null;

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, "checkout");

  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be an object" },
        { status: 400 },
      );
    }

    const {
      stripePaymentIntentId,
      customerEmail,
      paymentMethod,
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress,
    } = body as Record<string, unknown>;

    // Validate required fields
    if (!stripePaymentIntentId || typeof stripePaymentIntentId !== "string") {
      return NextResponse.json(
        { error: "stripePaymentIntentId is required" },
        { status: 400 },
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 },
      );
    }
    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json(
        { error: "valid total is required" },
        { status: 400 },
      );
    }

    if (!STOREFRONT_COMPANY_ID || !STOREFRONT_STORE_ID) {
      console.error(
        "[EXPRESS_CHECKOUT] Missing STOREFRONT_COMPANY_ID or STOREFRONT_STORE_ID",
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Forward to OneApp with server-side IDs
    const oneappUrl = `${ONEAPP_API_URL}/api/v1/orders/storefront-create`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(oneappUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        stripePaymentIntentId,
        customerEmail: customerEmail || "express-checkout@tntfirstaid.com",
        paymentMethod,
        items,
        subtotal,
        shippingCost,
        tax,
        total,
        shippingAddress,
        storeId: STOREFRONT_STORE_ID,
        companyId: STOREFRONT_COMPANY_ID,
      }),
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      console.error("[EXPRESS_CHECKOUT] OneApp error:", data.error || data);
      return NextResponse.json(
        { error: data.error || "Failed to create order" },
        { status: response.status >= 400 ? response.status : 500 },
      );
    }

    return NextResponse.json({
      orderId: data.orderId,
      orderNumber: data.orderNumber,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[EXPRESS_CHECKOUT] OneApp request timed out");
      return NextResponse.json(
        { error: "Order creation timed out" },
        { status: 504 },
      );
    }
    console.error(
      "[EXPRESS_CHECKOUT] Error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
