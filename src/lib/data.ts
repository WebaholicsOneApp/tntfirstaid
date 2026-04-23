/**
 * Data fetching functions for the storefront
 * API-backed implementation — all data comes from OneApp storefront API
 *
 * Every exported function preserves its original signature exactly.
 * Internal Knex queries have been replaced with getApiClient() calls.
 * Adapter functions transform OneApp API responses into TNT First Aid types.
 */
import { getApiClient } from "./api-client";
import { getDownloadUrl, isKnownDownloadable } from "./downloads";
import {
  DEMO_CATEGORY_TREE,
  DEMO_PRODUCT_LIST_ITEMS,
  getDemoProductBySlug,
} from "./demo-products";
import type {
  ProductListItem,
  ProductDetail,
  VariationDetail,
  CategoryWithChildren,
  Category,
  ProductSuggestion,
  CategorySuggestion,
  SearchSuggestionsResponse,
} from "~/types";
import type {
  ReviewAggregate,
  ReviewsResponse,
  ReviewSortOption,
} from "~/types/review";
import { parseSearchQuery } from "./search-utils";

// ============================================
// PERFORMANCE: Simple in-memory cache for expensive operations
// Different TTLs for different data volatility levels
// ============================================
const CACHE_TTL_MS = 60 * 1000; // 60 seconds for frequently changing data
const CACHE_TTL_LONG_MS = 5 * 60 * 1000; // 5 minutes for stable data (recommendations, categories)

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const cache = new Map<string, CacheEntry<unknown>>();
export const pendingRequests = new Map<string, Promise<unknown>>();

export function getCached<T>(
  key: string,
  ttl: number = CACHE_TTL_MS,
): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearProductCaches(): void {
  cache.clear();
  pendingRequests.clear();
}

// Longer cache for stable data
export function getCachedLong<T>(key: string): T | null {
  return getCached<T>(key, CACHE_TTL_LONG_MS);
}

/**
 * Coalesce concurrent requests for the same cache key.
 * If multiple callers request the same key before the first resolves,
 * they all share the same in-flight promise instead of firing duplicate requests.
 */
export async function coalesceRequest<T>(
  cacheKey: string,
  fn: () => Promise<T>,
): Promise<T> {
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending as Promise<T>;
  }
  const promise = fn().finally(() => {
    pendingRequests.delete(cacheKey);
  });
  pendingRequests.set(cacheKey, promise);
  return promise;
}

// ============================================
// Utility exports (kept for backward compatibility)
// ============================================

export function escapeLikePattern(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}

export const MAX_SEARCH_LENGTH = 100;
export const MIN_SEARCH_LENGTH = 2;

