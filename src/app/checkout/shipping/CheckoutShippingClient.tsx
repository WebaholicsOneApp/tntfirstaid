"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckoutStepIndicator from "~/components/checkout/CheckoutStepIndicator";
import OrderSummary from "~/components/checkout/OrderSummary";
import SavedDetailsCard from "~/components/checkout/SavedDetailsCard";
import ShippingForm, {
  EMPTY_SHIPPING,
  type ShippingFields,
} from "~/components/checkout/ShippingForm";
import {
  SESSION_KEY,
  type CheckoutSessionData,
  type SelectedShippingRate,
} from "~/components/checkout/CheckoutTypes";
import { formatCentsToDollars } from "~/lib/utils";
import { useAuth } from "~/lib/auth/AuthContext";
import { useCart } from "~/lib/cart/CartContext";

export default function CheckoutShippingClient() {
  const router = useRouter();
  const { cart } = useCart();
  const { customer, isAuthenticated } = useAuth();

  const [shipping, setShipping] = useState<ShippingFields>(EMPTY_SHIPPING);
  const [shippingFieldErrors, setShippingFieldErrors] = useState<
    Map<string, string>
  >(new Map());
  const [savedDetailsApplied, setSavedDetailsApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shipping rate state
  const [rates, setRates] = useState<SelectedShippingRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<SelectedShippingRate | null>(
    null,
  );
  const [ratesFetched, setRatesFetched] = useState(false);

  // ---- Redirect to shop if cart is empty ----
  useEffect(() => {
    if (cart.items.length !== 0) return undefined;
    const timer = setTimeout(() => {
      if (cart.items.length === 0) router.push("/shop");
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  // ---- Restore shipping fields and selected rate from sessionStorage ----
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const data = JSON.parse(saved) as CheckoutSessionData;
        if (data.shipping) {
          setShipping({
            name: data.shipping.name || "",
            email: data.shipping.email || "",
            phone: data.shipping.phone || "",
            line1: data.shipping.line1 || "",
            line2: data.shipping.line2 || "",
            city: data.shipping.city || "",
            state: data.shipping.state || "",
            postalCode: data.shipping.postalCode || "",
            country: data.shipping.country || "US",
          });
        }
        if (data.selectedShippingRate) {
          setSelectedRate(data.selectedShippingRate);
          setRates([data.selectedShippingRate]);
          setRatesFetched(true);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // ---- Handlers ----

  const handleShippingChange = useCallback(
    (field: keyof ShippingFields, value: string) => {
      setShipping((prev) => ({ ...prev, [field]: value }));
      setShippingFieldErrors((prev) => {
        if (!prev.size) return prev;
        const n = new Map(prev);
        n.delete(field);
        return n;
      });
      setError(null);
      // Clear rates when address changes — require re-fetch
      setRates([]);
      setSelectedRate(null);
      setRatesFetched(false);
      setRatesError(null);
    },
    [],
  );

  const handleUseSavedDetails = useCallback(() => {
    if (!customer) return;
    setShipping({
      name: `${customer.firstName || ""}${customer.lastName ? ` ${customer.lastName}` : ""}`.trim(),
      email: customer.email,
      phone: customer.phone || "",
      line1: customer.defaultAddress?.line1 || "",
      line2: customer.defaultAddress?.line2 || "",
      city: customer.defaultAddress?.city || "",
      state: customer.defaultAddress?.state || "",
      postalCode: customer.defaultAddress?.postalCode || "",
      country: customer.defaultAddress?.country || "US",
    });
    setSavedDetailsApplied(true);
    setShippingFieldErrors(new Map<string, string>());
    setError(null);
    setRates([]);
    setSelectedRate(null);
    setRatesFetched(false);
    setRatesError(null);
  }, [customer]);

  const handleClearSavedDetails = useCallback(() => {
    setShipping(EMPTY_SHIPPING);
    setSavedDetailsApplied(false);
  }, []);

  const validateAddress = useCallback((): boolean => {
    const shipErrors = new Map<string, string>();
    if (!shipping.name.trim()) shipErrors.set("name", "Full name is required");
    if (!shipping.email.trim())
      shipErrors.set("email", "Email address is required");
    if (!shipping.line1.trim())
      shipErrors.set("line1", "Street address is required");
    if (!shipping.city.trim()) shipErrors.set("city", "City is required");
    if (!shipping.state.trim()) shipErrors.set("state", "State is required");
    if (!shipping.postalCode.trim())
      shipErrors.set("postalCode", "ZIP code is required");

    if (shipErrors.size > 0) {
      setShippingFieldErrors(shipErrors);
      return false;
    }
    setShippingFieldErrors(new Map<string, string>());
    return true;
  }, [shipping]);

  // ---- Fetch shipping rates from UPS via API ----
  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    setRatesError(null);
    setRates([]);
    setSelectedRate(null);

    try {
      const res = await fetch("/api/checkout/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            variationId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            line1: shipping.line1,
            line2: shipping.line2 || undefined,
            city: shipping.city,
            state: shipping.state,
            postalCode: shipping.postalCode,
            country: shipping.country || "US",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRatesError(
          data.message || "Failed to fetch shipping rates. Please try again.",
        );
        setRatesLoading(false);
        return;
      }

      const fetchedRates: SelectedShippingRate[] = data.rates ?? [];
      if (fetchedRates.length === 0) {
        setRatesError(
          "No UPS shipping options available for this address. Please verify your address and try again.",
        );
      } else {
        setRates(fetchedRates);
        // Auto-select UPS Ground (code '03') or fall back to cheapest
        const ground = fetchedRates.find((r) => r.serviceCode === "03");
        setSelectedRate(ground ?? fetchedRates[0] ?? null);
      }
      setRatesFetched(true);
    } catch {
      setRatesError("Failed to fetch shipping rates. Please try again.");
    } finally {
      setRatesLoading(false);
    }
  }, [shipping, cart.items]);

  // ---- Auto-fetch rates when address is sufficiently complete (debounced) ----
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const hasAddress =
      shipping.city.trim().length > 1 &&
      shipping.state.trim().length >= 2 &&
      shipping.postalCode.trim().length >= 5;

    if (!hasAddress || cart.items.length === 0) return;

    debounceRef.current = setTimeout(() => {
      fetchRates();
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    shipping.city,
    shipping.state,
    shipping.postalCode,
    shipping.line1,
    fetchRates,
    cart.items.length,
  ]);

  const handleContinueToPayment = useCallback(() => {
    if (!validateAddress()) return;

    if (!selectedRate) {
      setError("Please select a shipping option.");
      return;
    }

    setError(null);

    const sessionData: CheckoutSessionData = {
      shipping: {
        name: shipping.name,
        email: shipping.email,
        phone: shipping.phone || undefined,
        line1: shipping.line1,
        line2: shipping.line2 || undefined,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postalCode,
        country: shipping.country || undefined,
      },
      shippingMethod: selectedRate.serviceCode,
      selectedShippingRate: selectedRate,
      paymentMethod: "credit_card",
      sendEmail: false,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    router.push("/checkout/payment");
  }, [shipping, selectedRate, router, validateAddress]);

  // ---- CTA button for sidebar ----
  const ctaButton = (
    <button
      onClick={handleContinueToPayment}
      disabled={!selectedRate}
      className="group bg-secondary-900 hover:bg-secondary-800 flex w-full items-center justify-center gap-3 rounded-full py-4 pr-5 pl-8 font-mono text-[0.7rem] tracking-[0.2em] text-white uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <span>Continue to Payment</span>
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
    </button>
  );

  // ---- Empty cart state ----
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

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-24">
        {/* Step indicator */}
        <CheckoutStepIndicator currentStep={1} />

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
              Shipping
            </h1>
          </div>
          <Link
            href="/checkout"
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
            Back to Review
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Back link mobile */}
            <Link
              href="/checkout"
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
              Back to Review
            </Link>

            {/* Shipping Information Card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Shipping Information
                  </span>
                </div>

                {/* Saved address card */}
                {isAuthenticated && customer && (
                  <div className="mb-6">
                    <SavedDetailsCard
                      customer={customer}
                      isApplied={savedDetailsApplied}
                      onApply={handleUseSavedDetails}
                      onClear={handleClearSavedDetails}
                    />
                  </div>
                )}

                <ShippingForm
                  data={shipping}
                  onChange={handleShippingChange}
                  fieldErrors={shippingFieldErrors}
                />

                {/* Shipping Method — inline after address fields */}
                {(ratesLoading || ratesFetched || ratesError) && (
                  <div className="mt-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="bg-primary-500 h-px w-6" />
                      <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                        Shipping Method
                      </span>
                    </div>

                    {ratesLoading && rates.length === 0 && (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="border-secondary-100 animate-pulse rounded-2xl border-2 p-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-secondary-100 h-4 w-4 rounded-full" />
                              <div className="flex flex-1 items-center justify-between">
                                <div className="space-y-1.5">
                                  <div className="bg-secondary-100 h-4 w-28 rounded" />
                                  <div className="bg-secondary-50 h-3 w-20 rounded" />
                                </div>
                                <div className="bg-secondary-100 h-4 w-16 rounded" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {ratesError && !ratesLoading && (
                      <div className="rounded-xl border border-red-200/80 bg-red-50 p-4">
                        <p className="text-sm text-red-600">{ratesError}</p>
                      </div>
                    )}

                    {rates.length > 0 && (
                      <div className="space-y-3">
                        {rates.map((rate) => (
                          <label
                            key={rate.serviceCode}
                            className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                              selectedRate?.serviceCode === rate.serviceCode
                                ? "border-primary-500 bg-primary-50/30"
                                : "border-secondary-200 hover:border-secondary-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="shippingRate"
                              value={rate.serviceCode}
                              checked={
                                selectedRate?.serviceCode === rate.serviceCode
                              }
                              onChange={() => setSelectedRate(rate)}
                              className="border-secondary-300 text-primary-500 focus:ring-primary-500 h-4 w-4"
                            />
                            <div className="flex flex-1 items-center justify-between">
                              <div>
                                <p className="text-secondary-900 text-sm font-medium">
                                  {rate.serviceName}
                                </p>
                                {rate.deliveryDays !== null ? (
                                  <p className="text-secondary-500 text-xs">
                                    {rate.deliveryDays} business day
                                    {rate.deliveryDays !== 1 ? "s" : ""}
                                  </p>
                                ) : null}
                              </div>
                              <span className="text-secondary-900 font-mono text-sm font-semibold">
                                {formatCentsToDollars(rate.totalCents)}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Right column — Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              showItemDetails={false}
              shippingCost={selectedRate?.totalCents}
              shippingLabel={selectedRate?.serviceName}
              shippingState={shipping.state}
              ctaButton={ctaButton}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
