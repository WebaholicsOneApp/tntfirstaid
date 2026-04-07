"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ProductImage } from "~/components/ui/ProductImage";
import { useCart } from "~/lib/cart";
import { formatCentsToDollars, getImageUrl } from "~/lib/utils";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeCart]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
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
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={handleBackdropClick}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-secondary-100 flex items-center justify-between border-b px-6 py-4">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <div className="bg-primary-500 h-px w-6" />
                <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                  Your Cart
                </span>
              </div>
              <h2
                className="font-display text-secondary-900 text-xl font-bold"
                suppressHydrationWarning
              >
                {cart.itemCount} {cart.itemCount === 1 ? "Item" : "Items"}
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg p-2 transition-colors"
              aria-label="Close cart"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <svg
                  className="text-secondary-200 mb-6 h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <div className="mb-2 flex items-center justify-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Empty
                  </span>
                </div>
                <h3 className="font-display text-secondary-900 mb-2 text-xl font-bold">
                  Your cart is empty
                </h3>
                <p className="text-secondary-400 mb-6 text-sm leading-relaxed">
                  Looks like you haven&apos;t added anything yet.
                </p>
                <button
                  onClick={closeCart}
                  className="border-primary-500/40 text-primary-400/80 hover:border-primary-500 rounded-full border px-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.items.map((item) => (
                  <li
                    key={item.id}
                    className="border-secondary-100 flex gap-4 border-b py-4 last:border-0"
                  >
                    {/* Image */}
                    <Link
                      href={`/product/${item.productSlug}`}
                      onClick={closeCart}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white"
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
                        <div className="text-secondary-300 flex h-full w-full items-center justify-center">
                          <svg
                            className="h-8 w-8"
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

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={closeCart}
                        className="text-secondary-900 hover:text-primary-600 line-clamp-2 text-sm leading-snug font-medium transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.variation && (
                        <p className="text-secondary-400 mt-0.5 font-mono text-[0.6rem] tracking-[0.1em] uppercase">
                          {item.variation}
                        </p>
                      )}
                      <p className="text-secondary-900 mt-1 font-mono text-sm font-semibold">
                        {formatCentsToDollars(item.price)}
                      </p>

                      {/* Quantity & Remove */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="border-secondary-200 flex items-center overflow-hidden rounded-full border">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="hover:bg-secondary-50 text-secondary-600 flex h-8 w-8 items-center justify-center transition-all duration-75 active:scale-95"
                            aria-label="Decrease quantity"
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
                            className="hover:bg-secondary-50 text-secondary-600 flex h-8 w-8 items-center justify-center transition-all duration-75 active:scale-95"
                            aria-label="Increase quantity"
                            disabled={
                              item.maxQuantity
                                ? item.quantity >= item.maxQuantity
                                : false
                            }
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
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-secondary-300 p-1 transition-colors duration-200 hover:text-red-400 active:scale-95"
                          aria-label={`Remove ${item.name} from cart`}
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
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-secondary-100 space-y-4 border-t bg-white px-6 py-5">
              {/* Subtotal */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Subtotal
                  </span>
                  <p className="text-secondary-400 mt-0.5 text-[0.65rem]">
                    Shipping &amp; taxes at checkout
                  </p>
                </div>
                <span className="font-display text-secondary-900 text-2xl font-bold">
                  {formatCentsToDollars(cart.subtotal)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="bg-primary-500 text-secondary-950 hover:bg-primary-400 block w-full rounded-full px-6 py-3 text-center font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]"
              >
                Proceed to Checkout
              </Link>

              {/* Continue Shopping */}
              <button
                onClick={closeCart}
                className="border-primary-500/40 text-primary-400/80 hover:border-primary-500 block w-full rounded-full border px-6 py-3 text-center font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300"
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