// ============================================
// Slugify helper
// ============================================
function slugify(text: string | null | undefined): string {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ============================================
// Stub functions — API handles these server-side
// ============================================

export async function getCatalogueFeedProductIds(): Promise<Set<number>> {
  return new Set<number>();
}

export async function getProductPriceMap(): Promise<Map<number, number>> {
  return new Map<number, number>();
}

export async function getOnSaleProductIds(): Promise<Set<number>> {
  return new Set<number>();
}

export async function fetchProductsWithBrandAndCategory(_productIds: number[]) {
  return [];
}

export async function enrichProductList(
  _products: Array<{
    id: number;
    name: string;
    description: string | null;
    brandName: string | null;
    brandId: number | null;
    categoryName?: string | null;
    categoryId?: number | null;
  }>,
): Promise<ProductListItem[]> {
  return [];
}

// ============================================
// Adapter functions — transform API responses to TNT First Aid types
// ============================================

function toProductListItem(card: any): ProductListItem {
  return {
    id: card.id,
    slug: card.slug || slugify(card.name),
    name: card.name,
    description: card.description ?? null,
    brandName: card.brandName ?? null,
    brandId: card.brandId ?? null,
    categoryName: card.categoryName ?? null,
    categoryId: card.categoryId ?? null,
    primaryImage: card.imageUrl ?? card.primaryImage ?? null,
    fallbackImage: card.fallbackImage ?? null,
    price: card.price ?? null,
    maxPrice: card.maxPrice ?? null,
    msrp: card.msrp ?? card.compareAtPrice ?? null,
    maxMsrp: card.maxMsrp ?? null,
    map: card.map ?? null,
    maxMap: card.maxMap ?? null,
    inStock: card.inStock ?? false,
    variationCount: card.variationCount ?? 1,
    variationId: card.variationId ?? null,
    ...(card.averageRating != null && { averageRating: card.averageRating }),
    ...(card.totalReviews != null && { totalReviews: card.totalReviews }),
    ...(card.metaData?.isDownloadable === true ||
    card.isDownloadable === true ||
    isKnownDownloadable(card.slug || slugify(card.name))
      ? { isDownloadable: true }
      : {}),
  };
}

function toVariationDetail(v: any): VariationDetail {
  return {
    id: v.id,
    manufacturerNo: v.manufacturerNo ?? null,
    variantType: v.variantType ?? v.name ?? null,
    variation: v.variation ?? v.name ?? null,
    variantTypeTwo: v.variantTypeTwo ?? null,
    variationTwo: v.variationTwo ?? null,
    price: v.price ?? null,
    msrp: v.msrp ?? v.compareAtPrice ?? null,
    map: v.map ?? null,
    weight: v.weight ?? null,
    images: v.images ?? [],
    inStock: v.inStock ?? false,
    quantity: v.quantity ?? 0,
    packCount: v.packCount ?? null,
    isDownloadable:
      v.metaData?.isDownloadable === true || v.metaData?.downloadUrl != null,
    downloadUrl: (v.metaData?.downloadUrl as string) ?? null,
  };
}

function toProductDetail(
  detail: any,
  relatedProducts: ProductListItem[] = [],
): ProductDetail {
  const base = toProductListItem(detail);
  const variations: VariationDetail[] = (detail.variations ?? []).map(
    toVariationDetail,
  );
  // Inject fallback download URL for known downloadable products
  const slug = detail.slug || detail.urlSlug || "";
  const fallbackUrl = getDownloadUrl(slug);
  if (fallbackUrl) {
    for (const v of variations) {
      if (!v.downloadUrl) v.downloadUrl = fallbackUrl;
      v.isDownloadable = true;
    }
  }

  const isDownloadable =
    base.isDownloadable || variations.some((v) => v.isDownloadable);
  return {
    ...base,
    ...(isDownloadable ? { isDownloadable: true } : {}),
    bulletPoints: detail.bulletPoints ?? [],
    keywords: detail.keywords ?? null,
    images: detail.images ?? [],
    variations,
    relatedProducts,
  };
}

function toCategoryWithChildren(cat: any): CategoryWithChildren {
  return {
    id: cat.id,
    categoryName: cat.categoryName ?? cat.name ?? "",
    parentCategoryId: cat.parentCategoryId ?? null,
    amazonCategoryId: cat.amazonCategoryId ?? null,
    walmartCategoryId: cat.walmartCategoryId ?? null,
    wooCommerceCategoryId: cat.wooCommerceCategoryId ?? null,
    ebayCategoryId: cat.ebayCategoryId ?? null,
    createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
    updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
    children: (cat.children ?? []).map(toCategoryWithChildren),
    productCount: cat.totalProductCount ?? cat.productCount ?? 0,
    mergedCategoryIds: cat.mergedCategoryIds ?? [cat.id],
  };
}

function toCategory(cat: any): Category {
  return {
    id: cat.id,
    categoryName: cat.categoryName ?? cat.name ?? "",
    parentCategoryId: cat.parentCategoryId ?? null,
    amazonCategoryId: cat.amazonCategoryId ?? null,
    walmartCategoryId: cat.walmartCategoryId ?? null,
    wooCommerceCategoryId: cat.wooCommerceCategoryId ?? null,
    ebayCategoryId: cat.ebayCategoryId ?? null,
    createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
    updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
  };
}

// ============================================
// EXPORTED FUNCTIONS — Homepage & Featured
// ============================================

/**
 * Get featured products for the homepage
 */
export async function getFeaturedProducts(
  limit: number = 8,
): Promise<ProductListItem[]> {
  const cacheKey = `featuredProducts:${limit}`;
  const cached = getCachedLong<ProductListItem[]>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductListItem[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    try {
      const api = getApiClient();
      const data = await api.getHomePage<{ featuredProducts: any[] }>();
      const products = (data.featuredProducts || [])
        .slice(0, limit)
        .map(toProductListItem);
      setCache(cacheKey, products);
      return products;
    } catch (err) {
      console.error(
        "[getFeaturedProducts] API call failed:",
        err instanceof Error ? err.message : err,
      );
      return [];
    }
  });
}

