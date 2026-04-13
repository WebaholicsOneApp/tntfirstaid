import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";
import { getApiClient, ApiClientError } from "~/lib/api-client";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, "checkout");

  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const body = await request.json();
    const {
      precisionPayToken,
      plaidData,
      items,
      shippingAddress,
      customerEmail,
      phoneNumber,
      shippingCostCents,
    } = body;

    // Dev bypass: skip PP API, create order directly with mock transaction ID
    if (body.devBypass === true && process.env.NODE_ENV === "development") {
      if (!items?.length || !shippingAddress || !customerEmail) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      const amount = body.amount;
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      const transactionId = `dev-pp-${Date.now()}`;

      const orderResult = await getApiClient().post<{
        success: boolean;
        orderId: number;
        orderNumber: string;
        total: number;
      }>("/checkout/custom-pay-verified-order", {
        providerType: "precision_pay",
        providerPaymentId: transactionId,
        verifiedAmount: amount,
        customerEmail,
        items: items.map((item: { variationId: number; quantity: number }) => ({
          variationId: item.variationId,
          quantity: item.quantity,
        })),
        shippingAddress,
        phoneNumber,
        ...(shippingCostCents != null ? { shippingCostCents } : {}),
      });

      return NextResponse.json(orderResult, { status: 201 });
    }

    if (
      (!precisionPayToken && !plaidData) ||
      !items?.length ||
      !shippingAddress ||
      !customerEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const apiKey = process.env.PRECISIONPAY_API_KEY;
    const apiSecret = process.env.PRECISIONPAY_API_SECRET;
    const ppEnv = process.env.PRECISIONPAY_ENV || "production";

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Payment provider not configured" },
        { status: 500 },
      );
    }

    const PP_API_URL =
      ppEnv === "production"
        ? "https://api.myprecisionpay.com/api"
        : "https://sandbox.myprecisionpay.com/api";
    const authHeader = JSON.stringify({ apiKey, apiSecret });
    const envValue = ppEnv === "production" ? "live" : "sandbox";
    const siteUrl =
      process.env.CORS_ALLOWED_ORIGINS ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://alphamunitions.com";

    const amount = body.amount;
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    const amountDollars = (amount / 100).toFixed(2);

    // Pre-validate item availability before charging
    try {
      await getApiClient().post("/checkout/validate-items", {
        items: items.map((item: { variationId: number; quantity: number }) => ({
          variationId: item.variationId,
          quantity: item.quantity,
        })),
      });
    } catch (validationError) {
      // Items unavailable — return before charging customer
      const message =
        validationError instanceof ApiClientError
          ? validationError.message
          : "Item validation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    let paymentResponse;
    let transactionId: string;

    if (precisionPayToken) {
      // PP user path — they logged into PP and approved payment
      paymentResponse = await fetch(`${PP_API_URL}/checkout/pay`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Application-Access": authHeader,
          Referer: siteUrl,
        },
        body: JSON.stringify({
          precisionPayToken,
          amount: amountDollars,
          env: envValue,
        }),
      });
    } else {
      // Plaid guest path — one-time payment via bank link
      const nameParts = (shippingAddress.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      console.log("[PrecisionPay] one-time-payment request:", {
        amount,
        amountDollars,
        env: envValue,
        hasPublicToken: !!plaidData.public_token,
        accountId: plaidData.accountId,
        oneTimeUserId: plaidData.precisionPayPlaidUserId || "(empty)",
        firstName,
        lastName,
        email: customerEmail,
      });

      paymentResponse = await fetch(`${PP_API_URL}/checkout/one-time-payment`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Application-Access": authHeader,
          Referer: siteUrl,
        },
        body: JSON.stringify({
          public_token: plaidData.public_token,
          account_id: plaidData.accountId,
          one_time_user_id: plaidData.precisionPayPlaidUserId || "",
          external_user_id: "",
          first_name: firstName,
          last_name: lastName,
          business_name: "",
          email: customerEmail,
          amount: parseFloat(amountDollars),
          order: `PP-${Date.now()}`,
          cart: JSON.stringify(
            items.map((item: { variationId: number; quantity: number }) => ({
              id: item.variationId,
              quantity: item.quantity,
            })),
          ),
          platform: "NextJS",
          env: envValue,
        }),
      });
    }

    if (!paymentResponse.ok) {
      let errorDetail = "Payment processing failed. Please try again.";
      try {
        const errorData = await paymentResponse.json();
        errorDetail = errorData.detail || errorData.message || errorDetail;
        console.error(
          "[PrecisionPay] Payment failed:",
          paymentResponse.status,
          errorData,
        );
      } catch {
        const errorText = await paymentResponse.text().catch(() => "");
        console.error(
          "[PrecisionPay] Payment failed:",
          paymentResponse.status,
          errorText,
        );
      }
      return NextResponse.json({ error: errorDetail }, { status: 400 });
    }

    const paymentResult = await paymentResponse.json();
    transactionId = String(
      paymentResult.transactionId ||
        paymentResult.transaction_id ||
        `pp-${Date.now()}`,
    );

    console.log(
      `[PrecisionPay] Payment completed: ${transactionId} (env: ${envValue})`,
    );

    // Now create the order in OneApp
    const orderResult = await getApiClient().post<{
      success: boolean;
      orderId: number;
      orderNumber: string;
      total: number;
    }>("/checkout/custom-pay-verified-order", {
      providerType: "precision_pay",
      providerPaymentId: transactionId,
      verifiedAmount: amount,
      customerEmail,
      items: items.map((item: { variationId: number; quantity: number }) => ({
        variationId: item.variationId,
        quantity: item.quantity,
      })),
      shippingAddress,
      phoneNumber,
      ...(shippingCostCents != null ? { shippingCostCents } : {}),
    });

    return NextResponse.json(orderResult, { status: 201 });
  } catch (error) {
    console.error("[PrecisionPay] Error:", error);
    const message =
      error instanceof ApiClientError
        ? error.message
        : "Payment processing failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
