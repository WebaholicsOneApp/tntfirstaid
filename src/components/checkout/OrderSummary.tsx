"use client";

import type { ReactNode } from "react";
import { ProductImage } from "~/components/ui/ProductImage";
import type { CartItem } from "~/types/cart";
import { formatCentsToDollars, getImageUrl } from "~/lib/utils";

interface OrderSummaryProps {
  cart: { items: CartItem[]; subtotal: number; itemCount: number };
  showItemDetails?: boolean;
  shippingCost?: number | undefined;
  ctaButton?: ReactNode;
}

export default function OrderSummary({
  cart,
  showItemDetails = true,
  shippingCost,
  ctaButton,
}: OrderSummaryProps) {
  const estimatedTax = Math.round(cart.subtotal * 0.08);
  const resolvedShipping = shippingCost ?? 0;
  const total = cart.subtotal + resolvedShipping + estimatedTax;

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
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">Subtotal</span>
                <span className="text-secondary-900 tabular-nums">
                  {formatCentsToDollars(cart.subtotal)}
                </span>
              </div>
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