// ============================================
// EXPORTED FUNCTIONS — Categories
// ============================================

/**
 * Get top-level categories with product counts
 */
export async function getTopLevelCategories(): Promise<
  (Category & { productCount: number })[]
> {
  const cacheKey = "topLevelCategories";
  const cached =
    getCachedLong<(Category & { productCount: number })[]>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain =
      getCachedLong<(Category & { productCount: number })[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    try {
      const api = getApiClient();
      const resp = await api.getTopCategories<{ categories: any[] }>();
      const categories = (resp?.categories || []).map((cat: any) => ({
        ...toCategory(cat),
        productCount: cat.totalProductCount ?? cat.productCount ?? 0,
      }));
      setCache(cacheKey, categories);
      return categories;
    } catch (err) {
      console.error(
        "[getTopLevelCategories] API call failed:",
        err instanceof Error ? err.message : err,
      );
      return [];
    }
  });
}

/**
 * Get hierarchical category tree for the storefront
 */
export async function getCategoryTreeForStorefront(): Promise<
  CategoryWithChildren[]
> {
  const cacheKey = "categoryTree";
  const cached = getCachedLong<CategoryWithChildren[]>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<CategoryWithChildren[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    try {
      const api = getApiClient();
      const resp = await api.getCategoryTree<{ categories: any[] }>();
      const tree = (resp?.categories || []).map(toCategoryWithChildren);
      const result = tree.length > 0 ? tree : DEMO_CATEGORY_TREE;
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error(
        "[getCategoryTreeForStorefront] API call failed:",
        err instanceof Error ? err.message : err,
      );
      return DEMO_CATEGORY_TREE;
    }
  });
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const cacheKey = "categories:all";
  const cached = getCachedLong<Category[]>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    try {
      const api = getApiClient();
      const resp = await api.getCategories<{ categories: any[] }>();
      const categories = (resp?.categories || []).map(toCategory);
      setCache(cacheKey, categories);
      return categories;
    } catch (err) {
      console.error(
        "[getCategories] API call failed:",
        err instanceof Error ? err.message : err,
      );
      return [];
    }
  });
}

/**
 * Get category tree filtered by company/store
 */
export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  return getCategoryTreeForStorefront();
}

/**
 * Get nested category tree for mega menu navigation
 */
export async function getNestedCategoryTree(): Promise<CategoryWithChildren[]> {
  return getCategoryTreeForStorefront();
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  try {
    const api = getApiClient();
    const data = await api.getCategoryBySlug<any>(slug);
    if (!data) return null;
    return toCategory(data);
  } catch {
    return null;
  }
}

/**
 * Get all descendant category IDs for a given category (including itself)
 */
export async function getCategoryWithDescendantIds(
  categoryId: number,
): Promise<number[]> {
  try {
    const api = getApiClient();
    const data = await api.getCategoryDescendants<{
      categoryId: number;
      descendantIds: number[];
    }>(categoryId);
    return [categoryId, ...(data.descendantIds || [])];
  } catch {
    return [categoryId];
  }
}

/**
 * Get all category IDs that match a category name pattern
 */
export async function getCategoryIdsByNamePattern(
  categoryName: string,
): Promise<number[]> {
  const searchTerm = categoryName.toLowerCase().replace(/s$/, "").trim();

  try {
    const allCategories = await getCategories();
    const matchingIds: number[] = [];
    for (const cat of allCategories) {
      if (cat.categoryName.toLowerCase().includes(searchTerm)) {
        matchingIds.push(cat.id);
      }
    }
    return matchingIds;
  } catch {
    return [];
  }
}

/**
 * Get all category IDs related to a category
 */
export async function getAllRelatedCategoryIds(
  categoryId: number,
  categoryName: string,
): Promise<number[]> {
  const [descendantIds, nameMatchIds] = await Promise.all([
    getCategoryWithDescendantIds(categoryId),
    getCategoryIdsByNamePattern(categoryName),
  ]);
  const allIds = new Set([...descendantIds, ...nameMatchIds]);
  return Array.from(allIds);
}

/**
 * Get category with its hierarchy (breadcrumb)
 */
