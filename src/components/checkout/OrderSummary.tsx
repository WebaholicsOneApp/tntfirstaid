"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ProductImage } from "~/components/ui/ProductImage";
import type { CartItem } from "~/types/cart";
import { formatCentsToDollars, getImageUrl } from "~/lib/utils";
import PromoCodeInput, {
  type AppliedDiscount,
} from "~/components/checkout/PromoCodeInput";
import { DISCOUNT_SESSION_KEY } from "~/components/checkout/CheckoutTypes";

interface OrderSummaryProps {
  cart: { items: CartItem[]; subtotal: number; itemCount: number };
  showItemDetails?: boolean;
  shippingCost?: number | undefined;
  isDigitalOnly?: boolean;
  ctaButton?: ReactNode;
  /** Hide the promo code input — used on the success page where editing is inappropriate. */
  hidePromoCode?: boolean;
}

/** Load the persisted applied discount from sessionStorage, if any. */
function loadDiscount(): AppliedDiscount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DISCOUNT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.code === "string" &&
      typeof parsed.discountCents === "number" &&
      (parsed.discountType === "p" || parsed.discountType === "f")
    ) {
      return parsed as AppliedDiscount;
    }
  } catch {
    // Ignore malformed payloads.
  }
  return null;
}

const DISCOUNT_EVENT = "alpha:discount-changed";

export default function OrderSummary({
  cart,
  showItemDetails = true,
  shippingCost,
  isDigitalOnly,
  ctaButton,
  hidePromoCode,
}: OrderSummaryProps) {
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);

  const handleDiscountChange = useCallback((next: AppliedDiscount | null) => {
    try {
      if (next) {
        sessionStorage.setItem(DISCOUNT_SESSION_KEY, JSON.stringify(next));
      } else {
        sessionStorage.removeItem(DISCOUNT_SESSION_KEY);
      }
    } catch {
      // Storage unavailable — fall through, the in-memory state is still updated.
    }
    setDiscount(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(DISCOUNT_EVENT));
    }
  }, []);

  // Hydrate from sessionStorage on mount so the discount line persists when
  // a shopper moves between checkout pages in a single session. Also listen
  // for updates dispatched by sibling instances of this component on other
  // checkout pages. Cross-order carry-over is prevented by clearing
  // DISCOUNT_SESSION_KEY on every order success path and on success-page
  // mount — NOT by re-validating the stale amount here.
  useEffect(() => {
    setDiscount(loadDiscount());
    const handler = () => setDiscount(loadDiscount());
    window.addEventListener(DISCOUNT_EVENT, handler);
    return () => window.removeEventListener(DISCOUNT_EVENT, handler);
  }, []);

  // Auto-invalidate a persisted discount if the cart is emptied out entirely.
  useEffect(() => {
    if (cart.items.length === 0 && discount != null) {
      try {
        sessionStorage.removeItem(DISCOUNT_SESSION_KEY);
      } catch {}
      setDiscount(null);
    }
  }, [cart.items.length, discount]);

  const discountCents = discount
    ? Math.min(discount.discountCents, cart.subtotal)
    : 0;
  const discountedSubtotal = Math.max(0, cart.subtotal - discountCents);
  const estimatedTax = Math.round(discountedSubtotal * 0.08);
  const resolvedShipping = shippingCost ?? 0;
  const total = discountedSubtotal + resolvedShipping + estimatedTax;

  return (
    <div className="sticky top-8">
      <div className="rounded-[2rem] bg-white p-1.5 ring-1 ring-black/[0.04]">
        <div className="border-secondary-100/60 rounded-[calc(2rem-0.375rem)] border p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Order Summary
            </span>
          </div>

          {showItemDetails && (
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
                      <div className="text-secondary-200 flex h-full w-full items-center justify-center">
                        <svg
                          className="h-5 w-5"
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
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-secondary-900 truncate text-[0.8rem] leading-tight font-medium">
                      {item.name}
                    </p>
                    <p className="text-secondary-400 font-mono text-[0.6rem]">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-secondary-700 flex-shrink-0 text-[0.8rem] font-medium tabular-nums">
                    {formatCentsToDollars(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div
            className={
              showItemDetails ? "border-secondary-100 border-t pt-4" : ""
            }
          >
            {!hidePromoCode && cart.items.length > 0 && (
              <div className="mb-4">
                <PromoCodeInput
                  cartItems={cart.items}
                  applied={discount}
                  onChange={handleDiscountChange}
                />
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">Subtotal</span>
                <span className="text-secondary-900 tabular-nums">
                  {formatCentsToDollars(cart.subtotal)}
                </span>
              </div>
              {discountCents > 0 && discount && (
                <div className="flex justify-between">
                  <span className="text-secondary-500">
                    Discount{" "}
                    <span className="text-secondary-400 font-mono text-[0.65rem]">
                      ({discount.code})
                    </span>
                  </span>
                  <span className="text-green-600 tabular-nums">
                    −{formatCentsToDollars(discountCents)}
                  </span>
                </div>
              )}
              {!isDigitalOnly && (
                <div className="flex justify-between">
                  <span className="text-secondary-500">Shipping</span>
                  {shippingCost === undefined ? (
                    <span className="text-secondary-400">&mdash;</span>
                  ) : shippingCost === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <span className="text-secondary-900 tabular-nums">
                      {formatCentsToDollars(shippingCost)}
                    </span>
                  )}
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-secondary-500">Est. Tax</span>
                <span className="text-secondary-900 font-mono tabular-nums">
                  {formatCentsToDollars(estimatedTax)}
                </span>
              </div>
            </div>

            <div className="border-secondary-100 mt-4 border-t pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                  Total
                </span>
                <span className="font-display text-secondary-900 text-2xl font-bold tracking-tight">
                  {formatCentsToDollars(total)}
                </span>
              </div>
            </div>

            {ctaButton && <div className="mt-6">{ctaButton}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
