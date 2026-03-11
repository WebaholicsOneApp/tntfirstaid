'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '~/lib/cart';
import { formatCentsToDollars, getImageUrl } from '~/lib/utils';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeCart]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeCart();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleBackdropClick}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-secondary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-secondary-800" suppressHydrationWarning>
                Your Cart ({cart.itemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors rounded-lg hover:bg-secondary-50"
              aria-label="Close cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-24 h-24 text-secondary-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-secondary-700 mb-2">Your cart is empty</h3>
                <p className="text-secondary-400 mb-6">Looks like you haven&apos;t added anything yet.</p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4 border-b border-secondary-100 last:border-0">
                    {/* Image */}
                    <Link
                      href={`/product/${item.productSlug}`}
                      onClick={closeCart}
                      className="relative w-20 h-20 bg-secondary-50 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      {item.image ? (
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary-300">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={closeCart}
                        className="font-medium text-secondary-800 hover:text-primary-600 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.variation && (
                        <p className="text-sm text-secondary-400 mt-0.5">{item.variation}</p>
                      )}
                      <p className="text-primary-600 font-semibold mt-1">
                        {formatCentsToDollars(item.price)}
                      </p>

                      {/* Quantity & Remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-secondary-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-secondary-600 hover:bg-secondary-50 transition-colors rounded-l-lg"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-3 py-1 text-sm font-medium text-secondary-700 min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-secondary-600 hover:bg-secondary-50 transition-colors rounded-r-lg"
                            aria-label="Increase quantity"
                            disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-secondary-400 hover:text-red-500 transition-colors p-1"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-secondary-200 px-6 py-4 space-y-4 bg-white">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-lg">
                <span className="text-secondary-600">Subtotal</span>
                <span className="font-bold text-secondary-800">{formatCentsToDollars(cart.subtotal)}</span>
              </div>
              <p className="text-sm text-secondary-400">
                Shipping and taxes calculated at checkout
              </p>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full py-3 px-6 bg-primary-500 text-white font-semibold rounded-xl text-center hover:bg-primary-600 transition-colors"
              >
                Proceed to Checkout
              </Link>

              {/* Continue Shopping */}
              <button
                onClick={closeCart}
                className="block w-full py-3 px-6 bg-secondary-100 text-secondary-700 font-medium rounded-xl text-center hover:bg-secondary-200 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
