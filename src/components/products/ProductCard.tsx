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
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageSrc = imgError
    ? product.fallbackImage
    : product.primaryImage ?? product.fallbackImage;

  const hasRange =
    product.maxPrice != null &&
    product.price != null &&
    product.maxPrice > product.price;

  const priceDisplay = hasRange
    ? `${formatCentsToDollars(product.price)} - ${formatCentsToDollars(product.maxPrice)}`
    : formatCentsToDollars(product.price);

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        'group block rounded-lg border border-secondary-100 bg-white transition-all duration-200',
        'hover:border-primary-300 hover:shadow-md',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-secondary-50">
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
        <h3 className="text-sm font-medium text-secondary-800 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <p className="mt-2 text-base font-semibold text-secondary-900">
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
      </div>
    </Link>
  );
}
