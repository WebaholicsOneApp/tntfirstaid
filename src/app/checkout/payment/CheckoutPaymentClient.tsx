"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  AddressElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type {
  StripeAddressElementChangeEvent,
  StripeExpressCheckoutElementConfirmEvent,
} from "@stripe/stripe-js";
import CheckoutStepIndicator from "~/components/checkout/CheckoutStepIndicator";
import OrderSummary from "~/components/checkout/OrderSummary";
import StripeProvider from "~/components/checkout/StripeProvider";
import { Spinner } from "~/components/ui/Spinner";
import {
  SESSION_KEY,
  DISCOUNT_SESSION_KEY,
  type CheckoutSessionData,
  type PaymentConfig,
} from "~/components/checkout/CheckoutTypes";
import { useCart, cartIsDigitalOnly } from "~/lib/cart/CartContext";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  devBypass: boolean;
}

// Re-export so other files can still pull PaymentConfig from here during transition
export type { PaymentConfig };

// ---------------------------------------------------------------------------
// Payment intent shape returned by /api/create-payment-intent
// ---------------------------------------------------------------------------

interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  subtotal: number;
  discountCents?: number;
  tax: number;
  shippingCost?: number;
  publishableKey?: string | null;
  stripeConnectAccountId?: string | null;
}

// ===========================================================================
// Outer shell — loads session + config + creates PaymentIntent, then mounts
// StripeProvider with the resulting clientSecret. The actual form lives in
// <CheckoutPaymentForm /> below, so we have access to useStripe()/useElements().
// ===========================================================================

