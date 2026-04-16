"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckoutStepIndicator from "~/components/checkout/CheckoutStepIndicator";
import OrderSummary from "~/components/checkout/OrderSummary";
import CardBrandIcon from "~/components/checkout/CardBrandIcon";
import {
  SESSION_KEY,
  type CheckoutSessionData,
  type PaymentConfig,
  type PaymentMethod,
} from "~/components/checkout/CheckoutTypes";
import { Spinner } from "~/components/ui/Spinner";
import { useCart, cartIsDigitalOnly } from "~/lib/cart/CartContext";
import { US_STATES } from "~/lib/us-states";

// Re-export PaymentConfig so page.tsx can import from here during transition
export type { PaymentConfig };

// ---------------------------------------------------------------------------
// Accept.js global type
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    Accept?: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string };
          cardData: {
            cardNumber: string;
            month: string;
            year: string;
            cardCode: string;
            zip?: string;
            fullName?: string;
          };
        },
        callback: (response: {
          messages: {
            resultCode: "Ok" | "Error";
            message: Array<{ code: string; text: string }>;
          };
          opaqueData?: { dataDescriptor: string; dataValue: string };
        }) => void,
      ) => void;
    };
  }
}

// ---------------------------------------------------------------------------
// Card formatting helpers
// ---------------------------------------------------------------------------

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  const month = digits.slice(0, 2);
  const year = digits.slice(2);
  return `${month}/${year}`;
}

function parseExpiry(expiry: string): { month: string; year: string } | null {
  const [monthRaw, yearRaw] = expiry.split("/");
  const month = monthRaw?.trim() || "";
  const year = yearRaw?.trim() || "";

  if (!month || !year || month.length !== 2) return null;

  const monthNumber = Number(month);
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12)
    return null;

  if (year.length !== 2 && year.length !== 4) return null;

  return {
    month,
    year: year.length === 2 ? `20${year}` : year,
  };
}

