export const SESSION_KEY = "alpha-checkout-data";
// Separate key for the applied discount. Kept independent of the main
// session record so a partially-filled checkout (e.g. email only) can
// still hold a valid promo code across page loads.
export const DISCOUNT_SESSION_KEY = "alpha-checkout-discount";

export type PaymentMethod = "credit_card";

export interface SelectedShippingRate {
  serviceCode: string;
  serviceName: string;
  totalCents: number;
  deliveryDays: number | null;
  estimatedDelivery: string | null;
}

export interface AppliedDiscountSession {
  code: string;
  discountCents: number;
  discountType: "p" | "f";
  discountAmount: number;
}

export interface CheckoutSessionData {
  isDigitalOnly?: boolean;
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
  sendEmail: boolean;
}

export interface PaymentConfig {
  providerType: "stripe_connect" | null;
  status: "ready" | "needs_action" | "not_configured";
  stripePublishableKey: string | null;
  stripeConnectAccountId: string | null;
  expressCheckoutEnabled: boolean;
  checkoutMode: string | null;
  supportedMethods: string[];
  devBypass?: boolean;
}
