'use client';

import { useState } from 'react';
import type { ProductListItem } from '~/types';
import { cn } from '~/lib/utils';
import ProductCard from './ProductCard';
import Link from 'next/link';
import QuickAddModal from './QuickAddModal';

interface ProductGridProps {
  products: ProductListItem[];
  className?: string;
}

export default function ProductGrid({ products, className }: ProductGridProps) {
  const [quickAddProduct, setQuickAddProduct] = useState<ProductListItem | null>(null);

  if (products.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center text-center">
        <div className="w-16 h-16 mb-5 flex items-center justify-center border border-secondary-200 text-secondary-300">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-secondary-700 mb-1">No products found</h3>
        <p className="text-sm text-secondary-400 mb-5 max-w-xs">
          Try adjusting your filters or browse all products.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-4 py-2 border border-primary-500 text-primary-600 text-sm font-medium hover:bg-primary-50 transition-colors"
        >
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 py-1 -my-1',
          className
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickAdd={() => setQuickAddProduct(product)}
          />
        ))}
      </div>

      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
        />
      )}
    </>
  );
}