export default function CheckoutPaymentClient({ devBypass }: Props) {
  const router = useRouter();
  const { cart } = useCart();
  const isDigitalOnly = cartIsDigitalOnly(cart.items);

  // ---- 1. Load checkout session from sessionStorage (set in shipping step) ----
  const [sessionData, setSessionData] = useState<CheckoutSessionData | null>(
    null,
  );
  const [digitalContact, setDigitalContact] = useState({ name: "", email: "" });
  const [digitalErrors, setDigitalErrors] = useState<Map<string, string>>(
    new Map(),
  );
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) {
        if (isDigitalOnly) {
          // Digital-only: skip the shipping step and gather contact info here.
          const minimal: CheckoutSessionData = {
            isDigitalOnly: true,
            shipping: {
              name: "",
              email: "",
              line1: "",
              city: "",
              state: "",
              postalCode: "",
            },
            shippingMethod: "standard",
            sendEmail: true,
            paymentMethod: "credit_card",
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(minimal));
          setSessionData(minimal);
          return;
        }
        router.replace("/checkout/shipping");
        return;
      }
      const data = JSON.parse(saved) as CheckoutSessionData;
      if (
        !data.isDigitalOnly &&
        (!data.shipping?.name || !data.shipping?.email)
      ) {
        router.replace("/checkout/shipping");
        return;
      }
      if (data.isDigitalOnly && data.shipping) {
        setDigitalContact({
          name: data.shipping.name || "",
          email: data.shipping.email || "",
        });
      }
      setSessionData(data);
    } catch {
      router.replace("/checkout/shipping");
    }
  }, [router, isDigitalOnly]);

  // ---- 2. Load payment config ----
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(
    devBypass
      ? {
          providerType: null,
          status: "not_configured",
          stripePublishableKey: null,
          stripeConnectAccountId: null,
          expressCheckoutEnabled: false,
          checkoutMode: null,
          supportedMethods: ["card"],
          devBypass: true,
        }
      : null,
  );

  useEffect(() => {
    if (devBypass) return;
    fetch("/api/checkout/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setPaymentConfig({ ...d, devBypass: false });
      })
      .catch(() => {});
  }, [devBypass]);

  // ---- 3. Create PaymentIntent once session + config are ready ----
  const [paymentIntent, setPaymentIntent] =
    useState<PaymentIntentResult | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);

  const shippingCost = sessionData?.selectedShippingRate?.totalCents ?? 0;

  useEffect(() => {
    if (devBypass) return;
    if (!sessionData) return;
    if (!paymentConfig) return;
    if (paymentConfig.providerType !== "stripe_connect") return;
    if (paymentConfig.status !== "ready") return;
    if (paymentIntent || creatingIntent) return;
    if (cart.items.length === 0) return;

    setCreatingIntent(true);

    const shippingAddress = sessionData.isDigitalOnly
      ? undefined
      : {
          name: sessionData.shipping.name,
          line1: sessionData.shipping.line1,
          line2: sessionData.shipping.line2,
          city: sessionData.shipping.city,
          state: sessionData.shipping.state,
          postalCode: sessionData.shipping.postalCode,
          country: sessionData.shipping.country || "US",
        };

    let discountCode: string | undefined;
    try {
      const raw = sessionStorage.getItem(DISCOUNT_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.code === "string" &&
          /^[A-Z0-9_-]{3,32}$/.test(parsed.code)
        ) {
          discountCode = parsed.code;
        }
      }
    } catch {
      // Bad payload — ignore.
    }

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.items.map((i) => ({
          variationId: i.id,
          quantity: i.quantity,
        })),
        ...(shippingAddress ? { shippingAddress } : {}),
        shippingCostCents: shippingCost,
        ...(discountCode ? { discountCode } : {}),
      }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.message || "Failed to start payment.");
        }
        return r.json();
      })
      .then((data: PaymentIntentResult) => setPaymentIntent(data))
      .catch((err: unknown) => {
        setPageError(
          err instanceof Error
            ? err.message
            : "Failed to start payment. Please try again.",
        );
      })
      .finally(() => setCreatingIntent(false));
  }, [
    devBypass,
    sessionData,
    paymentConfig,
    paymentIntent,
    creatingIntent,
    cart.items,
    shippingCost,
  ]);

  // ---- Redirect to shop if cart is empty ----
  useEffect(() => {
    if (cart.items.length !== 0) return undefined;
    const timer = setTimeout(() => {
      if (cart.items.length === 0) router.push("/shop");
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  // ---- Loading state ----
  const isLoading =
    cart.items.length === 0 ||
    !sessionData ||
    (!devBypass && !paymentConfig) ||
    (!devBypass &&
      paymentConfig?.providerType === "stripe_connect" &&
      paymentConfig?.status === "ready" &&
      !paymentIntent &&
      !pageError);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="border-primary-500 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-secondary-600">Preparing secure checkout…</p>
        </div>
      </div>
    );
  }

  const isPaymentReady =
    paymentConfig?.devBypass ||
    (paymentConfig?.providerType === "stripe_connect" &&
      paymentConfig?.status === "ready");

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-24">
        <CheckoutStepIndicator currentStep={2} />

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-8" />
              <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                Checkout
              </span>
            </div>
            <h1 className="font-display text-secondary-900 text-4xl font-bold tracking-tight sm:text-5xl">
              Payment & Review
            </h1>
          </div>
          <Link
            href={isDigitalOnly ? "/checkout" : "/checkout/shipping"}
            className="text-secondary-500 hover:text-primary-600 hidden items-center gap-2 text-sm font-medium transition-colors sm:flex"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {isDigitalOnly ? "Back to Cart" : "Back to Shipping"}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Link
              href={isDigitalOnly ? "/checkout" : "/checkout/shipping"}
              className="text-secondary-500 hover:text-primary-600 flex items-center gap-2 text-sm font-medium transition-colors sm:hidden"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {isDigitalOnly ? "Back to Cart" : "Back to Shipping"}
            </Link>

            {!isPaymentReady ? (
              <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
                <div className="rounded-xl border border-amber-200/80 bg-amber-50 p-6 text-sm text-amber-800">
                  Checkout is not configured for this storefront yet. Please
                  contact TNT First Aid support.
                </div>
              </div>
            ) : pageError ? (
              <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {pageError}
                </div>
              </div>
            ) : paymentConfig?.devBypass ? (
              <DevBypassPanel
                sessionData={sessionData!}
                cart={cart}
                router={router}
                isDigitalOnly={isDigitalOnly}
                digitalContact={digitalContact}
                setDigitalContact={setDigitalContact}
                digitalErrors={digitalErrors}
                setDigitalErrors={setDigitalErrors}
              />
            ) : paymentIntent &&
              paymentConfig?.stripePublishableKey ? (
              <StripeProvider
                clientSecret={paymentIntent.clientSecret}
                amount={paymentIntent.amount}
                publishableKey={paymentConfig.stripePublishableKey}
                stripeAccountId={paymentConfig.stripeConnectAccountId}
              >
                <CheckoutPaymentForm
                  sessionData={sessionData!}
                  paymentIntent={paymentIntent}
                  cart={cart}
                  isDigitalOnly={isDigitalOnly}
                  digitalContact={digitalContact}
                  setDigitalContact={setDigitalContact}
                  digitalErrors={digitalErrors}
                  setDigitalErrors={setDigitalErrors}
                  expressCheckoutEnabled={
                    paymentConfig.expressCheckoutEnabled
                  }
                />
              </StripeProvider>
            ) : null}
          </div>

          {/* Sidebar — order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummary
                cart={cart}
                shippingCost={shippingCost}
                shippingLabel={
                  sessionData?.selectedShippingRate?.serviceName ?? undefined
                }
                shippingState={
                  sessionData?.isDigitalOnly
                    ? undefined
                    : sessionData?.shipping.state
                }
                isDigitalOnly={isDigitalOnly}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Dev bypass — no real payment processing. Mirrors PlaceOrderPanel behavior.
// ===========================================================================

interface DevBypassPanelProps {
  sessionData: CheckoutSessionData;
  cart: ReturnType<typeof useCart>["cart"];
  router: ReturnType<typeof useRouter>;
  isDigitalOnly: boolean;
  digitalContact: { name: string; email: string };
  setDigitalContact: (v: { name: string; email: string }) => void;
  digitalErrors: Map<string, string>;
  setDigitalErrors: (v: Map<string, string>) => void;
}

function DevBypassPanel(props: DevBypassPanelProps) {
  const {
    sessionData,
    cart,
    router,
    isDigitalOnly,
    digitalContact,
    setDigitalContact,
    digitalErrors,
    setDigitalErrors,
  } = props;
  const { clearCart } = useCart();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (isDigitalOnly) {
      const errs = new Map<string, string>();
      if (!digitalContact.name.trim()) errs.set("name", "Name is required");
      if (!digitalContact.email.trim()) errs.set("email", "Email is required");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(digitalContact.email.trim()))
        errs.set("email", "Enter a valid email");
      if (errs.size > 0) {
        setDigitalErrors(errs);
        return;
      }
      sessionData.shipping.name = digitalContact.name.trim();
      sessionData.shipping.email = digitalContact.email.trim();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }

    setIsPending(true);

    let discountCode: string | undefined;
    let discountCents = 0;
    try {
      const raw = sessionStorage.getItem(DISCOUNT_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.code === "string" &&
          /^[A-Z0-9_-]{3,32}$/.test(parsed.code) &&
          typeof parsed.discountCents === "number"
        ) {
          discountCode = parsed.code;
          discountCents = parsed.discountCents;
        }
      }
    } catch {
      // Bad payload — ignore.
    }

    try {
      const response = await fetch("/api/dev-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: sessionData.shipping.email,
          ...(sessionData.shipping.phone
            ? { phoneNumber: sessionData.shipping.phone }
            : {}),
          items: cart.items.map((i) => ({
            variationId: i.id,
            quantity: i.quantity,
            price: i.price,
          })),
          shippingAddress: isDigitalOnly
            ? undefined
            : {
                name: sessionData.shipping.name,
                line1: sessionData.shipping.line1,
                ...(sessionData.shipping.line2
                  ? { line2: sessionData.shipping.line2 }
                  : {}),
                city: sessionData.shipping.city,
                state: sessionData.shipping.state,
                postalCode: sessionData.shipping.postalCode,
                country: sessionData.shipping.country || "US",
              },
          ...(discountCode && discountCents > 0
            ? { discountCode, discountCents }
            : {}),
          shippingCostCents:
            sessionData.selectedShippingRate?.totalCents ?? 0,
          shippingServiceName: sessionData.selectedShippingRate?.serviceName,
          shippingServiceCode: sessionData.selectedShippingRate?.serviceCode,
          sendEmail: false,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to create order");
      }

      const data = (await response.json()) as {
        orderId: number;
        orderNumber?: string | null;
      };

      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(DISCOUNT_SESSION_KEY);
      try {
        const ids = cart.items.map((i) => i.productId).filter(Boolean);
        if (ids.length > 0)
          sessionStorage.setItem(
            "alpha-checkout-product-ids",
            JSON.stringify(ids),
          );
      } catch {
        // Storage unavailable — proceed without snapshot.
      }
      clearCart();

      const params = new URLSearchParams({ order_id: String(data.orderId) });
      if (data.orderNumber) params.set("order_number", data.orderNumber);
      router.push(`/checkout/success?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
      setIsPending(false);
    }
  }, [
    cart.items,
    clearCart,
    digitalContact,
    digitalErrors,
    isDigitalOnly,
    router,
    sessionData,
    setDigitalErrors,
  ]);

  return (
    <div className="ring-secondary-100 space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
      {isDigitalOnly && (
        <DigitalContactFields
          digitalContact={digitalContact}
          setDigitalContact={setDigitalContact}
          digitalErrors={digitalErrors}
          setDigitalErrors={setDigitalErrors}
        />
      )}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-semibold">Dev bypass active</p>
        <p className="mt-1 text-xs">
          No real payment will be processed. Order will be created in OneApp
          with provider type <code>dev_bypass</code>.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="bg-secondary-900 hover:bg-secondary-800 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white uppercase transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending && <Spinner />}
        {isPending ? "Processing…" : "Place Order (Test Mode)"}
      </button>
    </div>
  );
}

// ===========================================================================
// Stripe form — rendered inside StripeProvider
// ===========================================================================

interface CheckoutPaymentFormProps {
  sessionData: CheckoutSessionData;
  paymentIntent: PaymentIntentResult;
  cart: ReturnType<typeof useCart>["cart"];
  isDigitalOnly: boolean;
  digitalContact: { name: string; email: string };
  setDigitalContact: (v: { name: string; email: string }) => void;
  digitalErrors: Map<string, string>;
  setDigitalErrors: (v: Map<string, string>) => void;
  expressCheckoutEnabled: boolean;
}

function CheckoutPaymentForm(props: CheckoutPaymentFormProps) {
  const {
    sessionData,
    paymentIntent,
    cart,
    isDigitalOnly,
    digitalContact,
    setDigitalContact,
    digitalErrors,
    setDigitalErrors,
    expressCheckoutEnabled,
  } = props;
  const router = useRouter();
  const { clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [billingComplete, setBillingComplete] = useState(false);
  const [billingAddress, setBillingAddress] = useState<
    StripeAddressElementChangeEvent["value"] | null
  >(null);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expressReady, setExpressReady] = useState(false);

  const handleBillingChange = useCallback(
    (event: StripeAddressElementChangeEvent) => {
      setBillingComplete(event.complete);
      setBillingAddress(event.value);
    },
    [],
  );

  // ---- Helper: notify OneApp that a PaymentIntent succeeded ----
  const notifyOneAppOrder = useCallback(
    async (paymentIntentId: string, paymentMethod: string) => {
      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const tax = paymentIntent.tax;
      const shippingCost = paymentIntent.shippingCost ?? 0;
      const total = paymentIntent.amount;

      const shippingAddress = isDigitalOnly
        ? undefined
        : {
            name: sessionData.shipping.name,
            line1: sessionData.shipping.line1,
            line2: sessionData.shipping.line2,
            city: sessionData.shipping.city,
            state: sessionData.shipping.state,
            postalCode: sessionData.shipping.postalCode,
            country: sessionData.shipping.country || "US",
          };

      const resp = await fetch("/api/express-checkout-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripePaymentIntentId: paymentIntentId,
          customerEmail: isDigitalOnly
            ? digitalContact.email.trim()
            : sessionData.shipping.email,
          paymentMethod,
          items: cart.items.map((i) => ({
            variationId: i.id,
            quantity: i.quantity,
            price: i.price,
          })),
          subtotal,
          shippingCost,
          tax,
          total,
          ...(shippingAddress ? { shippingAddress } : {}),
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "Failed to record order with merchant.");
      }

      return (await resp.json()) as {
        orderId: number;
        orderNumber?: string | null;
      };
    },
    [
      cart.items,
      digitalContact.email,
      isDigitalOnly,
      paymentIntent,
      sessionData,
    ],
  );

  const finishOrder = useCallback(
    async (data: { orderId: number; orderNumber?: string | null }) => {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(DISCOUNT_SESSION_KEY);
      try {
        const ids = cart.items.map((i) => i.productId).filter(Boolean);
        if (ids.length > 0)
          sessionStorage.setItem(
            "alpha-checkout-product-ids",
            JSON.stringify(ids),
          );
      } catch {
        // Storage unavailable — proceed without snapshot.
      }
      clearCart();
      const params = new URLSearchParams({ order_id: String(data.orderId) });
      if (data.orderNumber) params.set("order_number", data.orderNumber);
      router.push(`/checkout/success?${params.toString()}`);
    },
    [cart.items, clearCart, router],
  );

  // ---- Express Checkout (Apple Pay / Google Pay / Link) ----
  const handleExpressConfirm = useCallback(
    async (event: StripeExpressCheckoutElementConfirmEvent) => {
      if (!stripe || !elements) {
        setError("Payment system not ready.");
        return;
      }
      setError(null);
      setIsPaying(true);
      try {
        const { error: confirmError, paymentIntent: pi } =
          await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: "if_required",
          });

        if (confirmError) {
          setError(confirmError.message || "Payment failed.");
          setIsPaying(false);
          return;
        }
        if (pi && pi.status === "succeeded") {
          const pmType = event.expressPaymentType || "card";
          let pm = "card";
          if (pmType === "apple_pay") pm = "apple_pay";
          else if (pmType === "google_pay") pm = "google_pay";
          else if (pmType === "link") pm = "link";

          const orderData = await notifyOneAppOrder(pi.id, pm);
          await finishOrder(orderData);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Payment failed unexpectedly.",
        );
        setIsPaying(false);
      }
    },
    [stripe, elements, notifyOneAppOrder, finishOrder],
  );

  // ---- Standard card flow ----
  const handlePlaceOrder = useCallback(async () => {
    if (!stripe || !elements) {
      setError("Payment system not ready.");
      return;
    }
    setError(null);

    if (isDigitalOnly) {
      const errs = new Map<string, string>();
      if (!digitalContact.name.trim()) errs.set("name", "Name is required");
      if (!digitalContact.email.trim()) errs.set("email", "Email is required");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(digitalContact.email.trim()))
        errs.set("email", "Enter a valid email");
      if (errs.size > 0) {
        setDigitalErrors(errs);
        return;
      }
      sessionData.shipping.name = digitalContact.name.trim();
      sessionData.shipping.email = digitalContact.email.trim();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }

    if (!billingComplete) {
      setError("Please complete the billing address.");
      return;
    }

    setIsPaying(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Please check your card details.");
        setIsPaying(false);
        return;
      }

      const { error: confirmError, paymentIntent: pi } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success`,
            payment_method_data: billingAddress
              ? {
                  billing_details: {
                    name: billingAddress.name,
                    phone: billingAddress.phone,
                    address: {
                      line1: billingAddress.address.line1,
                      line2: billingAddress.address.line2 || undefined,
                      city: billingAddress.address.city,
                      state: billingAddress.address.state,
                      postal_code: billingAddress.address.postal_code,
                      country: billingAddress.address.country,
                    },
                  },
                }
              : undefined,
          },
          redirect: "if_required",
        });

      if (confirmError) {
        setError(confirmError.message || "Payment failed.");
        setIsPaying(false);
        return;
      }
      if (pi && pi.status === "succeeded") {
        const orderData = await notifyOneAppOrder(pi.id, "card");
        await finishOrder(orderData);
      } else {
        setError("Payment did not complete. Please try again.");
        setIsPaying(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment failed unexpectedly.",
      );
      setIsPaying(false);
    }
  }, [
    stripe,
    elements,
    isDigitalOnly,
    digitalContact,
    sessionData,
    billingComplete,
    billingAddress,
    notifyOneAppOrder,
    finishOrder,
    setDigitalErrors,
  ]);

  // ---- Default address for AddressElement: prefill from shipping when sensible ----
  const defaultBillingAddress = useMemo(() => {
    if (isDigitalOnly) return undefined;
    return {
      name: sessionData.shipping.name,
      address: {
        line1: sessionData.shipping.line1,
        line2: sessionData.shipping.line2 || "",
        city: sessionData.shipping.city,
        state: sessionData.shipping.state,
        postal_code: sessionData.shipping.postalCode,
        country: sessionData.shipping.country || "US",
      },
    };
  }, [isDigitalOnly, sessionData]);

  return (
    <div className="space-y-6">
      {isDigitalOnly && (
        <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
          <DigitalContactFields
            digitalContact={digitalContact}
            setDigitalContact={setDigitalContact}
            digitalErrors={digitalErrors}
            setDigitalErrors={setDigitalErrors}
          />
        </div>
      )}

      {/* Express Checkout — only mounts if enabled, and section only paints
          once Stripe reports at least one available wallet on this device. */}
      {expressCheckoutEnabled && (
        <div
          className={
            expressReady
              ? "ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8"
              : "hidden"
          }
        >
          <SectionHeader>Express Checkout</SectionHeader>
          <ExpressCheckoutElement
            onConfirm={handleExpressConfirm}
            onReady={({ availablePaymentMethods }) => {
              const hasMethod = availablePaymentMethods
                ? Object.values(availablePaymentMethods).some(Boolean)
                : false;
              setExpressReady(hasMethod);
            }}
            options={{
              buttonType: { applePay: "buy", googlePay: "buy" },
              buttonTheme: { applePay: "black", googlePay: "black" },
              layout: { maxColumns: 2, maxRows: 1 },
              paymentMethods: {
                applePay: "always",
                googlePay: "always",
                link: "auto",
              },
            }}
          />
          <div className="text-secondary-400 mt-4 flex items-center gap-3 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
            <div className="bg-secondary-200 h-px flex-1" />
            <span>or pay with card</span>
            <div className="bg-secondary-200 h-px flex-1" />
          </div>
        </div>
      )}

      {/* Card details */}
      <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
        <SectionHeader>Card Details</SectionHeader>
        <PaymentElement
          options={{
            layout: { type: "tabs", defaultCollapsed: false },
            fields: {
              billingDetails: {
                address: "never",
                name: "never",
                email: "never",
                phone: "never",
              },
            },
          }}
        />
        <p className="text-secondary-400 mt-3 text-xs">
          Card details are encrypted and processed by Stripe. We never see
          your full card number.
        </p>
      </div>

      {/* Billing address */}
      <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
        <SectionHeader>Billing Address</SectionHeader>
        <AddressElement
          options={{
            mode: "billing",
            allowedCountries: ["US"],
            autocomplete: { mode: "automatic" },
            defaultValues: defaultBillingAddress,
            fields: {
              phone: "always",
            },
            validation: {
              phone: { required: "auto" },
            },
          }}
          onChange={handleBillingChange}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={isPaying || !stripe || !elements}
        className="group bg-secondary-900 hover:bg-secondary-800 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white uppercase transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPaying ? (
          <>
            <Spinner />
            <span>Processing payment…</span>
          </>
        ) : (
          <>
            <span>Place Order</span>
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </>
        )}
      </button>

      <p className="text-secondary-400 text-center text-xs">
        By placing your order you agree to our{" "}
        <Link
          href="/terms"
          className="hover:text-primary-600 underline underline-offset-2"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="hover:text-primary-600 underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

