'use client';

import { useState, Suspense } from 'react';
import type { ProductListItem, CategoryWithChildren } from '~/types';
import ProductGrid from './ProductGrid';
import SortSelect from './SortSelect';
import ProductFilters from './ProductFilters';
import MobileFilterDrawer from './MobileFilterDrawer';

interface ShopPageClientProps {
  products: ProductListItem[];
  totalCount: number;
  categories: CategoryWithChildren[];
  currentCategorySlug?: string;
}

function SortSelectWrapper() {
  return (
    <Suspense fallback={<div className="h-9 w-40 bg-secondary-100 rounded-md animate-pulse" />}>
      <SortSelect />
    </Suspense>
  );
}

function FiltersWrapper({ categories, currentCategorySlug }: { categories: CategoryWithChildren[]; currentCategorySlug?: string }) {
  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-40 bg-secondary-50 rounded animate-pulse" /></div>}>
      <ProductFilters
        categories={categories}
        currentCategorySlug={currentCategorySlug}
      />
    </Suspense>
  );
}

export default function ShopPageClient({
  products,
  totalCount,
  categories,
  currentCategorySlug,
}: ShopPageClientProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="flex gap-8">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <FiltersWrapper categories={categories} currentCategorySlug={currentCategorySlug} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-secondary-500">
            {totalCount} product{totalCount !== 1 ? 's' : ''}
          </p>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-sm border border-secondary-200 rounded-md text-secondary-600 hover:bg-secondary-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            <SortSelectWrapper />
          </div>
        </div>

        {/* Product grid */}
        <ProductGrid products={products} />
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        currentCategorySlug={currentCategorySlug}
        resultCount={totalCount}
      />
    </div>
  );
}
