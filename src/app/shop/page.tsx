import type { Metadata } from 'next';
import { getProducts, getCategoryTreeForStorefront, getCategoryBySlug, getAllRelatedCategoryIds, getPriceRange } from '~/lib/data';
import { convertDollarsToCents, getPaginationRange } from '~/lib/utils';
import ShopPageClient from '~/components/products/ShopPageClient';
import Breadcrumbs from '~/components/common/Breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our selection of premium ammunition and reloading supplies.',
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  // Build filters from search params
  const filters: {
    categoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  } = {};

  // Category filter from query param
  if (params.category) {
    const category = await getCategoryBySlug(params.category);
    if (category) {
      const categoryIds = await getAllRelatedCategoryIds(category.id, category.categoryName);
      filters.categoryIds = categoryIds;
    }
  }

  // Price filters (URL params are in dollars, DB expects cents)
  if (params.minPrice) {
    const parsed = parseFloat(params.minPrice);
    if (!isNaN(parsed)) filters.minPrice = convertDollarsToCents(parsed);
  }
  if (params.maxPrice) {
    const parsed = parseFloat(params.maxPrice);
    if (!isNaN(parsed)) filters.maxPrice = convertDollarsToCents(parsed);
  }

  // Stock filter
  if (params.inStock === 'true') {
    filters.inStock = true;
  }

  const sortBy = params.sort ?? 'best_sellers';
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const pageSize = 24;

  // Build price range filters (exclude price filters to get full range)
  const priceRangeFilters: { categoryIds?: number[]; inStock?: boolean } = {};
  if (filters.categoryIds) priceRangeFilters.categoryIds = filters.categoryIds;
  if (filters.inStock) priceRangeFilters.inStock = true;

  // Fetch products, category tree, and price range in parallel
  const [result, categoryTree, priceRange] = await Promise.all([
    getProducts(filters, sortBy, { page, pageSize }),
    getCategoryTreeForStorefront(),
    getPriceRange(priceRangeFilters),
  ]);

  const { products, totalCount, totalPages } = result;
  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page heading */}
      <div className="mb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.3em] text-secondary-400 uppercase mb-3">
          {'// All Products //'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-secondary-800">
          Shop
        </h1>
        <div className="mt-3 h-[1px] w-[60px] bg-gradient-to-r from-primary-500 to-transparent" />
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'Shop' }]}
          className="mt-3"
        />
        <p className="mt-2 text-secondary-500">
          Browse our selection of premium ammunition and reloading supplies.
        </p>
      </div>

      {/* Shop content */}
      <ShopPageClient
        products={products}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        categories={categoryTree}
        priceRange={{ min: Math.round(priceRange.min / 100), max: Math.round(priceRange.max / 100) }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex justify-center">
          <div className="flex items-center gap-1">
            {/* Previous */}
            {page > 1 && (
              <PaginationLink page={page - 1} params={params} label="Previous">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </PaginationLink>
            )}

            {/* Page numbers */}
            {paginationRange.map((pageNum) => (
              <PaginationLink
                key={pageNum}
                page={pageNum}
                params={params}
                isActive={pageNum === page}
                label={`Page ${pageNum}`}
              >
                {pageNum}
              </PaginationLink>
            ))}

            {/* Next */}
            {page < totalPages && (
              <PaginationLink page={page + 1} params={params} label="Next">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </PaginationLink>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

// Pagination helper component
function PaginationLink({
  page,
  params,
  isActive,
  label,
  children,
}: {
  page: number;
  params: Record<string, string | undefined>;
  isActive?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== 'page') {
      searchParams.set(key, value);
    }
  }
  if (page > 1) searchParams.set('page', String(page));

  const href = `/shop${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={
        isActive
          ? 'w-10 h-10 flex items-center justify-center rounded-md bg-primary-500 text-secondary-900 text-sm font-semibold'
          : 'w-10 h-10 flex items-center justify-center rounded-md border border-secondary-200 text-secondary-600 text-sm hover:bg-secondary-50 transition-colors'
      }
    >
      {children}
    </Link>
  );
}
