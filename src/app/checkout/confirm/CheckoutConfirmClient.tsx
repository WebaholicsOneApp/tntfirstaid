"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckoutStepIndicator from "~/components/checkout/CheckoutStepIndicator";
import OrderSummary from "~/components/checkout/OrderSummary";
import CardBrandIcon from "~/components/checkout/CardBrandIcon";
import { ProductImage } from "~/components/ui/ProductImage";
import { formatCentsToDollars, getImageUrl } from "~/lib/utils";
import PlaceOrderPanel from "~/components/checkout/PlaceOrderPanel";
import { openPrecisionPayPortal } from "~/components/checkout/PrecisionPayPopup";
import { useCart, cartIsDigitalOnly } from "~/lib/cart/CartContext";
import {
  SESSION_KEY,
  type CheckoutSessionData,
  type PaymentConfig,
} from "~/components/checkout/CheckoutTypes";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  devBypass: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CheckoutConfirmClient({ devBypass }: Props) {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [checkoutData, setCheckoutData] = useState<CheckoutSessionData | null>(
    null,
  );
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Read checkout data from sessionStorage ----
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const data = JSON.parse(saved) as CheckoutSessionData;

        // Must have shipping data (unless digital-only)
        if (
          !data.isDigitalOnly &&
          (!data.shipping?.name || !data.shipping?.email)
        ) {
          router.replace("/checkout/shipping");
          return;
        }

        // Must have a payment method selected
        if (!data.paymentMethod) {
          router.replace("/checkout/payment");
          return;
        }

        setCheckoutData(data);
        setIsReady(true);
        return;
      }
    } catch {
      // fall through to redirect
    }
    router.replace("/checkout/shipping");
  }, [router]);

  // ---- Redirect to shop if cart is empty ----
  useEffect(() => {
    if (cart.items.length !== 0) return undefined;
    const timer = setTimeout(() => {
      if (cart.items.length === 0) router.push("/shop");
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  // ---- Compute shipping cost from session ----
  const shippingCost = useMemo(() => {
    if (!checkoutData) return 0;
    return checkoutData.shippingMethod === "standard" ? 0 : 0;
  }, [checkoutData]);

  // ---- Place Order: Credit Card (Authorize.net) ----
  const handlePlaceOrderCC = useCallback(async () => {
    if (!checkoutData) return;

    // Ensure opaqueData exists for credit card payments
    if (!checkoutData.opaqueData) {
      setError(
        "Payment information is missing. Please go back and re-enter your card details.",
      );
      router.replace("/checkout/payment");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/authorize-net/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: checkoutData.shipping.email,
          phoneNumber: checkoutData.shipping.phone,
          items: cart.items.map((item) => ({
            variationId: item.id,
            quantity: item.quantity,
          })),
          opaqueData: checkoutData.opaqueData,
          isDigitalOnly: checkoutData.isDigitalOnly || undefined,
          shippingAddress: checkoutData.isDigitalOnly
            ? undefined
            : {
                name: checkoutData.shipping.name,
                line1: checkoutData.shipping.line1,
                line2: checkoutData.shipping.line2,
                city: checkoutData.shipping.city,
                state: checkoutData.shipping.state,
                postalCode: checkoutData.shipping.postalCode,
                country: checkoutData.shipping.country,
              },
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Payment failed. Please try again.");
        try {
          const existing = JSON.parse(
            sessionStorage.getItem(SESSION_KEY) || "{}",
          );
          delete existing.opaqueData;
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(existing));
        } catch {}
        setIsLoading(false);
        return;
      }

      // Success — clear session + cart, navigate to success page
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        // Ignore
      }

      clearCart();

      const params = new URLSearchParams({ order_id: String(data.orderId) });
      if (data.orderNumber) params.set("order_number", data.orderNumber);
      router.push(`/checkout/success?${params.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      try {
        const existing = JSON.parse(
          sessionStorage.getItem(SESSION_KEY) || "{}",
        );
        delete existing.opaqueData;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(existing));
      } catch {}
      setIsLoading(false);
    }
  }, [checkoutData, cart.items, clearCart, router]);

  // ---- Place Order: PrecisionPay ----
  const handlePlaceOrderPP = useCallback(async () => {
    if (!checkoutData) return;
    setIsLoading(true);
    setError(null);

    try {
      const displayAmount = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Dev bypass: skip PP portal, go straight to order creation
      if (devBypass) {
        const res = await fetch("/api/checkout/precision-pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            devBypass: true,
            amount: displayAmount,
            customerEmail: checkoutData.shipping.email,
            phoneNumber: checkoutData.shipping.phone || undefined,
            items: cart.items.map((item) => ({
              variationId: item.id,
              quantity: item.quantity,
            })),
            shippingAddress: {
              name: checkoutData.shipping.name,
              line1: checkoutData.shipping.line1,
              line2: checkoutData.shipping.line2 || undefined,
              city: checkoutData.shipping.city,
              state: checkoutData.shipping.state,
              postalCode: checkoutData.shipping.postalCode,
              country: checkoutData.shipping.country || "US",
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.orderId) {
          throw new Error(data.error || "Failed to create order");
        }

        try {
          sessionStorage.removeItem(SESSION_KEY);
        } catch {}
        clearCart();
        const params = new URLSearchParams({ order_id: String(data.orderId) });
        if (data.orderNumber) params.set("order_number", data.orderNumber);
        router.push(`/checkout/success?${params.toString()}`);
        return;
      }

      // Step 1: Get merchant nonce from server
      const nonceRes = await fetch("/api/checkout/precision-pay/nonce");
      if (!nonceRes.ok) {
        throw new Error("Failed to initialize PrecisionPay checkout");
      }
      const nonceData = await nonceRes.json();

      // Step 2: Open PP portal iframe
      const amountDollars = (displayAmount / 100).toFixed(2);

      const result = await openPrecisionPayPortal({
        merchantNonce: nonceData.merchantNonce,
        amountDollars,
        env: nonceData.env,
        checkoutPortalUrl: nonceData.checkoutPortalUrl,
      });

      if (!result.success) {
        setError(result.error || "Payment was not completed.");
        setIsLoading(false);
        return;
      }

      // Step 3: Complete payment + create order via API route
      const res = await fetch("/api/checkout/precision-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          precisionPayToken: result.precisionPayToken || undefined,
          plaidData: result.plaidData || undefined,
          amount: displayAmount,
          customerEmail: checkoutData.shipping.email,
          phoneNumber: checkoutData.shipping.phone || undefined,
          items: cart.items.map((item) => ({
            variationId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            name: checkoutData.shipping.name,
            line1: checkoutData.shipping.line1,
            line2: checkoutData.shipping.line2 || undefined,
            city: checkoutData.shipping.city,
            state: checkoutData.shipping.state,
            postalCode: checkoutData.shipping.postalCode,
            country: checkoutData.shipping.country || "US",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.orderId) {
        throw new Error(data.error || "Failed to create order");
      }

      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {}
      clearCart();
      const params = new URLSearchParams({ order_id: String(data.orderId) });
      if (data.orderNumber) params.set("order_number", data.orderNumber);
      router.push(`/checkout/success?${params.toString()}`);
    } catch (err) {
      console.error("[PrecisionPay] Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.",
      );
      setIsLoading(false);
    }
  }, [devBypass, checkoutData, cart.items, clearCart, router]);

  // ---- Loading / redirect states ----
  if (!isReady || !checkoutData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="border-primary-500 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-secondary-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="border-primary-500 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-secondary-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // ---- Derived values ----
  const paymentMethod = checkoutData.paymentMethod;
  const cardBrand = checkoutData.cardBrand || "card";
  const cardLast4 = checkoutData.cardLast4 || "****";

  // ---- Branded Pay button ----
  const payButton =
    paymentMethod === "credit_card" ? (
      <button
        type="button"
        disabled={isLoading}
        onClick={devBypass ? undefined : handlePlaceOrderCC}
        className="group bg-secondary-900 hover:bg-secondary-800 flex w-full items-center justify-center gap-3 rounded-full py-4 pr-5 pl-8 font-mono text-[0.7rem] tracking-[0.2em] text-white uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-2">
              <CardBrandIcon brand={cardBrand} className="h-5" />
              <span>Pay with &bull;&bull;&bull;{cardLast4}</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-white/20">
              <svg
                className="h-4 w-4"
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
            </span>
          </>
        )}
      </button>
    ) : (
      <button
        type="button"
        disabled={isLoading}
        onClick={handlePlaceOrderPP}
        className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#E5521A] py-4 pr-5 pl-8 font-mono text-[0.7rem] tracking-[0.2em] text-white uppercase transition-all duration-300 hover:bg-[#cc4a17] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-2">
              <img
                src="/images/payment/precisionpay.png"
                alt="PrecisionPay"
                className="h-4 brightness-0 invert"
              />
              <span>Checkout</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-white/20">
              <svg
                className="h-4 w-4"
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
            </span>
          </>
        )}
      </button>
    );

  // ---- devBypass: fall back to the legacy PlaceOrderPanel ----
  if (devBypass) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-24">
          <CheckoutStepIndicator currentStep={3} />

          {/* Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary-500 h-px w-8" />
                <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                  Checkout
                </span>
              </div>
              <h1 className="font-display text-secondary-900 text-4xl font-bold tracking-tight sm:text-5xl">
                Review Order
              </h1>
            </div>
            <Link
              href="/checkout/payment"
              className="text-secondary-400 hover:text-primary-600 hidden items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-colors sm:flex"
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
              Back to Payment
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Dev bypass: legacy PlaceOrderPanel */}
              <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
                <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="bg-primary-500 h-px w-6" />
                    <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                      Place Order (Dev Bypass)
                    </span>
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <span className="border-secondary-200 text-secondary-400 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.6rem] font-medium tracking-[0.15em] uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Test Mode
                    </span>
                    <span className="text-secondary-500 text-sm">
                      No payment will be processed
                    </span>
                  </div>

                  {error && (
                    <div className="mb-6 rounded-xl border border-red-200/80 bg-red-50 p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <PlaceOrderPanel
                    items={cart.items}
                    email={checkoutData.shipping.email}
                    phone={checkoutData.shipping.phone}
                    shippingAddress={{
                      name: checkoutData.shipping.name,
                      line1: checkoutData.shipping.line1,
                      line2: checkoutData.shipping.line2,
                      city: checkoutData.shipping.city,
                      state: checkoutData.shipping.state,
                      postalCode: checkoutData.shipping.postalCode,
                      country: checkoutData.shipping.country,
                    }}
                    onSuccess={({ orderId, orderNumber }) => {
                      try {
                        sessionStorage.removeItem(SESSION_KEY);
                      } catch {
                        // Ignore
                      }
                      clearCart();
                      const params = new URLSearchParams({
                        order_id: String(orderId),
                      });
                      if (orderNumber) params.set("order_number", orderNumber);
                      router.push(`/checkout/success?${params.toString()}`);
                    }}
                    onError={(message) => setError(message)}
                  />
                </div>
              </div>

              {/* Order Items card */}
              <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
                <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-primary-500 h-px w-6" />
                    <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                      Order Items
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {cart.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-black/[0.04]">
                          {item.image ? (
                            <ProductImage
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              fill
                              className="object-contain p-1"
                              sizes="48px"
                            />
                          ) : (
                            <div className="text-secondary-200 flex h-full w-full items-center justify-center">
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-secondary-900 truncate text-[0.8rem] leading-tight font-medium">
                            {item.name}
                          </p>
                          {item.packCount && (
                            <p className="text-secondary-400 mt-0.5 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                              Quantity: {item.packCount}
                            </p>
                          )}
                          {item.variation && !item.packCount && (
                            <p className="text-secondary-400 mt-0.5 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                              {item.variantType ? `${item.variantType}: ` : ""}
                              {item.variation}
                            </p>
                          )}
                          {item.variationTwo && (
                            <p className="text-secondary-400 mt-0.5 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                              {item.variantTypeTwo
                                ? `${item.variantTypeTwo}: `
                                : ""}
                              {item.variationTwo}
                            </p>
                          )}
                          <p className="text-secondary-400 font-mono text-[0.6rem]">
                            Qty {item.quantity}
                          </p>
                        </div>
                        <span className="text-secondary-700 flex-shrink-0 text-[0.8rem] font-medium tabular-nums">
                          {formatCentsToDollars(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right column — Order summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                cart={cart}
                showItemDetails={false}
                shippingCost={shippingCost}
                isDigitalOnly={checkoutData?.isDigitalOnly}
                ctaButton={payButton}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Main render (production / non-bypass) ----
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-24">
        <CheckoutStepIndicator currentStep={3} />

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-8" />
              <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Checkout
              </span>
            </div>
            <h1 className="font-display text-secondary-900 text-4xl font-bold tracking-tight sm:text-5xl">
              Review Order
            </h1>
          </div>
          <Link
            href="/checkout/payment"
            className="text-secondary-400 hover:text-primary-600 hidden items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-colors sm:flex"
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
            Back to Payment
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Back link mobile */}
            <Link
              href="/checkout/payment"
              className="text-secondary-400 hover:text-primary-600 flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-colors sm:hidden"
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
              Back to Payment
            </Link>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200/80 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Shipping Address card (read-only) — hidden for digital-only */}
            {!checkoutData.isDigitalOnly && (
              <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
                <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-500 h-px w-6" />
                      <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                        Shipping Address
                      </span>
                    </div>
                    <Link
                      href="/checkout/shipping"
                      className="text-primary-600 hover:text-primary-700 font-mono text-[0.6rem] tracking-[0.1em] uppercase transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                  <div className="text-secondary-700 space-y-1 text-sm">
                    <p className="text-secondary-900 font-medium">
                      {checkoutData.shipping.name}
                    </p>
                    <p>{checkoutData.shipping.line1}</p>
                    {checkoutData.shipping.line2 && (
                      <p>{checkoutData.shipping.line2}</p>
                    )}
                    <p>
                      {checkoutData.shipping.city},{" "}
                      {checkoutData.shipping.state}{" "}
                      {checkoutData.shipping.postalCode}
                      {checkoutData.shipping.country &&
                        checkoutData.shipping.country !== "US" && (
                          <>, {checkoutData.shipping.country}</>
                        )}
                    </p>
                    <p className="text-secondary-500">
                      {checkoutData.shipping.email}
                    </p>
                    {checkoutData.shipping.phone && (
                      <p className="text-secondary-500">
                        {checkoutData.shipping.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Method card (read-only) — hidden for digital-only */}
            {!checkoutData.isDigitalOnly && (
              <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
                <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-500 h-px w-6" />
                      <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                        Shipping Method
                      </span>
                    </div>
                    <Link
                      href="/checkout/shipping"
                      className="text-primary-600 hover:text-primary-700 font-mono text-[0.6rem] tracking-[0.1em] uppercase transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                  <div className="text-secondary-700 flex items-center gap-3 text-sm">
                    <svg
                      className="text-secondary-400 h-5 w-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <div>
                      <p className="text-secondary-900 font-medium">Standard</p>
                      <p className="text-green-600">FREE</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method card (read-only) */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-500 h-px w-6" />
                    <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                      Payment Method
                    </span>
                  </div>
                  <Link
                    href="/checkout/payment"
                    className="text-primary-600 hover:text-primary-700 font-mono text-[0.6rem] tracking-[0.1em] uppercase transition-colors"
                  >
                    Edit
                  </Link>
                </div>

                {paymentMethod === "credit_card" && (
                  <div className="text-secondary-700 flex items-center gap-3 text-sm">
                    <CardBrandIcon brand={cardBrand} className="h-6" />
                    <p className="text-secondary-900 font-medium">
                      Card ending in {cardLast4}
                    </p>
                  </div>
                )}

                {paymentMethod === "precision_pay" && (
                  <img
                    src="/images/payment/precisionpay.png"
                    alt="PrecisionPay"
                    className="h-6"
                  />
                )}
              </div>
            </div>

            {/* Order Items card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Order Items
                  </span>
                </div>
                <ul className="space-y-3">
                  {cart.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-black/[0.04]">
                        {item.image ? (
                          <ProductImage
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        ) : (
                          <div className="text-secondary-200 flex h-full w-full items-center justify-center">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-secondary-900 truncate text-[0.8rem] leading-tight font-medium">
                          {item.name}
                        </p>
                        {item.packCount && (
                          <p className="text-secondary-400 mt-0.5 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                            Quantity: {item.packCount}
                          </p>
                        )}
                        {item.variation && !item.packCount && (
                          <p className="text-secondary-400 mt-0.5 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                            {item.variantType ? `${item.variantType}: ` : ""}
                            {item.variation}
                          </p>
                        )}
                        {item.variationTwo && (
                          <p className="text-secondary-400 mt-0.5 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                            {item.variantTypeTwo
                              ? `${item.variantTypeTwo}: `
                              : ""}
                            {item.variationTwo}
                          </p>
                        )}
                        <p className="text-secondary-400 font-mono text-[0.6rem]">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <span className="text-secondary-700 flex-shrink-0 text-[0.8rem] font-medium tabular-nums">
                        {formatCentsToDollars(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right column — Order summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              showItemDetails={false}
              shippingCost={shippingCost}
              ctaButton={payButton}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
