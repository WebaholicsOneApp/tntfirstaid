'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductImage } from '~/components/ui/ProductImage';
import AuthorizeNetCheckoutForm from '~/components/checkout/AuthorizeNetCheckoutForm';
import CheckoutAuthPrompt from '~/components/checkout/CheckoutAuthPrompt';
import ExpressCheckout from '~/components/checkout/ExpressCheckout';
import SavedDetailsCard from '~/components/checkout/SavedDetailsCard';
import ShippingForm, { EMPTY_SHIPPING, type ShippingFields } from '~/components/checkout/ShippingForm';
import StripeProvider from '~/components/checkout/StripeProvider';
import { useAuth } from '~/lib/auth/AuthContext';
import { useCart } from '~/lib/cart/CartContext';
import { storeConfig } from '~/lib/store-config';
import { formatCentsToDollars, getImageUrl } from '~/lib/utils';

// ---------------------------------------------------------------------------
// Shared types & constants
// ---------------------------------------------------------------------------

export const SESSION_KEY = 'alpha-checkout-data';

export interface PaymentConfig {
  providerType: 'stripe_connect' | 'authorize_net' | null;
  status: 'ready' | 'needs_action' | 'not_configured';
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
  sendEmail: boolean;
}

export type { ShippingFields };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  paymentConfig: PaymentConfig | null;
}

