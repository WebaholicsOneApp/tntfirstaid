export const SESSION_KEY = "alpha-checkout-data";

export type PaymentMethod = "credit_card" | "precision_pay";

export interface SelectedShippingRate {
  serviceCode: string;
  serviceName: string;
  totalCents: number;
  deliveryDays: number | null;
  estimatedDelivery: string | null;
}

export interface CheckoutSessionData {
  shipping: {
    name: string;
    email: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  shippingMethod: string;
  selectedShippingRate?: SelectedShippingRate;
  billing?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  paymentMethod: PaymentMethod;
  opaqueData?: { dataDescriptor: string; dataValue: string };
  cardLast4?: string; // last 4 digits of card
  cardBrand?: string; // "visa" | "mastercard" | "amex" | "discover"
  sendEmail: boolean;
}

export interface PaymentConfig {
  providerType: "stripe_connect" | "authorize_net" | null;
  status: "ready" | "needs_action" | "not_configured";
  stripePublishableKey: string | null;
  stripeConnectAccountId: string | null;
  authNetApiLoginId: string | null;
  authNetClientKey: string | null;
  authNetAcceptJsUrl: string | null;
  expressCheckoutEnabled: boolean;
  checkoutMode: string | null;
  supportedMethods: string[];
  devBypass?: boolean;
}
