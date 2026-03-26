import { getApiClient } from '~/lib/api-client';
import CheckoutPaymentClient from './CheckoutPaymentClient';
import type { PaymentConfig } from './CheckoutPaymentClient';

export const dynamic = 'force-dynamic';

interface StorefrontCheckoutConfigResponse {
  payment?: {
    providerType?: 'stripe_connect' | 'authorize_net' | null;
    status?: 'ready' | 'needs_action' | 'not_configured';
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

export default async function CheckoutPaymentPage() {
  let paymentConfig: PaymentConfig | null = null;

  try {
    const config =
      await getApiClient().getConfig<StorefrontCheckoutConfigResponse>();
    paymentConfig = {
      providerType: config.payment?.providerType || null,
      status: (config.payment?.status ||
        'not_configured') as PaymentConfig['status'],
      stripePublishableKey: config.payment?.stripePublishableKey || null,
      stripeConnectAccountId: config.payment?.stripeConnectAccountId || null,
      authNetApiLoginId: config.payment?.authNetApiLoginId || null,
      authNetClientKey: config.payment?.authNetClientKey || null,
      authNetAcceptJsUrl: config.payment?.authNetAcceptJsUrl || null,
      expressCheckoutEnabled: !!config.payment?.expressCheckoutEnabled,
      checkoutMode: config.payment?.checkoutMode || null,
      supportedMethods: config.payment?.supportedMethods || ['card'],
      devBypass:
        process.env.NODE_ENV !== 'production' &&
        process.env.DEV_CHECKOUT_BYPASS === 'true',
    };
  } catch (error) {
    console.error('[checkout/payment] Failed to fetch payment config:', error);
  }

  return <CheckoutPaymentClient paymentConfig={paymentConfig} />;
}