export async function getCategoryWithHierarchy(
  categoryId: number,
): Promise<Category[]> {
  try {
    const api = getApiClient();
    const data = await api.getCategoryHierarchy<any[]>(categoryId);
    return (data || []).map(toCategory);
  } catch {
    return [];
  }
}

// ============================================
// EXPORTED FUNCTIONS — Products
// ============================================

interface GetProductsFilters {
  categoryId?: number;
  categoryIds?: number[];
  brandId?: number;
  brandIds?: number[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  packAvailable?: boolean;
  productIds?: number[];
}

interface GetProductsPagination {
  page?: number;
  pageSize?: number;
}

// Map internal sort values to storefront API sort values
const SORT_MAP: Record<string, string> = {
  best_sellers: "newest",
  name_asc: "name-asc",
  name_desc: "name-desc",
  price_asc: "price-asc",
  price_desc: "price-desc",
  newest: "newest",
  oldest: "oldest",
  top_rated: "rating-desc",
  relevance: "relevance",
};

/**
 * Get the price range for products matching the given filters.
 */
export async function getPriceRange(
  filters: Omit<GetProductsFilters, "minPrice" | "maxPrice"> = {},
): Promise<{ min: number; max: number }> {
  const filterKey = JSON.stringify(filters);
  const cacheKey = `priceRange:${filterKey}`;
  const cached = getCachedLong<{ min: number; max: number }>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<{ min: number; max: number }>(cacheKey);
    if (cachedAgain) return cachedAgain;

    try {
      const api = getApiClient();
      const params: Record<
        string,
        string | number | boolean | undefined | null
      > = {};
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.categoryIds?.length)
        params.categoryIds = filters.categoryIds.join(",");
      if (filters.brandId) params.brandId = filters.brandId;
      if (filters.brandIds?.length)
        params.brandIds = filters.brandIds.join(",");
      if (filters.search) params.search = filters.search;
      if (filters.inStock) params.inStock = true;
      if (filters.onSale) params.onSale = true;
      if (filters.packAvailable) params.packAvailable = true;
      if (filters.productIds?.length)
        params.productIds = filters.productIds.join(",");

      const data = await api.getPriceRange<{
        minPrice: number;
        maxPrice: number;
      }>(params);
      const min = data.minPrice ?? 0;
      const max = data.maxPrice ?? 0;
      const result =
        max > 0 ? { min, max } : demoPriceRangeFallback();
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error(
        "[getPriceRange] API call failed:",
        err instanceof Error ? err.message : err,
      );
      const fallback = demoPriceRangeFallback();
      setCache(cacheKey, fallback);
      return fallback;
    }
  });
}

