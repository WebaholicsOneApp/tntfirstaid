'use client';

import type { ReactNode } from 'react';
import { ProductImage } from '~/components/ui/ProductImage';
import type { CartItem } from '~/types/cart';
import { formatCentsToDollars, getImageUrl } from '~/lib/utils';

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
        <div className="rounded-[calc(2rem-0.375rem)] border border-secondary-100/60 p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-primary-500" />
            <span className="font-mono text-[0.6rem] tracking-[0.3em] text-secondary-400 uppercase">
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
          )}

          <div className={showItemDetails ? 'border-t border-secondary-100 pt-4' : ''}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">Subtotal</span>
                <span className="tabular-nums text-secondary-900">
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
                  <span className="tabular-nums text-secondary-900">
                    {formatCentsToDollars(shippingCost)}
                  </span>
                )}
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

            {ctaButton && (
              <div className="mt-6">
                {ctaButton}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
