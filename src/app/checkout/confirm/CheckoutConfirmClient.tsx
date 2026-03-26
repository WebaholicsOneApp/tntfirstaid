'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductImage } from '~/components/ui/ProductImage';
import PlaceOrderPanel from '~/components/checkout/PlaceOrderPanel';
import { useCart } from '~/lib/cart/CartContext';
import { formatCentsToDollars, getImageUrl } from '~/lib/utils';

// ---------------------------------------------------------------------------
// Shared types & constants (duplicated from payment client to avoid cross-imports)
// ---------------------------------------------------------------------------

const SESSION_KEY = 'alpha-checkout-data';

interface CheckoutSessionData {
  shipping: {
    name: string;
    email: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  sendEmail: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  devBypass: boolean;
}

export default function CheckoutConfirmClient({ devBypass }: Props) {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [checkoutData, setCheckoutData] = useState<CheckoutSessionData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Read checkout data from sessionStorage ----
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const data = JSON.parse(saved) as CheckoutSessionData;
        if (data.shipping?.name && data.shipping?.email) {
          setCheckoutData(data);
          setIsReady(true);
          return;
        }
      }
    } catch {
      // fall through to redirect
    }
    router.replace('/checkout/payment');
  }, [router]);

  // ---- Redirect to shop if cart is empty ----
  useEffect(() => {
    if (cart.items.length !== 0) return undefined;
    const timer = setTimeout(() => {
      if (cart.items.length === 0) router.push('/shop');
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  // ---- Derived values ----
  const shippingCost = 0;
  const estimatedTax = Math.round(cart.subtotal * 0.08);
  const total = cart.subtotal + shippingCost + estimatedTax;

  // ---- Handlers ----
  const handlePlaceOrderSuccess = useCallback(
    ({ orderId, orderNumber }: { orderId: number; orderNumber: string | null }) => {
      // Clear sessionStorage first
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        // Ignore
      }

      clearCart();

      const params = new URLSearchParams({ order_id: String(orderId) });
      if (orderNumber) params.set('order_number', orderNumber);
      router.push(`/checkout/success?${params.toString()}`);
    },
    [clearCart, router],
  );

  const handlePlaceOrderError = useCallback((message: string) => {
    setError(message);
  }, []);

  // ---- Loading / redirect states ----
  if (!isReady || !checkoutData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-secondary-600">Loading order details...</p>
        </div>
      </div>
    );
  }

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
        {/* Step indicator — 3 steps, step 3 active */}
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
          <div className="h-px w-12 bg-green-600" />
          <Link
            href="/checkout/payment"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 font-mono text-[0.6rem] text-white">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-secondary-400">
              Shipping
            </span>
          </Link>
          <div className="h-px w-12 bg-secondary-900" />
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-900 font-mono text-[0.6rem] text-white">
              3
            </span>
            <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-secondary-900">
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
              Confirm Order
            </h1>
          </div>
          <Link
            href="/checkout/payment"
            className="hidden items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase text-secondary-400 transition-colors hover:text-primary-600 sm:flex"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shipping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Back link mobile */}
            <Link
              href="/checkout/payment"
              className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase text-secondary-400 transition-colors hover:text-primary-600 sm:hidden"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Shipping
            </Link>

            {/* Shipping address card (read-only) */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-6 bg-primary-500" />
                    <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                      Shipping Address
                    </span>
                  </div>
                  <Link
                    href="/checkout/payment"
                    className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-primary-600 transition-colors hover:text-primary-700"
                  >
                    Edit
                  </Link>
                </div>
                <div className="space-y-1 text-sm text-secondary-700">
                  <p className="font-medium text-secondary-900">{checkoutData.shipping.name}</p>
                  <p>{checkoutData.shipping.line1}</p>
                  <p>
                    {checkoutData.shipping.city}, {checkoutData.shipping.state}{' '}
                    {checkoutData.shipping.postalCode}
                  </p>
                  <p className="text-secondary-500">{checkoutData.shipping.email}</p>
                </div>
              </div>
            </div>

            {/* Payment method card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px w-6 bg-primary-500" />
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                    Payment Method
                  </span>
                </div>
                {devBypass && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-secondary-200 px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-secondary-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Test Mode
                    </span>
                    <span className="text-sm text-secondary-500">
                      No payment will be processed
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Place Order card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px w-6 bg-primary-500" />
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                    Place Order
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
                  shippingAddress={{
                    name: checkoutData.shipping.name,
                    line1: checkoutData.shipping.line1,
                    city: checkoutData.shipping.city,
                    state: checkoutData.shipping.state,
                    postalCode: checkoutData.shipping.postalCode,
                  }}
                  onSuccess={handlePlaceOrderSuccess}
                  onError={handlePlaceOrderError}
                />
              </div>
            </div>
          </div>

          {/* Right column — Order summary */}
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
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary-50 ring-1 ring-black/[0.04]">
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
