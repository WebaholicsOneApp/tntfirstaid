'use client';

import { ProductImage } from '~/components/ui/ProductImage';
import Link from 'next/link';
import { useState } from 'react';
import type { ProductListItem } from '~/types';
import { formatCentsToDollars, cn } from '~/lib/utils';
import StockBadge from './StockBadge';
import { useCart } from '~/lib/cart';
import { Spinner } from '~/components/ui/Spinner';
import { prefetchProduct } from '~/lib/product-prefetch';

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
  theme?: 'light' | 'dark';
  onQuickAdd?: () => void;
}

export default function ProductCard({ product, className, theme = 'light', onQuickAdd }: ProductCardProps) {
  const isDark = theme === 'dark';
  const [imgError, setImgError] = useState(false);
  const [addPhase, setAddPhase] = useState<'idle' | 'adding' | 'added'>('idle');
  const { addItem } = useCart();
  const imageSrc = imgError
    ? product.fallbackImage
    : product.primaryImage ?? product.fallbackImage;

  const hasRange =
    product.maxPrice != null &&
    product.price != null &&
    product.maxPrice > product.price;

  const priceDisplay = hasRange
    ? `${formatCentsToDollars(product.price)} – ${formatCentsToDollars(product.maxPrice)}`
    : formatCentsToDollars(product.price);

  const isVariable = product.variationCount > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock || addPhase !== 'idle') return;

    if (isVariable) {
      onQuickAdd?.();
      return;
    }

    // Simple product — add directly
    setAddPhase('adding');
    addItem({
      id: product.variationId ?? product.id,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: product.price ?? 0,
      image: product.primaryImage ?? product.fallbackImage,
    });
    setAddPhase('added');
    setTimeout(() => setAddPhase('idle'), 1200);
  };

  const handleSelectOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAdd?.();
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      onPointerEnter={() => prefetchProduct(product.slug)}
      className={cn(
        'group block border transition-all duration-300 ease-out',
        isDark
          ? 'bg-secondary-900 border-primary-500/10 hover:border-primary-500/30 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(233,195,96,0.12)] active:scale-[0.99] active:translate-y-0'
          : 'rounded-lg bg-white border-secondary-100 hover:border-primary-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(233,195,96,0.10)] active:scale-[0.99] active:translate-y-0',
        className
      )}
    >
      {/* Image */}
      <div className={cn(
        'relative aspect-[3/4] overflow-hidden',
        isDark ? 'bg-secondary-800' : 'rounded-t-lg bg-white'
      )}>
        {/* Sale badge */}
        {product.msrp != null && product.price != null && product.msrp > product.price && (
          <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-primary-500 text-secondary-900 text-[10px] font-mono font-semibold uppercase tracking-wider">
            Sale
          </div>
        )}
        {imageSrc ? (
          <ProductImage
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-secondary-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3.5">
        {/* Product name */}
        <h3 className={cn(
          'text-xs sm:text-sm font-medium line-clamp-2 leading-snug transition-colors',
          isDark
            ? 'text-secondary-100 group-hover:text-primary-400'
            : 'text-secondary-800 group-hover:text-primary-600'
        )}>
          {product.name}
        </h3>

        {/* Star rating */}
        {product.totalReviews != null && product.totalReviews > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} className="w-3 h-3" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    fill="currentColor"
                    className={star <= Math.round(product.averageRating ?? 0) ? 'text-amber-400' : isDark ? 'text-secondary-600' : 'text-secondary-200'}
                  />
                </svg>
              ))}
            </div>
            <span className={cn('text-[10px]', isDark ? 'text-secondary-500' : 'text-secondary-400')}>({product.totalReviews})</span>
          </div>
        )}

        {/* Price row */}
        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
          <p className={cn('text-sm sm:text-base font-bold', isDark ? 'text-primary-500' : 'text-secondary-900')}>
            {priceDisplay}
          </p>
          {product.msrp != null && product.price != null && product.msrp > product.price && (
            <p className="text-xs text-secondary-400 line-through">
              {formatCentsToDollars(product.msrp)}
            </p>
          )}
        </div>

        {/* Stock badge */}
        <div className="mt-1.5">
          <StockBadge inStock={product.inStock} />
        </div>

        {/* Desktop: full-width hover button */}
        <div className="mt-2.5 hidden md:block opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-200 ease-out">
          {isVariable ? (
            <button
              onClick={handleSelectOptions}
              className="w-full py-2 text-[11px] font-mono font-semibold uppercase tracking-wider bg-primary-500 text-secondary-950 hover:bg-primary-400 transition-colors rounded-full cursor-pointer active:scale-[0.97]"
            >
              Select Options
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || addPhase !== 'idle'}
              className={cn(
                'w-full py-2 text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors rounded-full flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97]',
                addPhase === 'added'
                  ? 'bg-green-600 text-white'
                  : product.inStock
                    ? 'bg-primary-500 text-secondary-950 hover:bg-primary-400'
                    : 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
              )}
            >
              {addPhase === 'adding' && <Spinner />}
              {addPhase === 'added' ? 'Added!' : addPhase === 'adding' ? 'Adding…' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
