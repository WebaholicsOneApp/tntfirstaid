'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RecommendationGrid from '~/components/products/RecommendationGrid';
import { ProductImage } from '~/components/ui/ProductImage';
import { useCart } from '~/lib/cart/CartContext';
import { formatCentsToDollars, getImageUrl } from '~/lib/utils';
import type { ProductListItem } from '~/types';

export default function CheckoutReviewPage() {
  const router = useRouter();
  const { cart, removeItem, updateQuantity } = useCart();
  const hasAnimated = useRef(false);
  const recsFetched = useRef(false);
  const [recommendations, setRecommendations] = useState<ProductListItem[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // Fetch recommendations once based on initial cart — stable across cart changes
  useEffect(() => {
    if (recsFetched.current) return;
    if (cart.items.length === 0) return;
    const productIds = cart.items.map(item => item.productId).filter(Boolean);
    if (productIds.length === 0) return;

    recsFetched.current = true;
    setRecsLoading(true);
    fetch(`/api/recommendations?productIds=${productIds.join(',')}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.recommendations) setRecommendations(data.recommendations);
      })
      .catch(() => {})
      .finally(() => setRecsLoading(false));
  }, [cart.items]);

  useEffect(() => {
    if (cart.items.length !== 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (cart.items.length === 0) {
        router.push('/shop');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  useEffect(() => {
    hasAnimated.current = true;
  }, []);

  const shippingCost = 0;
  const estimatedTax = Math.round(cart.subtotal * 0.08);
  const total = cart.subtotal + shippingCost + estimatedTax;

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
        <div
          className="mb-12 flex items-center justify-center gap-3 transition-all duration-[800ms]"
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-900 font-mono text-[0.6rem] text-white">
              1
            </span>
            <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-secondary-900">
              Review
            </span>
          </div>
          <div className="h-px w-12 bg-secondary-200" />
          <div className="flex items-center gap-2 opacity-40">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-200 font-mono text-[0.6rem] text-secondary-500">
              2
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-secondary-400">
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
              Review Order
            </h1>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase text-secondary-400 transition-colors hover:text-primary-600 sm:flex"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Order items — double-bezel card */}
          <div className="lg:col-span-2">
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] border border-secondary-100/60">
                <div className="border-b border-secondary-100/60 px-6 py-4 sm:px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-secondary-900 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-white">
                        {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <Link
                      href="/shop"
                      className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-secondary-400 transition-colors hover:text-primary-600 sm:hidden"
                    >
                      + Add more
                    </Link>
                  </div>
                </div>

                <ul className="divide-y divide-secondary-100/60">
                  {cart.items.map((item, index) => (
                    <li
                      key={item.id}
                      className="flex gap-4 px-6 py-5 transition-colors hover:bg-secondary-50/30 sm:gap-6 sm:px-8"
                      style={{
                        animationDelay: `${index * 80}ms`,
                      }}
                    >
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.04] transition-transform duration-300 hover:scale-[1.02] sm:h-24 sm:w-24"
                      >
                        {item.image ? (
                          <ProductImage
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-secondary-200">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.productSlug}`}
                              className="line-clamp-2 text-sm font-medium leading-snug text-secondary-900 transition-colors hover:text-primary-600"
                            >
                              {item.name}
                            </Link>
                            {item.variation && (
                              <p className="mt-0.5 text-[0.8rem] text-secondary-500">{item.variation}</p>
                            )}
                            {item.manufacturerNo && (
                              <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-secondary-300">
                                {item.manufacturerNo}
                              </p>
                            )}
                          </div>
                          <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-secondary-900">
                            {formatCentsToDollars(item.price * item.quantity)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-full border border-secondary-200/80 bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center text-secondary-500 transition-all duration-75 hover:bg-secondary-50 active:scale-95"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center font-mono text-sm tabular-nums text-secondary-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center text-secondary-500 transition-all duration-75 hover:bg-secondary-50 active:scale-95"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="rounded-full p-2 text-secondary-300 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Order summary sidebar — double-bezel card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-px w-6 bg-primary-500" />
                    <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                      Summary
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Subtotal</span>
                      <span className="font-medium tabular-nums text-secondary-900">
                        {formatCentsToDollars(cart.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <span className="text-secondary-500">Shipping</span>
                        <p className="text-[0.7rem] text-secondary-300">Calculated at next step</p>
                      </div>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Est. Tax</span>
                      <span className="font-mono text-sm tabular-nums text-secondary-900">
                        {formatCentsToDollars(estimatedTax)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-secondary-100 pt-5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-secondary-400">
                        Total
                      </span>
                      <span className="font-display text-2xl font-bold tracking-tight text-secondary-900">
                        {formatCentsToDollars(total)}
                      </span>
                    </div>
                  </div>

                  {/* Continue to Payment CTA */}
                  <Link
                    href="/checkout/payment"
                    className="group mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-secondary-900 py-4 pl-8 pr-5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-secondary-800 active:scale-[0.98]"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <span>Continue to Payment</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:bg-white/20 group-hover:translate-x-0.5">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-6 px-4">
                <div className="flex items-center gap-1.5 text-secondary-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em]">Secure</span>
                </div>
                <div className="flex items-center gap-1.5 text-secondary-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em]">Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 text-secondary-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em]">Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {(recommendations.filter(r => r.inStock).length > 0 || recsLoading) && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Recommended</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-secondary-900 mb-6">Add to Your Order</h2>
            <RecommendationGrid products={recommendations.filter(r => r.inStock).slice(0, 5)} loading={recsLoading} />
          </section>
        )}
      </div>
    </div>
  );
}