function demoPriceRangeFallback(): { min: number; max: number } {
  const prices = DEMO_PRODUCT_LIST_ITEMS.map((p) => p.price ?? 0).filter(
    (p) => p > 0,
  );
  if (prices.length === 0) return { min: 0, max: 10000 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/**
 * Get products with filtering, pagination, and sorting
 */
export async function getProducts(
  filters: GetProductsFilters = {},
  sortBy: string = "name_asc",
  pagination: GetProductsPagination = {},
): Promise<{
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
}> {
  const { page = 1, pageSize = 24 } = pagination;

  // Validate search param length
  if (filters.search) {
    const trimmed = filters.search.trim();
    if (
      trimmed.length < MIN_SEARCH_LENGTH ||
      trimmed.length > MAX_SEARCH_LENGTH
    ) {
      return { products: [], totalCount: 0, totalPages: 0 };
    }
  }

  try {
    const api = getApiClient();
    const params: Record<string, string | number | boolean | undefined | null> =
      {
        page,
        limit: pageSize,
        sort: SORT_MAP[sortBy] || "name-asc",
      };

    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.categoryIds?.length)
      params.categoryIds = filters.categoryIds.join(",");
    if (filters.brandId) params.brandId = filters.brandId;
    if (filters.brandIds?.length) params.brandIds = filters.brandIds.join(",");
    if (filters.search) params.search = filters.search.trim();
    if (filters.minPrice != null) params.minPrice = filters.minPrice;
    if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
    if (filters.inStock) params.inStock = true;
    if (filters.onSale) params.onSale = true;
    if (filters.packAvailable) params.packAvailable = true;
    if (filters.productIds?.length)
      params.productIds = filters.productIds.join(",");

    const data = await api.getProducts<{
      data: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(params);

    const products = (data.data || []).map(toProductListItem);
    if (products.length > 0) {
      return {
        products,
        totalCount: data.pagination?.total ?? products.length,
        totalPages: data.pagination?.totalPages ?? 1,
      };
    }
    return demoProductsFallback(filters, page, pageSize);
  } catch (err) {
    console.error(
      "[getProducts] API call failed:",
      err instanceof Error ? err.message : err,
    );
    return demoProductsFallback(filters, page, pageSize);
  }
}

// Serve mock products when the API returns nothing — lets the shop layout
// stay populated while the OneApp API has placeholder credentials.
function demoProductsFallback(
  filters: GetProductsFilters,
  page: number,
  pageSize: number,
): { products: ProductListItem[]; totalCount: number; totalPages: number } {
  const hasFilters =
    !!filters.categoryId ||
    !!filters.categoryIds?.length ||
    !!filters.brandId ||
    !!filters.brandIds?.length ||
    !!filters.search ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    !!filters.inStock ||
    !!filters.onSale ||
    !!filters.packAvailable ||
    !!filters.productIds?.length;
  if (hasFilters) return { products: [], totalCount: 0, totalPages: 0 };

  const all = DEMO_PRODUCT_LIST_ITEMS;
  const start = (page - 1) * pageSize;
  const products = all.slice(start, start + pageSize);
  return {
    products,
    totalCount: all.length,
    totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
  };
}

/**
 * Get a product by its slug
 */
export async function getProductBySlug(
  slug: string,
): Promise<ProductListItem | null> {
  const cacheKey = `productBySlug:${slug}`;
  const missCacheKey = `productBySlugMiss:${slug}`;
  const cached = getCachedLong<ProductListItem>(cacheKey);
  if (cached) return cached;
  if (getCachedLong<boolean>(missCacheKey)) return null;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductListItem>(cacheKey);
    if (cachedAgain) return cachedAgain;

    try {
      const api = getApiClient();
      const response = await api.getProductBySlug<any>(slug);
      const data = response?.product ?? response;
      if (!data) {
        setCache(missCacheKey, true);
        return null;
      }
      const product = toProductListItem(data);
      setCache(cacheKey, product);
      return product;
    } catch {
      setCache(missCacheKey, true);
      return null;
    }
  });
}

/**
 * Get product recommendations (upsell/cross-sell) for a product
 */
export async function getProductRecommendations(
  productId: number,
  _categoryId?: number | null,
  _brandId?: number | null,
  limit: number = 12,
  _options: {
    minCooccurrence?: number;
    sinceDays?: number;
  } = {},
): Promise<ProductListItem[]> {
  const cacheKey = `recommendations:${productId}:${limit}`;
  const cached = getCachedLong<ProductListItem[]>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductListItem[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    try {
      const api = getApiClient();
      const data = await api.getRecommendations<{ data: any[] }>(productId);
      const products = (data.data || []).slice(0, limit).map(toProductListItem);
      setCache(cacheKey, products);
      return products;
    } catch (err) {
      console.error(
        "[getProductRecommendations] API call failed:",
        err instanceof Error ? err.message : err,
      );
      return [];
    }
  });
}

/**
 * Get recommendations for multiple products at once (optimized for cart)
 */
export async function getBatchedRecommendations(
  productIds: number[],
  limit: number = 12,
): Promise<ProductListItem[]> {
  if (productIds.length === 0) return [];

  const cacheKey = `batchRec:${[...productIds].sort().join(",")}:${limit}`;
  const cached = getCachedLong<ProductListItem[]>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductListItem[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    try {
      const allRecommendations = await Promise.all(
        productIds.map((id) =>
          getProductRecommendations(id, null, null, limit),
        ),
      );

      const seen = new Set(productIds);
      const deduplicated: ProductListItem[] = [];
      for (const recs of allRecommendations) {
        for (const rec of recs) {
          if (!seen.has(rec.id)) {
            seen.add(rec.id);
            deduplicated.push(rec);
          }
          if (deduplicated.length >= limit) break;
        }
        if (deduplicated.length >= limit) break;
      }

      const result = deduplicated.slice(0, limit);
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error(
        "[getBatchedRecommendations] API call failed:",
        err instanceof Error ? err.message : err,
      );
      return [];
    }
  });
}

