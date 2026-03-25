import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getProducts,
  getCategoryTreeForStorefront,
  getCategoryBySlug,
  getCategoryWithHierarchy,
  getAllRelatedCategoryIds,
  getPriceRange,
} from '~/lib/data';
import { convertDollarsToCents, getPaginationRange } from '~/lib/utils';
import ShopPageClient from '~/components/products/ShopPageClient';
import Breadcrumbs from '~/components/common/Breadcrumbs';
import type { BreadcrumbItem } from '~/components/common/Breadcrumbs';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

interface CategoryShopPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryShopPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: category.categoryName,
    description: `Shop ${category.categoryName} - premium ammunition and reloading supplies.`,
  };
}

export default async function CategoryShopPage({ params, searchParams }: CategoryShopPageProps) {
  const { category: categorySlug } = await params;
  const queryParams = await searchParams;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  // Build filters
  const categoryIds = await getAllRelatedCategoryIds(category.id, category.categoryName);

  const filters: {
    categoryIds: number[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  } = { categoryIds };

  if (queryParams.minPrice) {
    const parsed = parseFloat(queryParams.minPrice);
    if (!isNaN(parsed)) filters.minPrice = convertDollarsToCents(parsed);
  }
  if (queryParams.maxPrice) {
    const parsed = parseFloat(queryParams.maxPrice);
    if (!isNaN(parsed)) filters.maxPrice = convertDollarsToCents(parsed);
  }
  if (queryParams.inStock === 'true') {
    filters.inStock = true;
  }

  const sortBy = queryParams.sort ?? 'best_sellers';
  const page = Math.max(1, parseInt(queryParams.page ?? '1', 10) || 1);
  const pageSize = 24;

  // Build price range filters (exclude price filters to get full range)
  const priceRangeFilters: { categoryIds: number[]; inStock?: boolean } = { categoryIds };
  if (filters.inStock) priceRangeFilters.inStock = true;

  // Fetch products, category tree, hierarchy, and price range in parallel
  const [result, categoryTree, hierarchy, priceRange] = await Promise.all([
    getProducts(filters, sortBy, { page, pageSize }),
    getCategoryTreeForStorefront(),
    getCategoryWithHierarchy(category.id),
    getPriceRange(priceRangeFilters),
  ]);

  const { products, totalCount, totalPages } = result;
  const paginationRange = getPaginationRange(page, totalPages);

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
  ];
  for (let i = 0; i < hierarchy.length; i++) {
    const cat = hierarchy[i]!;
    const isLast = i === hierarchy.length - 1;
    breadcrumbs.push({
      label: cat.categoryName,
      href: isLast ? undefined : `/shop/${slugify(cat.categoryName)}`,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="mb-4" />

      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-secondary-900">
          {category.categoryName}
        </h1>
      </div>

      {/* Shop content */}
      <ShopPageClient
        products={products}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        categories={categoryTree}
        currentCategorySlug={categorySlug}
        priceRange={{ min: Math.round(priceRange.min / 100), max: Math.round(priceRange.max / 100) }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex justify-center">
          <div className="flex items-center gap-1">
            {page > 1 && (
              <PaginationLink
                page={page - 1}
                categorySlug={categorySlug}
                params={queryParams}
                label="Previous"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </PaginationLink>
            )}

            {paginationRange.map((pageNum) => (
              <PaginationLink
                key={pageNum}
                page={pageNum}
                categorySlug={categorySlug}
                params={queryParams}
                isActive={pageNum === page}
                label={`Page ${pageNum}`}
              >
                {pageNum}
              </PaginationLink>
            ))}

            {page < totalPages && (
              <PaginationLink
                page={page + 1}
                categorySlug={categorySlug}
                params={queryParams}
                label="Next"
              >
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

function PaginationLink({
  page,
  categorySlug,
  params,
  isActive,
  label,
  children,
}: {
  page: number;
  categorySlug: string;
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

  const href = `/shop/${categorySlug}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

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
