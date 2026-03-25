'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ProductImage } from '~/components/ui/ProductImage';
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
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-px w-6 bg-primary-500" />
                <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Your Cart</span>
              </div>
              <h2 className="font-display text-xl font-bold text-secondary-900" suppressHydrationWarning>
                {cart.itemCount} {cart.itemCount === 1 ? 'Item' : 'Items'}
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
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <svg className="w-16 h-16 text-secondary-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="flex items-center gap-3 mb-2 justify-center">
                  <div className="h-px w-6 bg-primary-500" />
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">Empty</span>
                </div>
                <h3 className="font-display text-xl font-bold text-secondary-900 mb-2">Your cart is empty</h3>
                <p className="text-secondary-400 text-sm leading-relaxed mb-6">Looks like you haven&apos;t added anything yet.</p>
                <button
                  onClick={closeCart}
                  className="rounded-full border border-primary-500/40 px-6 py-3 text-[0.7rem] font-mono tracking-[0.15em] text-primary-400/80 uppercase hover:border-primary-500 transition-all duration-300"
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
                        <ProductImage
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
                        className="font-medium text-secondary-900 text-sm leading-snug hover:text-primary-600 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.variation && (
                        <p className="font-mono text-[0.6rem] tracking-[0.1em] text-secondary-400 uppercase mt-0.5">{item.variation}</p>
                      )}
                      <p className="font-mono text-sm text-secondary-900 font-semibold mt-1">
                        {formatCentsToDollars(item.price)}
                      </p>

                      {/* Quantity & Remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-secondary-200 rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-secondary-50 active:scale-95 transition-all duration-75 text-secondary-600"
                            aria-label="Decrease quantity"
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
                            className="w-8 h-8 flex items-center justify-center hover:bg-secondary-50 active:scale-95 transition-all duration-75 text-secondary-600"
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
                          className="text-secondary-300 hover:text-red-400 transition-colors duration-200 p-1 active:scale-95"
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
            <div className="border-t border-secondary-100 px-6 py-5 space-y-4 bg-white">
              {/* Subtotal */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-secondary-400">Subtotal</span>
                  <p className="text-[0.65rem] text-secondary-400 mt-0.5">Shipping &amp; taxes at checkout</p>
                </div>
                <span className="font-display text-2xl font-bold text-secondary-900">{formatCentsToDollars(cart.subtotal)}</span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full py-3 px-6 rounded-full bg-primary-500 text-[0.7rem] font-mono tracking-[0.15em] text-secondary-950 uppercase text-center hover:bg-primary-400 active:scale-[0.98] transition-all duration-300"
              >
                Proceed to Checkout
              </Link>

              {/* Continue Shopping */}
              <button
                onClick={closeCart}
                className="block w-full py-3 px-6 rounded-full border border-primary-500/40 text-[0.7rem] font-mono tracking-[0.15em] text-primary-400/80 uppercase text-center hover:border-primary-500 transition-all duration-300"
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
