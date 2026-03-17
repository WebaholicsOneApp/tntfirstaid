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
  const [filtersVisible, setFiltersVisible] = useState(true);

  const filterIcon = (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );

  return (
    <div>
      {/* Toolbar row — full width, button never moves */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Desktop filter toggle — stationary, only text changes */}
          <button
            onClick={() => setFiltersVisible(v => !v)}
            className="hidden lg:flex items-center gap-3 px-4 py-3 text-sm font-medium bg-secondary-50 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors duration-200 cursor-pointer"
          >
            {filterIcon}
            {filtersVisible ? 'Hide Filters' : 'Show Filters'}
          </button>

          <p className="text-sm text-secondary-500">
            {totalCount} product{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

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

      {/* Content row — sidebar + grid */}
      <div className="flex">
        {/* Desktop sidebar — width animates to 0 when collapsed */}
        <div
          className="hidden lg:block flex-shrink-0 overflow-hidden transition-[width,margin] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: filtersVisible ? '16rem' : '0px',
            marginRight: filtersVisible ? '2rem' : '0px',
          }}
        >
          <div
            className="w-64 transition-opacity duration-300"
            style={{ opacity: filtersVisible ? 1 : 0 }}
          >
            <FiltersWrapper categories={categories} currentCategorySlug={currentCategorySlug} />
          </div>
        </div>

        {/* Product grid — expands to fill when sidebar collapses */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} />
        </div>
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
