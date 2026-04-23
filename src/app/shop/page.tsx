import type { Metadata } from "next";
import {
  getProducts,
  getCategoryTreeForStorefront,
  getCategoryBySlug,
  getAllRelatedCategoryIds,
  getPriceRange,
} from "~/lib/data";
import { convertDollarsToCents, getPaginationRange } from "~/lib/utils";
import ShopPageClient from "~/components/products/ShopPageClient";
import ShopHero from "~/components/shop/ShopHero";
import Breadcrumbs from "~/components/common/Breadcrumbs";
import Link from "next/link";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our selection of first aid kits, medical supplies, AEDs, and training gear.",
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
      const categoryIds = await getAllRelatedCategoryIds(
        category.id,
        category.categoryName,
      );
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
  if (params.inStock === "true") {
    filters.inStock = true;
  }

  const sortBy = params.sort ?? "best_sellers";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
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

  // Hero shows when the user is browsing the full catalog (page 1, no
  // narrowing filters applied). Sort changes keep the hero — they reorder
  // results without narrowing them. Pagination hides it so users on page 2+
  // don't get bumped back to the top.
  const isPristine =
    !params.category &&
    !params.minPrice &&
    !params.maxPrice &&
    !params.inStock &&
    page === 1;

  return (
    <div>
      {isPristine && (
        <ShopHero
          categories={categoryTree}
          totalProductCount={totalCount}
        />
      )}

      <div className="container mx-auto px-4 py-8" id="products">
        {!isPristine && (
          <div className="border-secondary-100 mb-10 border-b pb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-8" />
              <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.35em] uppercase">
                All Products
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-secondary-900 text-3xl font-bold tracking-tight sm:text-4xl">
                  Shop
                </h1>
                <Breadcrumbs
                  items={[{ label: "Home", href: "/" }, { label: "Shop" }]}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )}

        {isPristine && (
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Shop" }]}
            className="mb-6"
          />
        )}

        {/* Shop content */}
        <ShopPageClient
          products={products}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          categories={categoryTree}
          priceRange={{
            min: Math.round(priceRange.min / 100),
            max: Math.round(priceRange.max / 100),
          }}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex justify-center">
            <div className="flex items-center gap-1.5">
              {/* Previous */}
              {page > 1 && (
                <PaginationLink
                  page={page - 1}
                  params={params}
                  label="Previous"
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
                      d="M15 19l-7-7 7-7"
                    />
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </PaginationLink>
              )}
            </div>
          </nav>
        )}
      </div>
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
    if (value && key !== "page") {
      searchParams.set(key, value);
    }
  }
  if (page > 1) searchParams.set("page", String(page));

  const href = `/shop${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "bg-primary-500 text-secondary-900 flex h-11 w-10 items-center justify-center rounded-lg font-mono text-sm font-semibold tracking-tight"
          : "border-secondary-200 text-secondary-500 hover:border-secondary-300 hover:text-secondary-800 hover:bg-secondary-50 flex h-11 w-10 items-center justify-center rounded-lg border text-sm transition-colors"
      }
    >
      {children}
    </Link>
  );
}
