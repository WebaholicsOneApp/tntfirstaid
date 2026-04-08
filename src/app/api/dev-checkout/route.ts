import { type NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";
import { calculateTax } from "~/lib/tax";

/**
 * Dev-only checkout bypass — creates orders in OneApp without Stripe.
 *
 * Triple guard:
 * 1. NODE_ENV !== 'production'
 * 2. DEV_CHECKOUT_BYPASS === 'true'
 * 3. Returns 404 (not 403) in production to hide endpoint
 */

const ONEAPP_API_URL = process.env.ONEAPP_API_URL || "http://localhost:3001";
const STOREFRONT_COMPANY_ID = process.env.STOREFRONT_COMPANY_ID
  ? Number(process.env.STOREFRONT_COMPANY_ID)
  : null;
const STOREFRONT_STORE_ID = process.env.STOREFRONT_STORE_ID
  ? Number(process.env.STOREFRONT_STORE_ID)
  : null;

function isDevBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_CHECKOUT_BYPASS === "true"
  );
}

interface DevCheckoutItem {
  variationId: number;
  productId: number;
  name: string;
  variation?: string | null;
  manufacturerNo?: string | null;
  imageUrl?: string | null;
  quantity: number;
  price: number;
}

interface DevCheckoutBody {
  customerEmail: string;
  items: DevCheckoutItem[];
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  sendEmail?: boolean;
}

export async function POST(request: NextRequest) {
  if (!isDevBypassEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

    const { customerEmail, items, shippingAddress, sendEmail } =
      body as DevCheckoutBody;

    if (!customerEmail || typeof customerEmail !== "string") {
      return NextResponse.json(
        { error: "customerEmail is required" },
        { status: 400 },
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 },
      );
    }
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json(
        { error: "shippingAddress is required" },
        { status: 400 },
      );
    }

    if (!STOREFRONT_COMPANY_ID || !STOREFRONT_STORE_ID) {
      console.error(
        "[DEV_CHECKOUT] Missing STOREFRONT_COMPANY_ID or STOREFRONT_STORE_ID",
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Calculate totals from items
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = calculateTax(subtotal, shippingAddress.state);
    const total = subtotal + tax;

    // Generate fake Stripe-like IDs
    const fakeSessionId = `test_session_${Date.now()}`;
    const fakePaymentIntentId = `test_pi_${Date.now()}`;

    const oneappUrl = `${ONEAPP_API_URL}/api/v1/orders/storefront-create`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(oneappUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        stripeSessionId: fakeSessionId,
        stripePaymentIntentId: fakePaymentIntentId,
        customerEmail,
        paymentMethod: "dev_bypass",
        items: items.map((item) => ({
          variationId: item.variationId,
          productId: item.productId,
          name: item.name,
          variation: item.variation || null,
          manufacturerNo: item.manufacturerNo || null,
          imageUrl: item.imageUrl || null,
          quantity: item.quantity,
          price: item.price,
          tax: calculateTax(item.price * item.quantity, shippingAddress.state),
        })),
        subtotal,
        shippingCost: 0,
        tax,
        total,
        shippingAddress,
        storeId: STOREFRONT_STORE_ID,
        companyId: STOREFRONT_COMPANY_ID,
        sendEmail: sendEmail ?? false,
      }),
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      console.error("[DEV_CHECKOUT] OneApp error:", data.error || data);
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
      console.error("[DEV_CHECKOUT] OneApp request timed out");
      return NextResponse.json(
        { error: "Order creation timed out" },
        { status: 504 },
      );
    }
    console.error(
      "[DEV_CHECKOUT] Error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