function detectCardBrand(number: string): string {
  const d = number.replace(/\D/g, "");
  if (d.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  if (d.startsWith("6011") || d.startsWith("65")) return "discover";
  return "card";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  devBypass: boolean;
}

type ScriptStatus = "idle" | "loading" | "ready" | "error";

export default function CheckoutPaymentClient({ devBypass }: Props) {
  const router = useRouter();
  const { cart } = useCart();

  // Payment config fetched client-side for instant page load
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(
    devBypass
      ? {
          providerType: null,
          status: "not_configured",
          stripePublishableKey: null,
          stripeConnectAccountId: null,
          authNetApiLoginId: null,
          authNetClientKey: null,
          authNetAcceptJsUrl: null,
          expressCheckoutEnabled: false,
          checkoutMode: null,
          supportedMethods: ["card"],
          devBypass: true,
        }
      : null,
  );

  // Fetch payment config client-side (non-blocking)
  useEffect(() => {
    if (devBypass) return;
    fetch("/api/checkout/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPaymentConfig({ ...data, devBypass: false });
      })
      .catch(() => {});
  }, [devBypass]);

  // Session data loaded from sessionStorage
  const [sessionData, setSessionData] = useState<CheckoutSessionData | null>(
    null,
  );

  // Payment method selection
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("credit_card");

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [cardFieldErrors, setCardFieldErrors] = useState<Map<string, string>>(
    new Map(),
  );

  // Accept.js script loading
  const [scriptStatus, setScriptStatus] = useState<ScriptStatus>("idle");

  // Billing address state
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billing, setBilling] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });
  const [billingErrors, setBillingErrors] = useState<Map<string, string>>(
    new Map(),
  );

  // General state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Compute shipping cost from selected rate in sessionStorage ----
  const shippingCost = useMemo(() => {
    if (!sessionData) return 0;
    return sessionData.selectedShippingRate?.totalCents ?? 0;
  }, [sessionData]);

  // ---- Redirect to shop if cart is empty ----
  useEffect(() => {
    if (cart.items.length !== 0) return undefined;
    const timer = setTimeout(() => {
      if (cart.items.length === 0) router.push("/shop");
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  // Digital-only contact info (used when shipping is skipped)
  const isDigitalOnly = cartIsDigitalOnly(cart.items);
  const [digitalName, setDigitalName] = useState("");
  const [digitalEmail, setDigitalEmail] = useState("");
  const [digitalContactErrors, setDigitalContactErrors] = useState<
    Map<string, string>
  >(new Map());

  // ---- Read sessionStorage on mount; redirect to /checkout/shipping if no shipping data ----
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) {
        if (isDigitalOnly) {
          // Digital-only: create a minimal session — contact info collected on this page
          const minimalSession: CheckoutSessionData = {
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
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(minimalSession));
          setSessionData(minimalSession);
          return;
        }
        router.push("/checkout/shipping");
        return;
      }
      const data = JSON.parse(saved) as CheckoutSessionData;
      if (
        !data.isDigitalOnly &&
        (!data.shipping || !data.shipping.name || !data.shipping.email)
      ) {
        router.push("/checkout/shipping");
        return;
      }
      // Restore digital contact fields if previously entered
      if (data.isDigitalOnly && data.shipping) {
        setDigitalName(data.shipping.name || "");
        setDigitalEmail(data.shipping.email || "");
      }
      setSessionData(data);

      // Restore payment method if previously selected
      if (data.paymentMethod) {
        setSelectedMethod(data.paymentMethod);
      }

      // Restore billing address if previously entered
      if (data.billing) {
        setSameAsShipping(false);
        setBilling({
          name: data.billing.name,
          line1: data.billing.line1,
          line2: data.billing.line2 ?? "",
          city: data.billing.city,
          state: data.billing.state,
          postalCode: data.billing.postalCode,
          country: data.billing.country ?? "US",
        });
      }
    } catch {
      router.push("/checkout/shipping");
    }
  }, [router, isDigitalOnly]);

  // ---- Load Accept.js when credit card is selected ----
  useEffect(() => {
    if (selectedMethod !== "credit_card") return undefined;
    if (paymentConfig?.devBypass) return undefined;
    if (!paymentConfig?.authNetAcceptJsUrl) return undefined;

    const acceptJsUrl = paymentConfig.authNetAcceptJsUrl;

    if (window.Accept) {
      setScriptStatus("ready");
      return undefined;
    }

    setScriptStatus("loading");

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-authorize-net="${acceptJsUrl}"]`,
    );

    const handleLoad = () => setScriptStatus("ready");
    const handleError = () => setScriptStatus("error");

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);
      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.src = acceptJsUrl;
    script.async = true;
    script.dataset.authorizeNet = acceptJsUrl;
    script.onload = handleLoad;
    script.onerror = handleError;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [selectedMethod, paymentConfig]);

  const scriptMessage = useMemo(() => {
    if (selectedMethod !== "credit_card" || paymentConfig?.devBypass)
      return null;
    if (scriptStatus === "loading") return "Loading secure card form...";
    if (scriptStatus === "error")
      return "Unable to load the secure card form. Refresh the page and try again.";
    return null;
  }, [selectedMethod, scriptStatus, paymentConfig?.devBypass]);

  // ---- Tokenize card via Accept.js ----
  const tokenizeCard = useCallback(async (): Promise<{
    dataDescriptor: string;
    dataValue: string;
  }> => {
    if (!sessionData?.shipping) throw new Error("Missing shipping data.");
    if (!paymentConfig?.authNetApiLoginId || !paymentConfig?.authNetClientKey) {
      throw new Error("Payment not configured.");
    }

    const parsedExpiry = parseExpiry(expiry);
    if (!parsedExpiry)
      throw new Error("Enter a valid expiration date in MM/YY format.");
    if (!window.Accept) throw new Error("Secure card form is not ready yet.");

    return await new Promise<{ dataDescriptor: string; dataValue: string }>(
      (resolve, reject) => {
        window.Accept?.dispatchData(
          {
            authData: {
              clientKey: paymentConfig.authNetClientKey!,
              apiLoginID: paymentConfig.authNetApiLoginId!,
            },
            cardData: {
              cardNumber: cardNumber.replace(/\D/g, ""),
              month: parsedExpiry.month,
              year: parsedExpiry.year,
              cardCode: cardCode.replace(/\D/g, ""),
              zip: (sameAsShipping
                ? sessionData.shipping.postalCode
                : billing.postalCode
              )?.trim(),
              fullName: sessionData.shipping.name?.trim(),
            },
          },
          (response) => {
            if (
              response.messages.resultCode === "Error" ||
              !response.opaqueData
            ) {
              const message =
                response.messages.message.map((item) => item.text).join(" ") ||
                "Card verification failed.";
              reject(new Error(message));
              return;
            }
            resolve(response.opaqueData);
          },
        );
      },
    );
  }, [cardNumber, expiry, cardCode, sessionData, paymentConfig]);

  // ---- "Continue to Review" handler ----
  const handleContinueToReview = useCallback(async () => {
    setError(null);

    if (!sessionData) {
      setError("Session data missing. Please go back to shipping.");
      return;
    }

    // Validate digital contact info if shipping was skipped
    if (isDigitalOnly) {
      const dErrors = new Map<string, string>();
      if (!digitalName.trim()) dErrors.set("digital_name", "Name is required");
      if (!digitalEmail.trim())
        dErrors.set("digital_email", "Email is required");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(digitalEmail.trim()))
        dErrors.set("digital_email", "Enter a valid email");
      if (dErrors.size > 0) {
        setDigitalContactErrors(dErrors);
        return;
      }
      setDigitalContactErrors(new Map<string, string>());
      // Update session with contact info
      sessionData.shipping.name = digitalName.trim();
      sessionData.shipping.email = digitalEmail.trim();
    }

    // Validate billing address if not same as shipping
    if (!sameAsShipping) {
      const bErrors = new Map<string, string>();
      if (!billing.name.trim())
        bErrors.set("billing_name", "Name on card is required");
      if (!billing.line1.trim())
        bErrors.set("billing_line1", "Street address is required");
      if (!billing.city.trim()) bErrors.set("billing_city", "City is required");
      if (!billing.state.trim())
        bErrors.set("billing_state", "State is required");
      if (!billing.postalCode.trim())
        bErrors.set("billing_postalCode", "ZIP code is required");
      if (bErrors.size > 0) {
        setBillingErrors(bErrors);
        return;
      }
      setBillingErrors(new Map<string, string>());
    }

    // Helper to attach billing to session data
    const attachBilling = (data: CheckoutSessionData) => {
      if (sameAsShipping) {
        delete data.billing;
      } else {
        data.billing = {
          name: billing.name,
          line1: billing.line1,
          line2: billing.line2 || undefined,
          city: billing.city,
          state: billing.state,
          postalCode: billing.postalCode,
          country: billing.country || "US",
        };
      }
    };

    // Validate card fields
    const errors = new Map<string, string>();
    if (cardNumber.replace(/\D/g, "").length < 13)
      errors.set("cardNumber", "Card number must be at least 13 digits");
    if (cardCode.replace(/\D/g, "").length < 3)
      errors.set("cardCode", "Security code must be at least 3 digits");

    const parsedExpiry = parseExpiry(expiry);
    if (!parsedExpiry)
      errors.set("expiry", "Enter a valid expiration date (MM/YY)");

    if (errors.size > 0) {
      setCardFieldErrors(errors);
      return;
    }
    setCardFieldErrors(new Map<string, string>());

    // Detect card brand and last 4 before tokenization
    const rawNumber = cardNumber.replace(/\D/g, "");
    const brand = detectCardBrand(rawNumber);
    const last4 = rawNumber.slice(-4);

    // Dev bypass — skip tokenization
    if (paymentConfig?.devBypass) {
      const existingData = JSON.parse(
        sessionStorage.getItem(SESSION_KEY)!,
      ) as CheckoutSessionData;
      existingData.paymentMethod = "credit_card";
      existingData.cardBrand = brand;
      existingData.cardLast4 = last4;
      delete existingData.opaqueData;
      attachBilling(existingData);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(existingData));
      router.push("/checkout/confirm");
      return;
    }

    // Tokenize via Accept.js
    setIsProcessing(true);
    try {
      const opaqueData = await tokenizeCard();
      const existingData = JSON.parse(
        sessionStorage.getItem(SESSION_KEY)!,
      ) as CheckoutSessionData;
      existingData.paymentMethod = "credit_card";
      existingData.opaqueData = opaqueData;
      existingData.cardBrand = brand;
      existingData.cardLast4 = last4;
      attachBilling(existingData);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(existingData));
      router.push("/checkout/confirm");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Card verification failed.",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    cardNumber,
    cardCode,
    expiry,
    sessionData,
    paymentConfig,
    tokenizeCard,
    router,
    sameAsShipping,
    billing,
  ]);

  // ---- CTA button for sidebar ----
  const ctaButton = (
    <button
      onClick={handleContinueToReview}
      disabled={
        isProcessing ||
        (selectedMethod === "credit_card" &&
          !paymentConfig?.devBypass &&
          scriptStatus !== "ready")
      }
      className="group bg-secondary-900 hover:bg-secondary-800 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white uppercase transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      aria-live="polite"
    >
      {isProcessing ? (
        <>
          <Spinner />
          <span>Verifying Card…</span>
        </>
      ) : (
        <>
          <span>Continue to Review</span>
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
  );

  // ---- Empty cart / loading state (includes waiting for config fetch) ----
  if (
    cart.items.length === 0 ||
    !sessionData ||
    (!devBypass && !paymentConfig)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="border-primary-500 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ---- Payment not configured ----
  const isPaymentReady =
    paymentConfig?.devBypass ||
    (paymentConfig && paymentConfig.status === "ready");

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
              Payment
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
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Back link mobile */}
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
                <div>
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50 p-6 text-sm text-amber-800">
                    Checkout is not configured for this storefront yet. Please
                    contact TNT First Aid support.
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Contact Information Card — digital-only orders (no shipping step) */}
                {isDigitalOnly && (
                  <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
                    <div>
                      <div className="mb-5 flex items-center gap-3">
                        <div className="bg-primary-500 h-px w-6" />
                        <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                          Contact Information
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-secondary-700 mb-1.5 block text-sm font-medium">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={digitalName}
                            onChange={(e) => {
                              setDigitalName(e.target.value);
                              setDigitalContactErrors((prev) => {
                                const n = new Map(prev);
                                n.delete("digital_name");
                                return n;
                              });
                            }}
                            className={`border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-400 focus:ring-primary-400 w-full rounded-xl border bg-white px-4 py-3 text-sm transition-colors focus:ring-1 focus:outline-none ${digitalContactErrors.has("digital_name") ? "border-red-400 ring-1 ring-red-400" : ""}`}
                            placeholder="Your name"
                          />
                          {digitalContactErrors.has("digital_name") && (
                            <p className="mt-1 text-xs text-red-500">
                              {digitalContactErrors.get("digital_name")}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-secondary-700 mb-1.5 block text-sm font-medium">
                            Email
                          </label>
                          <input
                            type="email"
                            value={digitalEmail}
                            onChange={(e) => {
                              setDigitalEmail(e.target.value);
                              setDigitalContactErrors((prev) => {
                                const n = new Map(prev);
                                n.delete("digital_email");
                                return n;
                              });
                            }}
                            className={`border-secondary-200 text-secondary-900 placeholder:text-secondary-300 focus:border-primary-400 focus:ring-primary-400 w-full rounded-xl border bg-white px-4 py-3 text-sm transition-colors focus:ring-1 focus:outline-none ${digitalContactErrors.has("digital_email") ? "border-red-400 ring-1 ring-red-400" : ""}`}
                            placeholder="you@example.com"
                          />
                          {digitalContactErrors.has("digital_email") && (
                            <p className="mt-1 text-xs text-red-500">
                              {digitalContactErrors.get("digital_email")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Address Card */}
                <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="bg-primary-500 h-px w-6" />
                      <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                        Billing Address
                      </span>
                    </div>

                    {/* Same as shipping toggle — hidden for digital-only */}
                    {!isDigitalOnly && (
                      <label className="flex cursor-pointer items-center gap-3">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={sameAsShipping}
                            onChange={(e) => {
                              const next = e.target.checked;
                              setSameAsShipping(next);
                              if (next) {
                                setBillingErrors(new Map<string, string>());
                              } else if (
                                !billing.line1.trim() &&
                                sessionData?.shipping
                              ) {
                                // Pre-fill from shipping the first time the
                                // user opts out — they can still edit fields
                                // individually after.
                                setBilling({
                                  name: sessionData.shipping.name ?? "",
                                  line1: sessionData.shipping.line1 ?? "",
                                  line2: sessionData.shipping.line2 ?? "",
                                  city: sessionData.shipping.city ?? "",
                                  state: sessionData.shipping.state ?? "",
                                  postalCode:
                                    sessionData.shipping.postalCode ?? "",
                                  country:
                                    sessionData.shipping.country ?? "US",
                                });
                              }
                            }}
                            className="peer sr-only"
                          />
                          <div className="border-secondary-300 peer-checked:border-primary-500 peer-checked:bg-primary-500 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-2 flex h-5 w-5 items-center justify-center rounded border-2 bg-white transition-colors peer-focus-visible:ring-2">
                            {sameAsShipping && (
                              <svg
                                className="h-3 w-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-secondary-700 text-sm">
                          Same as shipping address
                        </span>
                      </label>
                    )}

                    {/* Billing form — animated expand (always visible for digital-only) */}
                    <div
                      className={`grid transition-all duration-300 ease-out ${isDigitalOnly || !sameAsShipping ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-4 pt-5">
                          {/* Name */}
                          <label className="block">
                            <span className="text-secondary-700 mb-1.5 block text-sm font-medium">
                              Name on Card
                            </span>
                            <input
                              type="text"
                              autoComplete="billing name"
                              value={billing.name}
                              onChange={(e) => {
                                setBilling((p) => ({
                                  ...p,
                                  name: e.target.value,
                                }));
                                setBillingErrors((p) => {
                                  const n = new Map(p);
                                  n.delete("billing_name");
                                  return n;
                                });
                              }}
                              className={`w-full rounded-xl border ${billingErrors.has("billing_name") ? "border-red-400" : "border-secondary-200"} text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 bg-white px-4 py-3 text-sm transition outline-none focus:ring-2`}
                              placeholder="Jane Smith"
                            />
                            {billingErrors.has("billing_name") && (
                              <p className="mt-1 text-sm text-red-500">
                                {billingErrors.get("billing_name")}
                              </p>
                            )}
                          </label>

                          {/* Address line 1 */}
                          <label className="block">
                            <span className="text-secondary-700 mb-1.5 block text-sm font-medium">
                              Address
                            </span>
                            <input
                              type="text"
                              autoComplete="billing address-line1"
                              value={billing.line1}
                              onChange={(e) => {
                                setBilling((p) => ({
                                  ...p,
                                  line1: e.target.value,
                                }));
                                setBillingErrors((p) => {
                                  const n = new Map(p);
                                  n.delete("billing_line1");
                                  return n;
                                });
                              }}
                              className={`w-full rounded-xl border ${billingErrors.has("billing_line1") ? "border-red-400" : "border-secondary-200"} text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 bg-white px-4 py-3 text-sm transition outline-none focus:ring-2`}
                              placeholder="123 Main St"
                            />
                            {billingErrors.has("billing_line1") && (
                              <p className="mt-1 text-sm text-red-500">
                                {billingErrors.get("billing_line1")}
                              </p>
                            )}
                          </label>

                          {/* Address line 2 */}
                          <label className="block">
                            <span className="text-secondary-700 mb-1.5 block text-sm font-medium">
                              Apt, Suite, etc.{" "}
                              <span className="text-secondary-400 tracking-normal normal-case">
                                (optional)
                              </span>
                            </span>
                            <input
                              type="text"
                              autoComplete="billing address-line2"
                              value={billing.line2}
                              onChange={(e) =>
                                setBilling((p) => ({
                                  ...p,
                                  line2: e.target.value,
                                }))
                              }
                              className="border-secondary-200 text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-xl border bg-white px-4 py-3 text-sm transition outline-none focus:ring-2"
                              placeholder="Apt 4B"
                            />
                          </label>

                          {/* City / State / ZIP */}
                          <div className="grid grid-cols-3 gap-3">
                            <label className="col-span-1 block">
                              <span className="text-secondary-700 mb-1.5 block text-sm font-medium">
                                City
                              </span>
                              <input
                                type="text"
                                autoComplete="billing address-level2"
                                value={billing.city}
                                onChange={(e) => {
                                  setBilling((p) => ({
                                    ...p,
                                    city: e.target.value,
                                  }));
                                  setBillingErrors((p) => {
                                    const n = new Map(p);
                                    n.delete("billing_city");
                                    return n;
                                  });
                                }}
                                className={`w-full rounded-xl border ${billingErrors.has("billing_city") ? "border-red-400" : "border-secondary-200"} text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 bg-white px-4 py-3 text-sm transition outline-none focus:ring-2`}
                                placeholder="Salt Lake City"
                              />
                              {billingErrors.has("billing_city") && (
                                <p className="mt-1 text-sm text-red-500">
                                  {billingErrors.get("billing_city")}
                                </p>
                              )}
                            </label>
                            <label className="col-span-1 block">
                              <span className="text-secondary-700 mb-1.5 block text-sm font-medium">
                                State
                              </span>
                              <select
                                autoComplete="billing address-level1"
                                value={billing.state}
                                onChange={(e) => {
                                  setBilling((p) => ({
                                    ...p,
                                    state: e.target.value,
                                  }));
                                  setBillingErrors((p) => {
                                    const n = new Map(p);
                                    n.delete("billing_state");
                                    return n;
                                  });
                                }}
                                className={`w-full appearance-none rounded-xl border ${billingErrors.has("billing_state") ? "border-red-400" : "border-secondary-200"} text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 cursor-pointer bg-white bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat px-4 py-3 pr-9 text-sm transition outline-none focus:ring-2`}
                                style={{
                                  backgroundImage:
                                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475467' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
                                }}
                              >
                                <option value="">—</option>
                                {US_STATES.map((s) => (
                                  <option key={s.abbr} value={s.abbr}>
                                    {s.abbr}
                                  </option>
                                ))}
                              </select>
                              {billingErrors.has("billing_state") && (
                                <p className="mt-1 text-sm text-red-500">
                                  {billingErrors.get("billing_state")}
                                </p>
                              )}
                            </label>
                            <label className="col-span-1 block">
                              <span className="text-secondary-700 mb-1.5 block text-sm font-medium">
                                ZIP
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="billing postal-code"
                                value={billing.postalCode}
                                onChange={(e) => {
                                  setBilling((p) => ({
                                    ...p,
                                    postalCode: e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 10),
                                  }));
                                  setBillingErrors((p) => {
                                    const n = new Map(p);
                                    n.delete("billing_postalCode");
                                    return n;
                                  });
                                }}
                                className={`w-full rounded-xl border ${billingErrors.has("billing_postalCode") ? "border-red-400" : "border-secondary-200"} text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 bg-white px-4 py-3 text-sm transition outline-none focus:ring-2`}
                                placeholder="84101"
                              />
                              {billingErrors.has("billing_postalCode") && (
                                <p className="mt-1 text-sm text-red-500">
                                  {billingErrors.get("billing_postalCode")}
                                </p>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector Card */}
                <div className="ring-secondary-100 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:p-8">
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-primary-500 h-px w-6" />
                      <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
                        Select Payment Method
                      </span>
                    </div>

                    {error && (
                      <div
                        className="mb-4 rounded-xl border border-red-200/80 bg-red-50 p-4"
                        role="alert"
                        aria-live="assertive"
                      >
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Credit Card option */}
                      <label
                        className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                          selectedMethod === "credit_card"
                            ? "border-primary-500 bg-primary-50/30"
                            : "border-secondary-200 hover:border-secondary-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={selectedMethod === "credit_card"}
                          onChange={() => setSelectedMethod("credit_card")}
                          className="border-secondary-300 text-primary-500 focus:ring-primary-500 h-4 w-4"
                        />
                        <div>
                          <div className="flex items-center gap-3">
                            <svg
                              className="text-secondary-500 h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                            <p className="text-secondary-900 text-sm font-medium">
                              Credit Card
                            </p>
                          </div>
                          <div className="mt-2 ml-8 flex items-center gap-2">
                            <CardBrandIcon brand="visa" />
                            <CardBrandIcon brand="mastercard" />
                            <CardBrandIcon brand="amex" />
                            <CardBrandIcon brand="discover" />
                            <CardBrandIcon brand="diners" />
                            <CardBrandIcon brand="jcb" />
                          </div>
                        </div>
                      </label>

                      {/* Credit Card Form (animated expand) */}
                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          selectedMethod === "credit_card"
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="pt-0.5">
                            {scriptMessage && (
                              <div
                                className={`mb-3 rounded-xl border p-3 text-sm ${
                                  scriptStatus === "error"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-secondary-200 bg-secondary-50 text-secondary-500"
                                }`}
                              >
                                {scriptMessage}
                              </div>
                            )}

                            <div className="border-secondary-100 bg-secondary-50/80 rounded-2xl border p-4">
                              <div className="mb-4">
                                <p className="font-display text-secondary-900 text-lg font-semibold">
                                  Card Details
                                </p>
                                <p className="text-secondary-500 text-xs">
                                  Card details are tokenized by Authorize.net
                                  before anything is sent to the server.
                                </p>
                              </div>

                              <div className="space-y-4">
                                <label className="block">
                                  <span className="text-secondary-700 mb-1.5 block text-sm font-medium">
                                    Card Number
                                  </span>
                                  <input
                                    inputMode="numeric"
                                    autoComplete="cc-number"
                                    value={cardNumber}
                                    onChange={(event) => {
                                      setCardNumber(
                                        formatCardNumber(event.target.value),
                                      );
                                      if (cardFieldErrors.size) {
                                        setCardFieldErrors((prev) => {
                                          const n = new Map(prev);
                                          n.delete("cardNumber");
                                          return n;
                                        });
                                      }
                                    }}
                                    className={`w-full rounded-xl border ${cardFieldErrors.has("cardNumber") ? "border-red-400" : "border-secondary-200"} text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 bg-white px-4 py-3 text-sm transition outline-none focus:ring-2`}
                                    placeholder="4111 1111 1111 1111"
                                  />
                                  {cardFieldErrors.has("cardNumber") && (
                                    <p className="mt-1 text-sm text-red-500">
                                      {cardFieldErrors.get("cardNumber")}
                                    </p>
                                  )}
                                </label>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <label className="block">
                                    <span className="text-secondary-700 mb-1.5 block text-sm font-medium">
                                      Expiration
                                    </span>
                                    <input
                                      inputMode="numeric"
                                      autoComplete="cc-exp"
                                      value={expiry}
                                      onChange={(event) => {
                                        setExpiry(
                                          formatExpiry(event.target.value),
                                        );
                                        if (cardFieldErrors.size) {
                                          setCardFieldErrors((prev) => {
                                            const n = new Map(prev);
                                            n.delete("expiry");
                                            return n;
                                          });
                                        }
                                      }}
                                      className={`w-full rounded-xl border ${cardFieldErrors.has("expiry") ? "border-red-400" : "border-secondary-200"} text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 bg-white px-4 py-3 text-sm transition outline-none focus:ring-2`}
                                      placeholder="MM/YY"
                                    />
                                    {cardFieldErrors.has("expiry") && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {cardFieldErrors.get("expiry")}
                                      </p>
                                    )}
                                  </label>
                                  <label className="block">
                                    <span className="text-secondary-700 mb-1.5 block text-sm font-medium">
                                      Security Code
                                    </span>
                                    <input
                                      inputMode="numeric"
                                      autoComplete="cc-csc"
                                      value={cardCode}
                                      onChange={(event) => {
                                        setCardCode(
                                          event.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 4),
                                        );
                                        if (cardFieldErrors.size) {
                                          setCardFieldErrors((prev) => {
                                            const n = new Map(prev);
                                            n.delete("cardCode");
                                            return n;
                                          });
                                        }
                                      }}
                                      className={`w-full rounded-xl border ${cardFieldErrors.has("cardCode") ? "border-red-400" : "border-secondary-200"} text-secondary-900 focus:border-primary-500 focus:ring-primary-500/20 bg-white px-4 py-3 text-sm transition outline-none focus:ring-2`}
                                      placeholder="CVV"
                                    />
                                    {cardFieldErrors.has("cardCode") && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {cardFieldErrors.get("cardCode")}
                                      </p>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Dev bypass badge */}
                {paymentConfig?.devBypass && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="border-secondary-200 text-secondary-500 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Test Mode
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right column — Order Summary */}
          <div className="space-y-5 lg:col-span-1">
            <OrderSummary
              cart={cart}
              showItemDetails={true}
              shippingCost={shippingCost}
              shippingLabel={sessionData?.selectedShippingRate?.serviceName}
              shippingState={sessionData?.shipping?.state}
              ctaButton={isPaymentReady ? ctaButton : undefined}
              isDigitalOnly={isDigitalOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
