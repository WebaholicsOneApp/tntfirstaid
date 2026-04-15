"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RecommendationGrid from "~/components/products/RecommendationGrid";
import { ProductImage } from "~/components/ui/ProductImage";
import { useCart } from "~/lib/cart/CartContext";
import { formatCentsToDollars, getImageUrl } from "~/lib/utils";
import type { ProductListItem } from "~/types";

export default function CartPageClient() {
  const { cart, removeItem, updateQuantity } = useCart();
  const [recommendations, setRecommendations] = useState<ProductListItem[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    if (cart.items.length === 0) return;
    const productIds = cart.items.map((item) => item.productId).filter(Boolean);
    if (productIds.length === 0) return;

    setRecsLoading(true);
    fetch(`/api/recommendations?productIds=${productIds.join(",")}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recommendations) setRecommendations(data.recommendations);
      })
      .catch(() => {})
      .finally(() => setRecsLoading(false));
  }, [cart.items]);

  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="bg-secondary-100 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <svg
              className="text-secondary-400 h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
          </div>
          <div className="mb-2 flex items-center justify-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Empty
            </span>
          </div>
          <h1 className="font-display text-secondary-900 mb-2 text-2xl font-bold">
            Your Cart is Empty
          </h1>
          <p className="text-secondary-400 mb-8 text-sm leading-relaxed">
            Browse our first aid kits, medical supplies, and training gear.
          </p>
          <Link
            href="/shop"
            className="bg-primary-500 text-secondary-950 hover:bg-primary-400 inline-flex items-center gap-2 rounded-full px-8 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]"
          >
            Start Shopping
            <svg
              className="h-5 w-5"
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
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Cart
              </span>
            </div>
            <h1 className="font-display text-secondary-900 text-4xl font-bold">
              Your Order
            </h1>
          </div>
          <Link
            href="/shop"
            className="text-primary-600 hover:text-primary-500 flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.1em] uppercase transition-colors"
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
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            <div className="border-secondary-100 overflow-hidden rounded-2xl border bg-white">
              <div className="border-secondary-100 border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Order Items ({cart.itemCount})
                  </span>
                </div>
              </div>
              <ul className="divide-secondary-100 divide-y">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-4 px-6 py-4">
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-white"
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
                        <div className="text-secondary-300 flex h-full w-full items-center justify-center">
                          <svg
                            className="h-10 w-10"
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
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="text-secondary-900 hover:text-primary-600 line-clamp-2 text-sm leading-snug font-medium transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.variation && (
                        <p className="text-secondary-400 mt-0.5 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                          {item.variation}
                        </p>
                      )}
                      {item.manufacturerNo && (
                        <p className="text-secondary-400 mt-0.5 font-mono text-[0.6rem] tracking-[0.1em]">
                          SKU: {item.manufacturerNo}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="border-secondary-200 flex items-center overflow-hidden rounded-full border">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="text-secondary-600 hover:bg-secondary-50 flex h-8 w-8 items-center justify-center transition-all duration-75 active:scale-95"
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
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="text-secondary-900 w-8 text-center font-mono text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="text-secondary-600 hover:bg-secondary-50 flex h-8 w-8 items-center justify-center transition-all duration-75 active:scale-95"
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
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-secondary-900 text-sm font-semibold">
                            {formatCentsToDollars(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-secondary-300 p-1 transition-colors duration-200 hover:text-red-400 active:scale-95"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
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

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border-secondary-100 sticky top-24 rounded-2xl border bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary-500 h-px w-6" />
                <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                  Order Summary
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-500">Subtotal</span>
                  <span className="text-secondary-900 font-medium">
                    {formatCentsToDollars(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-secondary-500">Shipping</span>
                    <p className="text-secondary-400 text-xs">
                      3-5 business days
                    </p>
                  </div>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-500">Estimated Tax</span>
                  <span className="text-secondary-400 text-xs font-medium">
                    At checkout
                  </span>
                </div>
              </div>

              <div className="border-secondary-100 mt-4 border-t pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Total
                  </span>
                  <span className="font-display text-secondary-900 text-2xl font-bold">
                    {formatCentsToDollars(cart.subtotal)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="bg-primary-500 text-secondary-950 hover:bg-primary-400 mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-center font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="border-primary-500/40 text-primary-400/80 hover:border-primary-500 mt-3 flex w-full items-center justify-center rounded-full border px-6 py-3 text-center font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {(recommendations.filter((r) => r.inStock).length > 0 ||
          recsLoading) && (
          <section className="mt-16">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Recommended
              </span>
            </div>
            <h2 className="font-display text-secondary-900 mb-6 text-2xl font-bold">
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
