'use client';

import Link from 'next/link';
import { ProductImage } from '~/components/ui/ProductImage';
import { useCart } from '~/lib/cart/CartContext';
import { formatCentsToDollars, getImageUrl } from '~/lib/utils';

export default function CartPageClient() {
  const { cart, removeItem, updateQuantity } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <div className="flex items-center gap-3 mb-2 justify-center">
            <div className="h-px w-6 bg-primary-500" />
            <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Empty</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-secondary-900 mb-2">Your Cart is Empty</h1>
          <p className="text-secondary-400 text-sm leading-relaxed mb-8">
            Browse our selection of precision ammunition and brass components.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-8 py-3 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase hover:bg-primary-400 active:scale-[0.98] transition-all duration-300"
          >
            Start Shopping
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Cart</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-secondary-900">Your Order</h1>
          </div>
          <Link
            href="/shop"
            className="text-primary-600 hover:text-primary-500 font-mono text-[0.7rem] tracking-[0.1em] uppercase flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-secondary-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-secondary-100">
                <div className="flex items-center gap-3">
                  <div className="h-px w-6 bg-primary-500" />
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Order Items ({cart.itemCount})</span>
                </div>
              </div>
              <ul className="divide-y divide-secondary-100">
                {cart.items.map((item) => (
                  <li key={item.id} className="px-6 py-4 flex gap-4">
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="relative w-24 h-24 bg-secondary-50 rounded-lg overflow-hidden flex-shrink-0"
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
                        <div className="w-full h-full flex items-center justify-center text-secondary-300">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="font-medium text-secondary-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm leading-snug"
                      >
                        {item.name}
                      </Link>
                      {item.variation && (
                        <p className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase mt-0.5">{item.variation}</p>
                      )}
                      {item.manufacturerNo && (
                        <p className="font-mono text-[0.6rem] tracking-[0.1em] text-secondary-400 mt-0.5">SKU: {item.manufacturerNo}</p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-secondary-200 rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 active:scale-95 transition-all duration-75"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-mono text-sm text-secondary-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 active:scale-95 transition-all duration-75"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            className="text-secondary-300 hover:text-red-400 transition-colors duration-200 p-1 active:scale-95"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-secondary-100 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-6 bg-primary-500" />
                <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Order Summary</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-500">Subtotal</span>
                  <span className="font-medium text-secondary-900">
                    {formatCentsToDollars(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-secondary-500">Shipping</span>
                    <p className="text-xs text-secondary-400">3-5 business days</p>
                  </div>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-500">Estimated Tax</span>
                  <span className="font-medium text-secondary-400 text-xs">At checkout</span>
                </div>
              </div>

              <div className="border-t border-secondary-100 mt-4 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400">Total</span>
                  <span className="font-display font-bold text-2xl text-secondary-900">{formatCentsToDollars(cart.subtotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full mt-6 py-3 px-6 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase text-center hover:bg-primary-400 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="w-full mt-3 py-3 px-6 rounded-full border border-primary-500/40 text-[0.7rem] font-mono tracking-[0.15em] text-primary-400/80 uppercase text-center hover:border-primary-500 transition-all duration-300 flex items-center justify-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