/**
 * Get full product detail by slug (for product detail page)
 */
export async function getProductDetailBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const cacheKey = `productDetailBySlug:${slug}`;
  const missCacheKey = `productDetailBySlugMiss:${slug}`;
  const cached = getCachedLong<ProductDetail>(cacheKey);
  if (cached) return cached;
  if (getCachedLong<boolean>(missCacheKey)) return null;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductDetail>(cacheKey);
    if (cachedAgain) return cachedAgain;

    try {
      const api = getApiClient();
      const response = await api.getProductBySlug<any>(slug);
      const data = response?.product ?? response;
      if (!data) {
        const demo = getDemoProductBySlug(slug);
        if (demo) {
          setCache(cacheKey, demo);
          return demo;
        }
        setCache(missCacheKey, true);
        return null;
      }

      // Fetch recommendations in parallel if we have the product ID
      let relatedProducts: ProductListItem[] = [];
      if (data.id) {
        try {
          relatedProducts = await getProductRecommendations(
            data.id,
            null,
            null,
            12,
          );
        } catch {
          // Silently fail — recommendations are non-critical
        }
      }

      const detail = toProductDetail(data, relatedProducts);

      // If no variations with valid prices, product cannot be displayed
      if (detail.variations.length === 0) {
        const demo = getDemoProductBySlug(slug);
        if (demo) {
          setCache(cacheKey, demo);
          return demo;
        }
        setCache(missCacheKey, true);
        return null;
      }

      setCache(cacheKey, detail);
      return detail;
    } catch {
      const demo = getDemoProductBySlug(slug);
      if (demo) {
        setCache(cacheKey, demo);
        return demo;
      }
      setCache(missCacheKey, true);
      return null;
    }
  });
}

/**
 * Lightweight product detail — skips recommendations fetch for faster loading (used by QuickAddModal)
 */
export async function getProductDetailOnly(
  slug: string,
): Promise<ProductDetail | null> {
  const cacheKey = `productDetailOnly:${slug}`;
  const missCacheKey = `productDetailOnlyMiss:${slug}`;
  const cached = getCachedLong<ProductDetail>(cacheKey);
  if (cached) return cached;
  if (getCachedLong<boolean>(missCacheKey)) return null;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductDetail>(cacheKey);
    if (cachedAgain) return cachedAgain;

    try {
      const api = getApiClient();
      const response = await api.getProductBySlug<any>(slug);
      const data = response?.product ?? response;
      if (!data) {
        setCache(missCacheKey, true);
        return null;
      }

      const detail = toProductDetail(data);

      if (detail.variations.length === 0) {
        setCache(missCacheKey, true);
        return null;
      }

      setCache(cacheKey, detail);
      return detail;
    } catch {
      setCache(missCacheKey, true);
      return null;
    }
  });
}

/**
 * Search products by query
 */