// ===========================================================================
// Small shared sub-components
// ===========================================================================

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="bg-primary-500 h-px w-6" />
      <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
        {children}
      </span>
    </div>
  );
}

interface DigitalContactFieldsProps {
  digitalContact: { name: string; email: string };
  setDigitalContact: (v: { name: string; email: string }) => void;
  digitalErrors: Map<string, string>;
  setDigitalErrors: (v: Map<string, string>) => void;
}

function DigitalContactFields(props: DigitalContactFieldsProps) {
  const { digitalContact, setDigitalContact, digitalErrors, setDigitalErrors } =
    props;

  const clearError = (key: string) => {
    if (!digitalErrors.has(key)) return;
    const next = new Map(digitalErrors);
    next.delete(key);
    setDigitalErrors(next);
  };

  return (
    <div>
      <SectionHeader>Contact Information</SectionHeader>
      <div className="space-y-4">
        <div>
          <label className="text-secondary-700 mb-1.5 block text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            value={digitalContact.name}
            onChange={(e) => {
              setDigitalContact({ ...digitalContact, name: e.target.value });
              clearError("name");
            }}
            className={`border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-400 focus:ring-primary-400 w-full rounded-xl border bg-white px-4 py-3 text-sm transition-colors focus:ring-1 focus:outline-none ${digitalErrors.has("name") ? "border-red-400 ring-1 ring-red-400" : ""}`}
            placeholder="Your name"
          />
          {digitalErrors.has("name") && (
            <p className="mt-1 text-xs text-red-500">
              {digitalErrors.get("name")}
            </p>
          )}
        </div>
        <div>
          <label className="text-secondary-700 mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            value={digitalContact.email}
            onChange={(e) => {
              setDigitalContact({ ...digitalContact, email: e.target.value });
              clearError("email");
            }}
            className={`border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-400 focus:ring-primary-400 w-full rounded-xl border bg-white px-4 py-3 text-sm transition-colors focus:ring-1 focus:outline-none ${digitalErrors.has("email") ? "border-red-400 ring-1 ring-red-400" : ""}`}
            placeholder="you@example.com"
          />
          {digitalErrors.has("email") && (
            <p className="mt-1 text-xs text-red-500">
              {digitalErrors.get("email")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
