import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";
import { getApiClient, ApiClientError } from "~/lib/api-client";
import { sendOrderConfirmationEmail } from "~/lib/notifications/email-service";
import { getDownloadUrlByName } from "~/lib/downloads";

/**
 * POST /api/checkout/free-order
 *
 * Creates an order for free ($0) digital-only carts.
 * Skips payment processing entirely — validates items server-side,
 * creates the order, and sends a confirmation email with download links.
 */
export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, "checkout");

  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const body = await request.json();
    const { customerEmail, customerName, items } = body;

    if (!customerEmail || !customerName || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Validate items are available before creating the order
    try {
      await getApiClient().post("/checkout/validate-items", {
        items: items.map((item: { variationId: number; quantity: number }) => ({
          variationId: item.variationId,
          quantity: item.quantity,
        })),
      });
    } catch (validationError) {
      const message =
        validationError instanceof ApiClientError
          ? validationError.message
          : "Item validation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Create the order with $0 amount — no payment processor involved
    const transactionId = `free-${Date.now()}`;

    const orderResult = await getApiClient().post<{
      success: boolean;
      orderId: number;
      orderNumber: string;
      total: number;
    }>("/checkout/custom-pay-verified-order", {
      providerType: "free_download",
      providerPaymentId: transactionId,
      verifiedAmount: 0,
      customerEmail,
      items: items.map((item: { variationId: number; quantity: number }) => ({
        variationId: item.variationId,
        quantity: item.quantity,
      })),
      isDigitalOnly: true,
    });

    console.log(
      `[FREE-ORDER] Order created: ${orderResult.orderNumber} (${transactionId})`,
    );

    // Send confirmation email with download links
    try {
      const emailItems = items.map(
        (item: { variationId: number; quantity: number; name?: string }) => {
          const name = item.name || "Digital Download";
          const downloadUrl = getDownloadUrlByName(name) || undefined;
          return {
            name,
            quantity: item.quantity,
            price: 0,
            downloadUrl,
          };
        },
      );

      await sendOrderConfirmationEmail({
        customerEmail,
        customerName,
        orderNumber: orderResult.orderNumber,
        items: emailItems,
        subtotal: 0,
        shippingCost: 0,
        tax: 0,
        total: 0,
        isDigitalOnly: true,
      });

      console.log(`[FREE-ORDER] Confirmation email sent to ${customerEmail}`);
    } catch (emailError) {
      // Don't fail the order if email fails — order was already created
      console.error("[FREE-ORDER] Email send failed:", emailError);
    }

    return NextResponse.json(orderResult, { status: 201 });
  } catch (error) {
    console.error("[FREE-ORDER] Error:", error);
    const message =
      error instanceof ApiClientError
        ? error.message
        : "Failed to create order. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
