/**
 * Manual Order Sync API
 * Use this to manually create an order from a Stripe session if the webhook failed
 *
 * POST /api/orders/sync
 * Body: { sessionId: "cs_..." }
 */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder, getOrderByStripeSession } from "~/lib/orders";
import { sendOrderConfirmationEmail } from "~/lib/notifications/email-service";
import { getApiClient } from "~/lib/api-client";

// Lazy initialize Stripe
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripe = new Stripe(apiKey, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return stripe;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    console.log(
      `\n[SYNC] Manual order sync requested for session: ${sessionId}`,
    );

    // Check if order already exists
    const existingOrder = await getOrderByStripeSession(sessionId);
    if (existingOrder) {
      console.log(`[SYNC] Order already exists: ID ${existingOrder.id}`);
      return NextResponse.json({
        success: true,
        message: "Order already exists",
        orderId: existingOrder.id,
        alreadyExisted: true,
      });
    }

    // Retrieve session from Stripe
    console.log(`[SYNC] Retrieving session from Stripe...`);
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: [
        "line_items",
        "line_items.data.price.product",
        "payment_intent",
        "shipping_cost",
      ],
    });

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      console.log(`[SYNC] Session not paid. Status: ${session.payment_status}`);
      return NextResponse.json(
        {
          success: false,
          error: `Payment not completed. Status: ${session.payment_status}`,
        },
        { status: 400 },
      );
    }

    // Extract customer information
    const customerEmail =
      session.customer_email || session.customer_details?.email || "";
    const shippingDetails = session.collected_information?.shipping_details;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || "";

    // Shipping details are required for physical orders but optional for digital-only
    const hasShipping = shippingDetails && shippingDetails.address;

    // Extract line items
    const lineItems = session.line_items?.data || [];
    const orderItems = await Promise.all(
      lineItems.map(async (item) => {
        const product = item.price?.product as Stripe.Product;
        const metadata = product?.metadata || {};
        const quantity = item.quantity || 1;
        const totalLinePrice = item.amount_subtotal;
        const totalLineTax = item.amount_tax;
        const unitPrice = Math.round(totalLinePrice / quantity);
        const unitTax = Math.round(totalLineTax / quantity);

        const productId = parseInt(metadata.productId || "0", 10);
        const variationId = parseInt(metadata.variationId || "0", 10);

        // Fetch product image via API (fallback to Stripe-provided image or metadata)
        let imageUrl = product?.images?.[0] || metadata.imageUrl || null;

        if (!imageUrl && productId) {
          try {
            const api = getApiClient();
            const resp = await api.get<any>("/products", {
              productIds: String(productId),
              limit: 1,
            });
            const productData = resp?.data?.[0];
            if (productData) {
              // Try variation-specific image first
              if (variationId && productData.variations) {
                const variation = productData.variations.find(
                  (v: any) => v.id === variationId,
                );
                if (variation?.images?.[0]) imageUrl = variation.images[0];
              }
              // Fall back to product image
              if (!imageUrl) {
                imageUrl =
                  productData.primaryImage ??
                  productData.imageUrl ??
                  productData.images?.[0] ??
                  null;
              }
            }
          } catch {
            // Image is non-critical — proceed without it
          }
        }

        return {
          variationId: parseInt(metadata.variationId || "0", 10),
          productId,
          name: item.description || "Unknown Product",
          variation: metadata.variation || null,
          manufacturerNo: metadata.manufacturerNo || null,
          imageUrl,
          quantity,
          price: unitPrice,
          tax: unitTax,
          isDownloadable: metadata.isDownloadable === "true",
          downloadUrl: metadata.downloadUrl || null,
        };
      }),
    );

    // Calculate totals
    const subtotal = session.amount_subtotal || 0;
    const shippingCost = session.total_details?.amount_shipping || 0;
    const tax = session.total_details?.amount_tax || 0;
    const total = session.amount_total || 0;

    console.log(
      `[SYNC] Creating order with ${orderItems.length} items, total: $${(total / 100).toFixed(2)}`,
    );

    // Create order
    const result = await createOrder({
      stripeSessionId: sessionId,
      stripePaymentIntentId: paymentIntentId,
      customerEmail,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress: hasShipping
        ? {
            name: shippingDetails.name || "",
            line1: shippingDetails.address.line1 || "",
            line2: shippingDetails.address.line2 || null,
            city: shippingDetails.address.city || "",
            state: shippingDetails.address.state || "",
            postalCode: shippingDetails.address.postal_code || "",
            country: shippingDetails.address.country || "US",
          }
        : {
            name: "",
            line1: "",
            city: "",
            state: "",
            postalCode: "",
            country: "US",
          },
      phoneNumber: session.customer_details?.phone || undefined,
    });

    if (result) {
      console.log(`[SYNC] Order created successfully: ${result.orderNumber}`);

      // Send confirmation email
      console.log(`[SYNC] Sending confirmation email...`);
      const isDigitalOnly = orderItems.every((i) => i.isDownloadable);
      const emailResult = await sendOrderConfirmationEmail({
        customerEmail,
        customerName: shippingDetails?.name || "Valued Customer",
        orderNumber: result.orderNumber,
        shippingAddress: shippingDetails?.address
          ? {
              name: shippingDetails.name || "",
              line1: shippingDetails.address.line1 || "",
              line2: shippingDetails.address.line2 || null,
              city: shippingDetails.address.city || "",
              state: shippingDetails.address.state || "",
              postalCode: shippingDetails.address.postal_code || "",
              country: shippingDetails.address.country || "US",
            }
          : undefined,
        items: orderItems.map((item) => ({
          name: item.name,
          variationName: item.variation || undefined,
          sku: item.manufacturerNo || undefined,
          imageUrl: item.imageUrl || undefined,
          quantity: item.quantity,
          price: item.price,
          downloadUrl: item.downloadUrl || undefined,
        })),
        subtotal,
        shippingCost,
        tax,
        total,
        isDigitalOnly,
      });

      return NextResponse.json({
        success: true,
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        emailSent: emailResult.success,
      });
    } else {
      console.error(`[SYNC] Failed to create order`);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create order",
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error(`[SYNC] Error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/orders/sync?sessionId=cs_...
 * Check if an order exists for a session
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    // Check database
    const existingOrder = await getOrderByStripeSession(sessionId);

    // Check Stripe
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      sessionId,
      stripeStatus: session.payment_status,
      orderInDatabase: !!existingOrder,
      orderId: existingOrder?.id || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
}
