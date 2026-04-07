"use client";

import { useState, Suspense } from "react";
import type { ProductListItem, CategoryWithChildren } from "~/types";
import ProductGrid from "./ProductGrid";
import ProductGridLoadingWrapper from "./ProductGridLoadingWrapper";
import SortSelect from "./SortSelect";
import ProductFilters from "./ProductFilters";
import MobileFilterDrawer from "./MobileFilterDrawer";

interface ShopPageClientProps {
  products: ProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  categories: CategoryWithChildren[];
  currentCategorySlug?: string;
  priceRange: { min: number; max: number };
}

function SortSelectWrapper() {
  return (
    <Suspense
      fallback={
        <div className="bg-secondary-100 h-9 w-40 animate-pulse rounded-md" />
      }
    >
      <SortSelect />
    </Suspense>
  );
}

function FiltersWrapper({
  categories,
  currentCategorySlug,
  priceRange,
}: {
  categories: CategoryWithChildren[];
  currentCategorySlug?: string;
  priceRange: { min: number; max: number };
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="bg-secondary-50 h-40 animate-pulse rounded" />
        </div>
      }
    >
      <ProductFilters
        categories={categories}
        currentCategorySlug={currentCategorySlug}
        priceRange={priceRange}
      />
    </Suspense>
  );
}

export default function ShopPageClient({
  products,
  totalCount,
  page,
  pageSize,
  categories,
  currentCategorySlug,
  priceRange,
}: ShopPageClientProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(true);

  const filterIcon = (
    <svg
      className="h-5 w-5 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
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
      <div className="mb-6 flex items-center justify-between gap-3">
        {/* Desktop filter toggle */}
        <button
          onClick={() => setFiltersVisible((v) => !v)}
          className="bg-secondary-50 border-secondary-200 text-secondary-600 hover:bg-secondary-100 hidden cursor-pointer items-center gap-3 rounded-full border px-4 py-3 font-mono text-xs tracking-wider uppercase transition-colors duration-200 lg:flex"
        >
          {filterIcon}
          {filtersVisible ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Mobile: Filter + Sort on same row */}
        <div className="flex w-full items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="border-secondary-200 text-secondary-600 hover:bg-secondary-50 flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-2.5 text-sm transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </button>
          <div className="flex-1">
            <SortSelectWrapper />
          </div>
        </div>
      </div>

      {/* Content row — sidebar + grid */}
      <div className="flex">
        {/* Desktop sidebar — width animates to 0 when collapsed */}
        <div
          className="hidden flex-shrink-0 overflow-hidden transition-[width,margin] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] lg:block"
          style={{
            width: filtersVisible ? "16rem" : "0px",
            marginRight: filtersVisible ? "2rem" : "0px",
          }}
        >
          <div
            className="w-64 transition-opacity duration-300"
            style={{ opacity: filtersVisible ? 1 : 0 }}
          >
            <FiltersWrapper
              categories={categories}
              currentCategorySlug={currentCategorySlug}
              priceRange={priceRange}
            />
          </div>
        </div>

        {/* Product grid — expands to fill when sidebar collapses */}
        <div className="min-w-0 flex-1">
          {/* Count + sort — desktop only */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-secondary-500 text-sm">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of {totalCount} results
            </p>
            <div className="hidden lg:block">
              <SortSelectWrapper />
            </div>
          </div>

          <ProductGridLoadingWrapper>
            <ProductGrid products={products} />
          </ProductGridLoadingWrapper>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        currentCategorySlug={currentCategorySlug}
        resultCount={totalCount}
        priceRange={priceRange}
      />
    </div>
  );
}
