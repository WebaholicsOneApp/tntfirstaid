'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { ProductListItem } from '~/types';
import { formatCentsToDollars, cn } from '~/lib/utils';
import StockBadge from './StockBadge';

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
  theme?: 'light' | 'dark';
}

export default function ProductCard({ product, className, theme = 'light' }: ProductCardProps) {
  const isDark = theme === 'dark';
  const [imgError, setImgError] = useState(false);
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

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        'group block border transition-all duration-200',
        isDark
          ? 'bg-secondary-900 border-primary-500/10 hover:border-primary-500/30 hover:shadow-[0_0_20px_rgba(233,195,96,0.08)]'
          : 'rounded-lg bg-white border-secondary-100 hover:border-primary-300 hover:shadow-md',
        className
      )}
    >
      {/* Image */}
      <div className={cn(
        'relative aspect-[2/3] overflow-hidden',
        isDark ? 'bg-secondary-800' : 'rounded-t-lg bg-secondary-50'
      )}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-secondary-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="p-3 sm:p-4">
        {/* Product name */}
        <h3 className={cn(
          'text-sm font-medium line-clamp-2 leading-snug transition-colors',
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
                <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    fill="currentColor"
                    className={star <= Math.round(product.averageRating ?? 0) ? 'text-amber-400' : isDark ? 'text-secondary-600' : 'text-secondary-200'}
                  />
                </svg>
              ))}
            </div>
            <span className={cn('text-xs', isDark ? 'text-secondary-500' : 'text-secondary-400')}>({product.totalReviews})</span>
          </div>
        )}

        {/* Price */}
        <p className={cn('mt-2 text-base font-semibold', isDark ? 'text-primary-500' : 'text-secondary-900')}>
          {priceDisplay}
        </p>

        {/* MSRP strikethrough if on sale */}
        {product.msrp != null && product.price != null && product.msrp > product.price && (
          <p className="text-sm text-secondary-400 line-through">
            {formatCentsToDollars(product.msrp)}
          </p>
        )}

        {/* Stock badge */}
        <div className="mt-2">
          <StockBadge inStock={product.inStock} />
        </div>

        {/* Select options link */}
        {product.variationCount > 1 && (
          <p className={cn('mt-1.5 text-xs font-medium uppercase tracking-wider', isDark ? 'text-primary-500/60' : 'text-primary-600')}>
            Select options
          </p>
        )}
      </div>
    </Link>
  );
}
