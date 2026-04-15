import type { Metadata } from "next";
import { searchProducts } from "~/lib/data";
import { getPaginationRange } from "~/lib/utils";
import ProductGrid from "~/components/products/ProductGrid";
import Link from "next/link";

export const revalidate = 60;

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  return {
    title: query ? `Search: ${query}` : "Search",
    description: query
      ? `Search results for "${query}" at TNT First Aid.`
      : "Search for ammunition and reloading supplies.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <svg
          className="text-secondary-200 mx-auto mb-4 h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h1 className="font-display text-secondary-900 mb-2 text-2xl font-bold">
          Search Products
        </h1>
        <p className="text-secondary-500">
          Enter a search term to find ammunition and reloading supplies.
        </p>
      </div>
    );
  }

  const result = await searchProducts(query, { page, pageSize: 24 });
  const { products, totalCount, totalPages } = result;
  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-secondary-400 mb-3 font-mono text-[0.65rem] tracking-[0.3em] uppercase">
          {"// Search //"}
        </p>
        <h1 className="font-display text-secondary-900 text-3xl font-bold sm:text-4xl">
          Search Results
        </h1>
        <div className="from-primary-500 mt-3 h-[1px] w-[60px] bg-gradient-to-r to-transparent" />
        <p className="text-secondary-500 mt-2">
          {totalCount} result{totalCount !== 1 ? "s" : ""} for &ldquo;{query}
          &rdquo;
        </p>
      </div>

      {/* Product grid */}
      <ProductGrid products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex justify-center">
          <div className="flex items-center gap-1">
            {page > 1 && (
              <SearchPaginationLink
                page={page - 1}
                query={query}
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
              </SearchPaginationLink>
            )}

            {paginationRange.map((pageNum) => (
              <SearchPaginationLink
                key={pageNum}
                page={pageNum}
                query={query}
                isActive={pageNum === page}
                label={`Page ${pageNum}`}
              >
                {pageNum}
              </SearchPaginationLink>
            ))}

            {page < totalPages && (
              <SearchPaginationLink page={page + 1} query={query} label="Next">
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
              </SearchPaginationLink>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

function SearchPaginationLink({
  page,
  query,
  isActive,
  label,
  children,
}: {
  page: number;
  query: string;
  isActive?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const searchParams = new URLSearchParams({ q: query });
  if (page > 1) searchParams.set("page", String(page));
  const href = `/search?${searchParams.toString()}`;

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "bg-primary-500 text-secondary-900 flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold"
          : "border-secondary-200 text-secondary-600 hover:bg-secondary-50 flex h-10 w-10 items-center justify-center rounded-md border text-sm transition-colors"
      }
    >
      {children}
    </Link>
  );
}
