'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CheckoutStepIndicator from '~/components/checkout/CheckoutStepIndicator';
import OrderSummary from '~/components/checkout/OrderSummary';
import SavedDetailsCard from '~/components/checkout/SavedDetailsCard';
import ShippingForm, { EMPTY_SHIPPING, type ShippingFields } from '~/components/checkout/ShippingForm';
import { SESSION_KEY, type CheckoutSessionData } from '~/components/checkout/CheckoutTypes';
import { useAuth } from '~/lib/auth/AuthContext';
import { useCart } from '~/lib/cart/CartContext';

export default function CheckoutShippingClient() {
  const router = useRouter();
  const { cart } = useCart();
  const { customer, isAuthenticated } = useAuth();

  const [shipping, setShipping] = useState<ShippingFields>(EMPTY_SHIPPING);
  const [shippingFieldErrors, setShippingFieldErrors] = useState<Map<string, string>>(new Map());
  const [shippingMethod, setShippingMethod] = useState<'standard'>('standard');
  const [savedDetailsApplied, setSavedDetailsApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Redirect to shop if cart is empty ----
  useEffect(() => {
    if (cart.items.length !== 0) return undefined;
    const timer = setTimeout(() => {
      if (cart.items.length === 0) router.push('/shop');
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  // ---- Restore shipping fields from sessionStorage (back-nav from payment) ----
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const data = JSON.parse(saved) as CheckoutSessionData;
        if (data.shipping) {
          setShipping({
            name: data.shipping.name || '',
            email: data.shipping.email || '',
            phone: data.shipping.phone || '',
            line1: data.shipping.line1 || '',
            line2: data.shipping.line2 || '',
            city: data.shipping.city || '',
            state: data.shipping.state || '',
            postalCode: data.shipping.postalCode || '',
            country: data.shipping.country || 'US',
          });
        }
        if (data.shippingMethod) {
          setShippingMethod(data.shippingMethod as 'standard');
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
    },
    [],
  );

  const handleUseSavedDetails = useCallback(() => {
    if (!customer) return;
    setShipping({
      name: `${customer.firstName || ''}${customer.lastName ? ` ${customer.lastName}` : ''}`.trim(),
      email: customer.email,
      phone: customer.phone || '',
      line1: customer.defaultAddress?.line1 || '',
      line2: customer.defaultAddress?.line2 || '',
      city: customer.defaultAddress?.city || '',
      state: customer.defaultAddress?.state || '',
      postalCode: customer.defaultAddress?.postalCode || '',
      country: customer.defaultAddress?.country || 'US',
    });
    setSavedDetailsApplied(true);
    setShippingFieldErrors(new Map<string, string>());
    setError(null);
  }, [customer]);

  const handleClearSavedDetails = useCallback(() => {
    setShipping(EMPTY_SHIPPING);
    setSavedDetailsApplied(false);
  }, []);

  const handleContinueToPayment = useCallback(() => {
    const shipErrors = new Map<string, string>();
    if (!shipping.name.trim()) shipErrors.set('name', 'Full name is required');
    if (!shipping.email.trim()) shipErrors.set('email', 'Email address is required');
    if (!shipping.line1.trim()) shipErrors.set('line1', 'Street address is required');
    if (!shipping.city.trim()) shipErrors.set('city', 'City is required');
    if (!shipping.state.trim()) shipErrors.set('state', 'State is required');
    if (!shipping.postalCode.trim()) shipErrors.set('postalCode', 'ZIP code is required');

    if (shipErrors.size > 0) {
      setShippingFieldErrors(shipErrors);
      return;
    }
    setShippingFieldErrors(new Map<string, string>());
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
      shippingMethod: shippingMethod,
      paymentMethod: 'credit_card', // default, will be overwritten in step 2
      sendEmail: false,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    router.push('/checkout/payment');
  }, [shipping, shippingMethod, router]);

  // ---- CTA button for sidebar ----
  const ctaButton = (
    <button
      onClick={handleContinueToPayment}
      className="group flex w-full items-center justify-center gap-3 rounded-full bg-secondary-900 py-4 pl-8 pr-5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-secondary-800 active:scale-[0.98]"
      style={{
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span>Continue to Payment</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-white/20">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </span>
    </button>
  );

  // ---- Empty cart state ----
  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
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
              <div className="h-px w-8 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                Checkout
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-secondary-900 sm:text-5xl">
              Shipping
            </h1>
          </div>
          <Link
            href="/checkout"
            className="hidden items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase text-secondary-400 transition-colors hover:text-primary-600 sm:flex"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
              className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase text-secondary-400 transition-colors hover:text-primary-600 sm:hidden"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Review
            </Link>

            {/* Shipping Method Card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px w-6 bg-primary-500" />
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                    Shipping Method
                  </span>
                </div>

                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-primary-500 bg-primary-50/30'
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="h-4 w-4 border-secondary-300 text-primary-500 focus:ring-primary-500"
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-900">Standard Shipping</p>
                      <p className="text-xs text-secondary-500">Estimated 5-7 business days</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-green-600">FREE</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Shipping Form Card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px w-6 bg-primary-500" />
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                    Shipping Information
                  </span>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200/80 bg-red-50 p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

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
              </div>
            </div>

          </div>

          {/* Right column — Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary cart={cart} showItemDetails={false} shippingCost={undefined} ctaButton={ctaButton} />
          </div>
        </div>
      </div>
    </div>
  );
}
