'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RecommendationGrid from '~/components/products/RecommendationGrid';
import { ProductImage } from '~/components/ui/ProductImage';
import { useCart } from '~/lib/cart/CartContext';
import { formatCentsToDollars, getImageUrl } from '~/lib/utils';
import type { ProductListItem } from '~/types';

export default function CheckoutProductReviewPage() {
  const router = useRouter();
  const { cart, removeItem, updateQuantity } = useCart();
  const recsFetched = useRef(false);
  const [recommendations, setRecommendations] = useState<ProductListItem[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // Redirect to shop if cart is empty
  useEffect(() => {
    if (cart.items.length !== 0) return undefined;
    const timer = setTimeout(() => {
      if (cart.items.length === 0) router.push('/shop');
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart.items.length, router]);

  // Fetch recommendations once based on initial cart — stable across cart changes
  useEffect(() => {
    if (recsFetched.current) return;
    if (cart.items.length === 0) return;
    const productIds = cart.items.map((item) => item.productId).filter(Boolean);
    if (productIds.length === 0) return;

    recsFetched.current = true;
    setRecsLoading(true);
    fetch(`/api/recommendations?productIds=${productIds.join(',')}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recommendations) setRecommendations(data.recommendations);
      })
      .catch(() => {})
      .finally(() => setRecsLoading(false));
  }, [cart.items]);

  // Empty cart loading state
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
              Review Your Order
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
          {/* Left column — Product list */}
          <div className="space-y-6 lg:col-span-2">
            {/* Back link mobile */}
            <Link
              href="/shop"
              className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase text-secondary-400 transition-colors hover:text-primary-600 sm:hidden"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Shopping
            </Link>

            {/* Product Items Card */}
            <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
              <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] border border-secondary-100/60">
                <div className="border-b border-secondary-100/60 px-6 py-4 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-6 bg-primary-500" />
                    <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                      Order Items ({cart.itemCount})
                    </span>
                  </div>
                </div>
                <ul className="divide-y divide-secondary-100/60">
                  {cart.items.map((item) => (
                    <li key={item.id} className="flex gap-4 px-6 py-5 sm:gap-6 sm:px-8">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white sm:h-24 sm:w-24"
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
                          <div className="flex h-full w-full items-center justify-center text-secondary-300">
                            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${item.productSlug}`}
                          className="line-clamp-2 text-sm font-medium leading-snug text-secondary-900 transition-colors hover:text-primary-600"
                        >
                          {item.name}
                        </Link>
                        {item.packCount && (
                          <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-secondary-400">
                            Quantity: {item.packCount}
                          </p>
                        )}
                        {item.variation && !item.packCount && (
                          <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-secondary-400">
                            {item.variantType ? `${item.variantType}: ` : ''}{item.variation}
                          </p>
                        )}
                        {item.variationTwo && (
                          <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-secondary-400">
                            {item.variantTypeTwo ? `${item.variantTypeTwo}: ` : ''}{item.variationTwo}
                          </p>
                        )}
                        {item.manufacturerNo && (
                          <p className="mt-0.5 font-mono text-[0.6rem] tracking-[0.1em] text-secondary-400">
                            SKU: {item.manufacturerNo}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-full border border-secondary-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center text-secondary-600 transition-all duration-75 hover:bg-secondary-50 active:scale-95"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center font-mono text-sm text-secondary-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center text-secondary-600 transition-all duration-75 hover:bg-secondary-50 active:scale-95"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-secondary-900">
                              {formatCentsToDollars(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-secondary-300 transition-colors duration-200 hover:text-red-400 active:scale-95"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right column — Subtotal sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
                <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="h-px w-6 bg-primary-500" />
                    <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
                      Order Summary
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Subtotal</span>
                      <span className="tabular-nums text-secondary-900">
                        {formatCentsToDollars(cart.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Shipping</span>
                      <span className="text-secondary-400">&mdash;</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Est. Tax</span>
                      <span className="text-secondary-400">&mdash;</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-secondary-100 pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-secondary-400">
                        Subtotal
                      </span>
                      <span className="font-display text-2xl font-bold tracking-tight text-secondary-900">
                        {formatCentsToDollars(cart.subtotal)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/checkout/shipping"
                      className="group flex w-full items-center justify-center gap-3 rounded-full bg-secondary-900 py-4 pl-8 pr-5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-secondary-800 active:scale-[0.98]"
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <span>Proceed to Checkout</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-white/20">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {(recommendations.filter((r) => r.inStock).length > 0 || recsLoading) && (
          <section className="mt-16">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-secondary-400">
                Recommended
              </span>
            </div>
            <h2 className="mb-6 font-display text-2xl font-bold text-secondary-900">
              Frequently Bought Together
            </h2>
            <RecommendationGrid
              products={recommendations.filter((r) => r.inStock).slice(0, 5)}
              loading={recsLoading}
            />
          </section>
        )}
      </div>
    </div>
  );
}
