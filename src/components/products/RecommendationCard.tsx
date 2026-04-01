'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductImage } from '~/components/ui/ProductImage';
import { useCart } from '~/lib/cart/CartContext';
import { formatCentsToDollars, cn } from '~/lib/utils';
import QuickAddModal from '~/components/products/QuickAddModal';
import type { ProductListItem } from '~/types';

interface RecommendationCardProps {
  product: ProductListItem;
}

export default function RecommendationCard({ product }: RecommendationCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const canDirectAdd =
    product.inStock &&
    product.variationCount === 1 &&
    product.variationId != null &&
    product.price != null;

  const handleAdd = () => {
    if (!canDirectAdd || isPending) return;
    setIsPending(true);
    addItem(
      {
        id: product.variationId!,
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        price: product.price!,
        image: product.primaryImage ?? null,
      },
      1,
      { skipDrawer: true },
    );
    setAdded(true);
    setIsPending(false);
    setTimeout(() => setAdded(false), 2000);
  };

  const priceDisplay =
    product.maxPrice != null && product.maxPrice > (product.price ?? 0)
      ? `${formatCentsToDollars(product.price)} – ${formatCentsToDollars(product.maxPrice)}`
      : formatCentsToDollars(product.price);

  return (
    <div className="group flex flex-col border border-secondary-100 rounded-lg bg-white hover:border-primary-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(233,195,96,0.10)] transition-all duration-300 active:scale-[0.99] active:translate-y-0 overflow-hidden">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-white rounded-t-lg flex-shrink-0">
        {product.primaryImage ?? product.fallbackImage ? (
          <ProductImage
            src={(product.primaryImage ?? product.fallbackImage)!}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 44vw, 25vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-secondary-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        <Link href={`/product/${product.slug}`} className="flex-1">
          <h3 className="text-xs font-medium text-secondary-800 group-hover:text-primary-600 line-clamp-2 leading-snug transition-colors">
            {product.name}
          </h3>
          <p className="mt-1.5 text-sm font-semibold text-secondary-900">
            {priceDisplay}
          </p>
          {product.msrp != null && product.price != null && product.msrp > product.price && (
            <p className="text-xs text-secondary-400 line-through">{formatCentsToDollars(product.msrp)}</p>
          )}
        </Link>

        {/* CTA */}
        <div className="mt-2">
          {canDirectAdd ? (
            <button
              onClick={handleAdd}
              disabled={isPending}
              className={cn(
                'w-full py-1.5 rounded-full text-[0.6rem] font-mono tracking-[0.15em] uppercase transition-all duration-200 active:scale-[0.97]',
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-500 text-secondary-950 hover:bg-primary-400 disabled:opacity-60'
              )}
            >
              {added ? '✓ Added' : isPending ? '...' : 'Add to Cart'}
            </button>
          ) : (
            <button
              onClick={() => setShowQuickAdd(true)}
              className="block w-full py-1.5 rounded-full text-[0.6rem] font-mono tracking-[0.15em] text-secondary-950 uppercase text-center bg-primary-500 hover:bg-primary-400 transition-colors duration-200 active:scale-[0.97]"
            >
              Select Options
            </button>
          )}
        </div>
      </div>

      {showQuickAdd && (
        <QuickAddModal product={product} onClose={() => setShowQuickAdd(false)} />
      )}
    </div>
  );
}
