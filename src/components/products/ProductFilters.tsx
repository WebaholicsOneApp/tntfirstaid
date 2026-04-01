'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useNavigationLoading } from '~/lib/navigation-loading-context';
import type { CategoryWithChildren } from '~/types';
import { cn } from '~/lib/utils';
import { Spinner } from '~/components/ui/Spinner';

interface ProductFiltersProps {
  categories: CategoryWithChildren[];
  currentCategorySlug?: string;
  className?: string;
  priceRange?: { min: number; max: number };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function CategoryItem({
  category,
  currentCategorySlug,
  depth,
  onNavigate,
}: {
  category: CategoryWithChildren;
  currentCategorySlug?: string;
  depth: number;
  onNavigate: (href: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;
  const slug = slugify(category.categoryName);
  const isActive = currentCategorySlug === slug;

  return (
    <li>
      <div
        className={cn('flex items-center gap-1', depth > 0 && 'ml-4')}
      >
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 text-secondary-400 hover:text-secondary-600 transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-90')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <a
          href={`/shop/${slug}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(`/shop/${slug}`);
          }}
          className={cn(
            'flex-1 text-sm py-1 transition-colors',
            isActive
              ? 'text-primary-600 font-semibold'
              : 'text-secondary-600 hover:text-primary-600',
            !hasChildren && 'ml-5'
          )}
        >
          {category.categoryName}
          {category.productCount != null && (
            <span className="ml-1 text-xs text-secondary-300">
              ({category.productCount})
            </span>
          )}
        </a>
      </div>
      {hasChildren && expanded && (
        <ul className="mt-0.5">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              currentCategorySlug={currentCategorySlug}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ProductFilters({
  categories,
  currentCategorySlug,
  className,
  priceRange,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { setIsNavigating } = useNavigationLoading();

  useEffect(() => {
    setIsNavigating(isPending);
  }, [isPending, setIsNavigating]);

  const [minPrice, setMinPrice] = useState(
    searchParams.get('minPrice') ?? (priceRange && priceRange.min > 0 ? String(priceRange.min) : '')
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get('maxPrice') ?? (priceRange && priceRange.max > 0 ? String(priceRange.max) : '')
  );
  const inStock = searchParams.get('inStock') === 'true';

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }

    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }

    params.delete('page'); // Reset to page 1
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [minPrice, maxPrice, searchParams, pathname, router, startTransition]);

  const handleInStockToggle = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (inStock) {
      params.delete('inStock');
    } else {
      params.set('inStock', 'true');
    }
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [inStock, searchParams, pathname, router, startTransition]);

  const resetFilters = useCallback(() => {
    setMinPrice('');
    setMaxPrice('');
    // Keep only sort param
    const sort = searchParams.get('sort');
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);

    // If we're on a category page, stay there; otherwise go to /shop
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [searchParams, pathname, router, startTransition]);

  const handleCategoryNavigate = useCallback((href: string) => {
    startTransition(() => {
      router.push(href);
    });
  }, [router, startTransition]);

  const hasActiveFilters =
    searchParams.has('minPrice') ||
    searchParams.has('maxPrice') ||
    searchParams.has('inStock');

  return (
    <aside className={cn('space-y-7', className)}>
      {/* Categories */}
      <div>
        <h3 className="flex items-center gap-2 text-[10px] font-mono font-semibold text-secondary-400 uppercase tracking-widest pb-2 mb-3 border-b border-secondary-100">
          <span className="w-3 h-px bg-primary-500 inline-block" />
          Categories
        </h3>
        <ul className="space-y-0.5">
          <li>
            <a
              href="/shop"
              onClick={(e) => { e.preventDefault(); handleCategoryNavigate('/shop'); }}
              className={cn(
                'block text-sm py-1 ml-5 transition-colors',
                !currentCategorySlug ? 'text-primary-600 font-semibold' : 'text-secondary-500 hover:text-primary-600'
              )}
            >
              All Products
            </a>
          </li>
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              currentCategorySlug={currentCategorySlug}
              depth={0}
              onNavigate={handleCategoryNavigate}
            />
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="flex items-center gap-2 text-[10px] font-mono font-semibold text-secondary-400 uppercase tracking-widest pb-2 mb-3 border-b border-secondary-100">
          <span className="w-3 h-px bg-primary-500 inline-block" />
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm">$</span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full pl-7 pr-2 py-2 text-sm border border-secondary-200 rounded-full focus:outline-none focus:ring-1 focus:ring-primary-300 focus:border-primary-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <span className="text-secondary-300 text-sm">–</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm">$</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full pl-7 pr-2 py-2 text-sm border border-secondary-200 rounded-full focus:outline-none focus:ring-1 focus:ring-primary-300 focus:border-primary-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
        <button
          onClick={applyFilters}
          disabled={isPending}
          className="mt-2 w-full text-sm py-2 bg-primary-500 text-secondary-900 hover:bg-primary-400 transition-colors font-medium font-mono tracking-wide rounded-full disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isPending && <Spinner />}
          {isPending ? 'Applying…' : 'Apply Price'}
        </button>
      </div>

      {/* In Stock Toggle */}
      <div>
        <h3 className="flex items-center gap-2 text-[10px] font-mono font-semibold text-secondary-400 uppercase tracking-widest pb-2 mb-3 border-b border-secondary-100">
          <span className="w-3 h-px bg-primary-500 inline-block" />
          Availability
        </h3>
        <label className={cn('flex items-center gap-2.5 cursor-pointer', isPending && 'opacity-50 cursor-not-allowed')}>
          <input
            type="checkbox"
            checked={inStock}
            onChange={handleInStockToggle}
            disabled={isPending}
            className="w-4 h-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-300"
          />
          <span className="text-sm text-secondary-600">In Stock Only</span>
        </label>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          disabled={isPending}
          className="w-full text-sm py-2 border border-secondary-200 rounded-full text-secondary-600 hover:bg-secondary-50 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isPending && <Spinner />}
          Reset Filters
        </button>
      )}
    </aside>
  );
}
