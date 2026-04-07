import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";
import { getApiClient } from "~/lib/api-client";

interface StorefrontCheckoutConfigResponse {
  payment?: {
    providerType?: "stripe_connect" | "authorize_net" | null;
    status?: "ready" | "needs_action" | "not_configured";
    stripePublishableKey?: string | null;
    stripeConnectAccountId?: string | null;
    authNetApiLoginId?: string | null;
    authNetClientKey?: string | null;
    authNetEnvironment?: string | null;
    authNetAcceptJsUrl?: string | null;
    expressCheckoutEnabled?: boolean;
    checkoutMode?: string | null;
    supportedMethods?: string[];
  };
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, "api");
  if (!rateLimit.success) return rateLimitResponse(rateLimit);

  try {
    const config =
      await getApiClient().getConfig<StorefrontCheckoutConfigResponse>();

    return NextResponse.json({
      providerType: config.payment?.providerType || null,
      status: config.payment?.status || "not_configured",
      stripePublishableKey: config.payment?.stripePublishableKey || null,
      stripeConnectAccountId: config.payment?.stripeConnectAccountId || null,
      authNetApiLoginId: config.payment?.authNetApiLoginId || null,
      authNetClientKey: config.payment?.authNetClientKey || null,
      authNetEnvironment: config.payment?.authNetEnvironment || null,
      authNetAcceptJsUrl: config.payment?.authNetAcceptJsUrl || null,
      expressCheckoutEnabled: !!config.payment?.expressCheckoutEnabled,
      checkoutMode: config.payment?.checkoutMode || null,
      supportedMethods: config.payment?.supportedMethods || ["card"],
      devBypass:
        process.env.NODE_ENV !== "production" &&
        process.env.DEV_CHECKOUT_BYPASS === "true",
    });
  } catch (error) {
    console.error("[checkout/config] Failed to fetch payment config:", error);
    return NextResponse.json(
      { error: "Failed to load checkout configuration" },
      { status: 500 },
    );
  }
}