export default function CheckoutPaymentClient({ paymentConfig }: Props) {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { customer, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedDetailsApplied, setSavedDetailsApplied] = useState(false);

  // Stripe-specific state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(
    paymentConfig?.stripePublishableKey ?? null,
  );
  const [stripeConnectAccountId, setStripeConnectAccountId] = useState<string | null>(
    paymentConfig?.stripeConnectAccountId ?? null,
  );
  const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);

  // Shipping form state (single object for all fields)
  const [shipping, setShipping] = useState<ShippingFields>(EMPTY_SHIPPING);
  const [shippingFieldErrors, setShippingFieldErrors] = useState<Set<string>>(new Set());

  // ---- Redirect to shop if cart is empty ----
  useEffect(() => {
    if (cart.items.length !== 0) return undefined;
    const timer = setTimeout(() => {
      if (cart.items.length === 0) router.push('/shop');
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  // ---- Restore shipping fields from sessionStorage (back-nav from confirm) ----
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
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // ---- Derived values ----
  const shippingCost = 0;
  const estimatedTax = Math.round(cart.subtotal * 0.08);
  const total = cart.subtotal + shippingCost + estimatedTax;

  // ---- Create Stripe PaymentIntent (non-devBypass) ----
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (
        cart.items.length === 0 ||
        paymentConfig?.providerType !== 'stripe_connect' ||
        paymentConfig.status !== 'ready'
      ) {
        setClientSecret(null);
        setPaymentIntentId(null);
        setExpressCheckoutReady(false);
        return;
      }

      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.items.map((item) => ({
              variationId: item.id,
              productId: item.productId,
              name: item.name,
              variation: item.variation,
              manufacturerNo: item.manufacturerNo,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.image || undefined,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize Stripe checkout.');
        }

        const data = (await response.json()) as {
          clientSecret: string | null;
          paymentIntentId: string | null;
          publishableKey?: string | null;
          stripeConnectAccountId?: string | null;
        };

        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setStripePublishableKey(
          data.publishableKey || paymentConfig.stripePublishableKey,
        );
        setStripeConnectAccountId(
          data.stripeConnectAccountId || paymentConfig.stripeConnectAccountId,
        );
        setExpressCheckoutReady(!!data.clientSecret);
      } catch (err) {
        console.error('Failed to create PaymentIntent:', err);
        setExpressCheckoutReady(false);
      }
    };

    createPaymentIntent();
  }, [cart.items, paymentConfig]);

  // ---- Handlers ----

  const handleShippingChange = useCallback(
    (field: keyof ShippingFields, value: string) => {
      setShipping((prev) => ({ ...prev, [field]: value }));
      setShippingFieldErrors((prev) => {
        if (!prev.size) return prev;
        const n = new Set(prev);
        n.delete(field);
        return n;
      });
    },
    [],
  );

  const handleExpressCheckoutSuccess = useCallback(
    async (stripePaymentIntentId: string, paymentMethod: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/express-checkout-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stripePaymentIntentId,
            customerEmail: shipping.email.trim() || 'express-checkout@alphamunitions.com',
            paymentMethod,
            items: cart.items.map((item) => ({
              variationId: item.id,
              productId: item.productId,
              name: item.name,
              variation: item.variation || null,
              manufacturerNo: item.manufacturerNo || null,
              imageUrl: item.image || null,
              quantity: item.quantity,
              price: item.price,
              tax: Math.round(item.price * item.quantity * 0.08),
            })),
            subtotal: cart.subtotal,
            shippingCost: 0,
            tax: estimatedTax,
            total,
            shippingAddress: {
              name: shipping.name.trim() || 'Express Checkout',
              line1: shipping.line1.trim(),
              line2: shipping.line2.trim() || undefined,
              city: shipping.city.trim(),
              state: shipping.state.trim(),
              postalCode: shipping.postalCode.trim(),
              country: shipping.country.trim() || 'US',
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create order');
        }

        const orderData = (await response.json()) as {
          orderId: number;
          orderNumber?: string | null;
        };

        clearCart();

        const params = new URLSearchParams({
          payment_intent: stripePaymentIntentId,
          order_id: String(orderData.orderId),
        });

        if (orderData.orderNumber) {
          params.set('order_number', orderData.orderNumber);
        }

        router.push(`/checkout/success?${params.toString()}`);
      } catch (err) {
        console.error('Order creation error:', err);
        setError('Payment succeeded but order creation failed. Please contact support.');
        setIsLoading(false);
      }
    },
    [cart, estimatedTax, total, clearCart, router, shipping],
  );

  const handleExpressCheckoutError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            variationId: item.id,
            productId: item.productId,
            name: item.name,
            variation: item.variation,
            manufacturerNo: item.manufacturerNo,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.image || undefined,
          })),
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
          ...(shipping.email.trim() ? { customerEmail: shipping.email.trim() } : {}),
          ...(shipping.name.trim()
            ? {
                shippingAddress: {
                  name: shipping.name.trim(),
                  line1: shipping.line1.trim(),
                  line2: shipping.line2.trim() || undefined,
                  city: shipping.city.trim(),
                  state: shipping.state.trim(),
                  postalCode: shipping.postalCode.trim(),
                  country: shipping.country.trim() || 'US',
                },
              }
            : {}),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        throw new Error(errorData.message || 'Checkout failed');
      }

      const { url } = (await response.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAuthorizeNetSuccess = useCallback(
    ({ orderId, orderNumber }: { orderId: number; orderNumber: string | null }) => {
      clearCart();
      const params = new URLSearchParams({ order_id: String(orderId) });
      if (orderNumber) params.set('order_number', orderNumber);
      router.push(`/checkout/success?${params.toString()}`);
    },
    [clearCart, router],
  );

  const handleAuthorizeNetError = useCallback((message: string) => {
    setError(message || null);
  }, []);

  // ---- "Use saved details" (opt-in prefill from account profile) ----
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
  }, [customer]);

  const handleClearSavedDetails = useCallback(() => {
    setShipping(EMPTY_SHIPPING);
    setSavedDetailsApplied(false);
  }, []);

  // ---- "Continue to Review" (dev bypass → confirm page) ----
  const handleContinueToReview = useCallback(() => {
    const shipErrors = new Set<string>();
    if (!shipping.name.trim()) shipErrors.add('name');
    if (!shipping.email.trim()) shipErrors.add('email');
    if (!shipping.line1.trim()) shipErrors.add('line1');
    if (!shipping.city.trim()) shipErrors.add('city');
    if (!shipping.state.trim()) shipErrors.add('state');
    if (!shipping.postalCode.trim()) shipErrors.add('postalCode');
    if (shipErrors.size > 0) {
      setShippingFieldErrors(shipErrors);
      setError('Please fill in all shipping fields before continuing.');
      return;
    }
    setShippingFieldErrors(new Set());

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
      sendEmail: false,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    router.push('/checkout/confirm');
  }, [shipping, router]);

  // ---- Render checkout panel (payment-specific content only) ----
  const renderCheckoutPanel = () => {
    if (paymentConfig?.devBypass) {
      return (
        <div className="space-y-4">
          <button
            onClick={handleContinueToReview}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-secondary-900 py-4 pl-8 pr-5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-secondary-800 active:scale-[0.98]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <span>Continue to Review</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:bg-white/20 group-hover:translate-x-0.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-secondary-200 px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-secondary-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Test Mode
            </span>
          </div>
        </div>
      );
    }

    if (!paymentConfig || paymentConfig.status !== 'ready') {
      return (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50 p-6 text-sm text-amber-800">
          Checkout is not configured for this storefront yet. Please contact Alpha Munitions support.
        </div>
      );
    }

    if (
      paymentConfig.providerType === 'authorize_net' &&
      paymentConfig.authNetApiLoginId &&
      paymentConfig.authNetClientKey &&
      paymentConfig.authNetAcceptJsUrl
    ) {
      return (
        <AuthorizeNetCheckoutForm
          apiLoginId={paymentConfig.authNetApiLoginId}
          clientKey={paymentConfig.authNetClientKey}
          acceptJsUrl={paymentConfig.authNetAcceptJsUrl}
          items={cart.items.map((item) => ({
            variationId: item.id,
            quantity: item.quantity,
          }))}
          totalLabel={formatCentsToDollars(total)}
          shippingData={shipping}
          onSuccess={handleAuthorizeNetSuccess}
          onError={handleAuthorizeNetError}
          onShippingFieldErrors={setShippingFieldErrors}
        />
      );
    }

    if (
      paymentConfig.providerType === 'stripe_connect' &&
      stripePublishableKey
    ) {
      const expressSlot =
        paymentConfig.expressCheckoutEnabled &&
        clientSecret &&
        expressCheckoutReady &&
        paymentIntentId ? (
          <StripeProvider
            clientSecret={clientSecret}
            amount={total}
            primaryColor={storeConfig.primaryColor}
            publishableKey={stripePublishableKey}
            stripeAccountId={stripeConnectAccountId}
          >
            <ExpressCheckout
              items={cart.items}
              subtotal={cart.subtotal}
              tax={estimatedTax}
              total={total}
              paymentIntentId={paymentIntentId}
              onSuccess={handleExpressCheckoutSuccess}
              onError={handleExpressCheckoutError}
            />
          </StripeProvider>
        ) : undefined;

      return (
        <CheckoutAuthPrompt
          onGuestCheckout={handleCheckout}
          onAuthCheckout={handleCheckout}
          isLoading={isLoading}
          expressCheckoutSlot={expressSlot}
        />
      );
    }

    return (
      <div className="rounded-xl border border-red-200/80 bg-red-50 p-6 text-sm text-red-700">
        This storefront payment configuration is incomplete.
      </div>
    );
  };

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

  // ---- Main render ----
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-24">
        {/* Step indicator — 3 steps, step 2 active */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <Link
            href="/checkout"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 font-mono text-[0.6rem] text-white">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-secondary-400">
              Review
            </span>
          </Link>
          <div className="h-px w-12 bg-secondary-900" />
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-900 font-mono text-[0.6rem] text-white">
              2
            </span>
            <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-secondary-900">
              Shipping
            </span>
          </div>
          <div className="h-px w-12 bg-secondary-200" />
          <div className="flex items-center gap-2 opacity-40">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-200 font-mono text-[0.6rem] text-secondary-500">
              3
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-secondary-400">
              Confirm
            </span>
          </div>
        </div>

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
              Shipping & Payment
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

            {/* Shipping form — ALWAYS visible for all providers */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px w-6 bg-primary-500" />
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                    Shipping Information
                  </span>
                </div>

                {/* Saved address card — shown for ALL providers when authenticated */}
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

                <ShippingForm data={shipping} onChange={handleShippingChange} fieldErrors={shippingFieldErrors} />
              </div>
            </div>

            {/* Payment / Continue card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px w-6 bg-primary-500" />
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                    Payment Method
                  </span>
                </div>

                {error && (
                  <div className="mb-6 rounded-xl border border-red-200/80 bg-red-50 p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {renderCheckoutPanel()}
              </div>
            </div>
          </div>

          {/* Right column — Compact order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="h-px w-6 bg-primary-500" />
                    <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                      Your Order
                    </span>
                  </div>

                  {/* Compact item list */}
                  <ul className="mb-5 space-y-3">
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
                            <div className="flex h-full w-full items-center justify-center text-secondary-200">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.8rem] font-medium leading-tight text-secondary-900">
                            {item.name}
                          </p>
                          <p className="font-mono text-[0.6rem] text-secondary-400">
                            Qty {item.quantity}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-[0.8rem] font-medium tabular-nums text-secondary-700">
                          {formatCentsToDollars(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-secondary-100 pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Subtotal</span>
                        <span className="tabular-nums text-secondary-900">
                          {formatCentsToDollars(cart.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Shipping</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Est. Tax</span>
                        <span className="font-mono tabular-nums text-secondary-900">
                          {formatCentsToDollars(estimatedTax)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-secondary-100 pt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-secondary-400">
                          Total
                        </span>
                        <span className="font-display text-2xl font-bold tracking-tight text-secondary-900">
                          {formatCentsToDollars(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