export async function searchProducts(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    categoryIds?: number[];
    brandIds?: number[];
    inStock?: boolean;
    onSale?: boolean;
    packAvailable?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  } = {},
): Promise<{
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
}> {
  const page = options.page || 1;
  const pageSize = options.pageSize || 24;
  const sortVal = SORT_MAP[options.sort || "relevance"] || "relevance";

  try {
    const api = getApiClient();
    const params: Record<string, string | number | boolean | undefined | null> =
      {
        q: query,
        page,
        limit: pageSize,
        sort: sortVal,
      };

    if (options.categoryIds?.length)
      params.categoryIds = options.categoryIds.join(",");
    if (options.brandIds?.length) params.brandIds = options.brandIds.join(",");
    if (options.inStock) params.inStock = true;
    if (options.onSale) params.onSale = true;
    if (options.minPrice != null) params.minPrice = options.minPrice;
    if (options.maxPrice != null) params.maxPrice = options.maxPrice;

    const data = await api.searchProductsFts<{
      data: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(params);

    const products = (data.data || []).map(toProductListItem);
    return {
      products,
      totalCount: data.pagination?.total ?? products.length,
      totalPages: data.pagination?.totalPages ?? 1,
    };
  } catch (err) {
    console.error(
      "[searchProducts] API call failed:",
      err instanceof Error ? err.message : err,
    );
    return { products: [], totalCount: 0, totalPages: 0 };
  }
}

// ============================================
// Search Suggestions (Autocomplete)
// ============================================

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(
  query: string,
): Promise<SearchSuggestionsResponse> {
  const trimmed = query.trim();

  const cacheKey = `searchSuggestions:${trimmed.toLowerCase()}`;
  const cached = getCached<SearchSuggestionsResponse>(cacheKey);
  if (cached) return cached;

  const parsed = parseSearchQuery(trimmed);

  try {
    const api = getApiClient();
    const data =
      await api.getSearchSuggestions<SearchSuggestionsResponse>(trimmed);

    const result: SearchSuggestionsResponse = {
      products: (data.products || []).map(
        (p: any): ProductSuggestion => ({
          id: p.id,
          slug: p.slug || slugify(p.name),
          name: p.name,
          brandName: p.brandName ?? null,
          primaryImage: p.primaryImage ?? p.imageUrl ?? null,
          price: p.price ?? null,
          maxPrice: p.maxPrice ?? null,
          inStock: p.inStock ?? false,
        }),
      ),
      categories: (data.categories || []).map(
        (c: any): CategorySuggestion => ({
          id: c.id,
          name: c.name ?? c.categoryName ?? "",
          slug: c.slug || slugify(c.name ?? c.categoryName),
          productCount: c.productCount ?? 0,
          parentName: c.parentName ?? null,
        }),
      ),
      queryType: data.queryType || parsed.type,
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(
      "[getSearchSuggestions] API call failed:",
      err instanceof Error ? err.message : err,
    );
    return {
      products: [],
      categories: [],
      queryType: parsed.type,
    };
  }
}

// ============================================
// Reviews
// ============================================

/**
 * Get review aggregate (average rating, counts) for a product.
 */
export async function getReviewAggregate(
  productId: number,
): Promise<ReviewAggregate | null> {
  const cacheKey = `reviewAggregate:${productId}`;
  if (cache.has(cacheKey)) {
    return getCachedLong<ReviewAggregate | null>(cacheKey);
  }

  try {
    const api = getApiClient();
    const data = await api.getProductReviews<any>(productId, {
      page: 1,
      limit: 1,
    });

    if (!data?.aggregate) {
      setCache(cacheKey, null);
      return null;
    }

    const agg = data.aggregate;
    const aggregate: ReviewAggregate = {
      totalReviews: Number(agg.totalReviews) || 0,
      averageRating: Number(agg.averageRating) || 0,
      rating1Count: Number(agg.rating1Count) || 0,
      rating2Count: Number(agg.rating2Count) || 0,
      rating3Count: Number(agg.rating3Count) || 0,
      rating4Count: Number(agg.rating4Count) || 0,
      rating5Count: Number(agg.rating5Count) || 0,
    };

    setCache(cacheKey, aggregate);
    return aggregate;
  } catch (err) {
    console.error(
      "[getReviewAggregate] API call failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Get paginated reviews for a product with images.
 */
export async function getProductReviews(
  productId: number,
  options: { page?: number; limit?: number; sort?: ReviewSortOption } = {},
): Promise<ReviewsResponse> {
  const page = options.page ?? 1;
  const limit = Math.min(options.limit ?? 10, 50);
  const sort = options.sort ?? "newest";

  const cacheKey = `productReviews:${productId}:${page}:${limit}:${sort}`;
  const cached = getCached<ReviewsResponse>(cacheKey);
  if (cached) return cached;

  const emptyResponse: ReviewsResponse = {
    reviews: [],
    aggregate: {
      totalReviews: 0,
      averageRating: 0,
      rating1Count: 0,
      rating2Count: 0,
      rating3Count: 0,
      rating4Count: 0,
      rating5Count: 0,
    },
    pagination: { page, limit, total: 0, totalPages: 0 },
  };

  try {
    const api = getApiClient();
    const data = await api.getProductReviews<ReviewsResponse>(productId, {
      page,
      limit,
      sort,
    });

    if (!data) return emptyResponse;

    const result: ReviewsResponse = {
      reviews: data.reviews || [],
      aggregate: data.aggregate || emptyResponse.aggregate,
      pagination: data.pagination || { page, limit, total: 0, totalPages: 0 },
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(
      "[getProductReviews] API call failed:",
      err instanceof Error ? err.message : err,
    );
    return emptyResponse;
  }
}
