/**
 * Data fetching functions for the storefront
 * Server-side only - uses direct database access
 */
import { pgKnex as knex, tableNames, STOREFRONT_COMPANY_ID, STOREFRONT_STORE_ID } from './db';

function normalizeCategoryName(name: string): string {
  return name.toLowerCase().replace(/\s*&\s*/g, ' and ').trim().replace(/\s+/g, ' ');
}

// ============================================
// PERFORMANCE: Simple in-memory cache for expensive operations
// Different TTLs for different data volatility levels
// ============================================
const CACHE_TTL_MS = 60 * 1000; // 60 seconds for frequently changing data
const CACHE_TTL_LONG_MS = 5 * 60 * 1000; // 5 minutes for stable data (recommendations, categories)
const CACHE_TTL_SEARCH_MS = 2 * 60 * 1000; // 2 minutes for search results
// Emergency circuit breaker: disable recommendation SQL to protect DB/CPU.
const RECOMMENDATIONS_ENABLED = false;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const cache = new Map<string, CacheEntry<unknown>>();
export const pendingRequests = new Map<string, Promise<unknown>>();

export function getCached<T>(key: string, ttl: number = CACHE_TTL_MS): T | null {
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
 * they all share the same in-flight promise instead of firing duplicate queries.
 */
export async function coalesceRequest<T>(cacheKey: string, fn: () => Promise<T>): Promise<T> {
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
// FALLBACK CATEGORIES: Keyword-based category assignment
// Used when store_product_categories has no rows for this store.
// Negative IDs distinguish fallback categories from real DB categories.
// ============================================
const FALLBACK_CATEGORIES: Array<{
  id: number;
  categoryName: string;
  keywords: RegExp;
}> = [
  { id: -1, categoryName: 'Brass', keywords: /SRP|LRP|primer|grendel|dasher|creedmoor|^6mm|^6\.5|^7mm|^\.2[26]|^\.30[08]|^8\.6|^25|brass|cartridge/i },
  { id: -2, categoryName: 'Reamers/Gunsmithing', keywords: /reamer|die|sizer|mandrel|gunsmith/i },
  { id: -3, categoryName: 'Loading Bench', keywords: /bench|press|tool|gauge|comp|micron|powder|scale|funnel/i },
  { id: -4, categoryName: 'Apparel', keywords: /shirt|hat|hoodie|beanie|cap|tee|polo|jacket|vest/i },
  { id: -5, categoryName: 'Stickers', keywords: /sticker|decal|patch/i },
  { id: -6, categoryName: 'Modified Cases', keywords: /modified case/i },
];

/**
 * Get the regex pattern for a set of fallback category IDs.
 * Returns a combined pattern string for use in SQL ~* operator.
 */
function getFallbackCategoryPattern(categoryIds: number[]): string | null {
  const patterns: string[] = [];
  for (const id of categoryIds) {
    const cat = FALLBACK_CATEGORIES.find(c => c.id === id);
    if (cat) {
      patterns.push(cat.keywords.source);
    }
  }
  return patterns.length > 0 ? patterns.join('|') : null;
}

/**
 * Get the set of product IDs in the catalogue feed.
 * Cached for 5 minutes since the feed rarely changes.
 */
export async function getCatalogueFeedProductIds(): Promise<Set<number>> {
  const cacheKey = 'catalogueFeedProductIds';
  const cached = getCachedLong<Set<number>>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<Set<number>>(cacheKey);
    if (cachedAgain) return cachedAgain;

    const rows = await knex(tableNames.catalogueFeed)
      .select('productId')
      .distinct();
    const idSet = new Set(rows.map(r => r.productId as number));
    setCache(cacheKey, idSet);
    return idSet;
  });
}

/**
 * Pre-compute min price per product and on-sale status, cached for 5 minutes.
 * Drives from variations × manufacturer_suppliers (avoids catalogue_feed row multiplication).
 * All subsequent getPriceRange() calls iterate this map in JS — zero additional DB cost.
 */
async function _computeProductPriceData(): Promise<{
  priceMap: Map<number, number>;
  onSaleIds: Set<number>;
}> {
  const cacheKey = 'productPriceData';
  const cached = getCachedLong<{ priceMap: Map<number, number>; onSaleIds: Set<number> }>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<{ priceMap: Map<number, number>; onSaleIds: Set<number> }>(cacheKey);
    if (cachedAgain) return cachedAgain;

    // Use itemPrice directly from variations — no markup calculation needed
    const existsSubquery = knex(`${tableNames.storeProducts} as sp`)
      .select(knex.raw('1'))
      .join(`${tableNames.catalogueFeed} as cf`, 'cf.productId', 'sp.id')
      .whereRaw('sp.id = v."productId"')
      .whereNull('sp.deactivatedAt');
    if (STOREFRONT_STORE_ID) {
      existsSubquery.where('sp.storeId', STOREFRONT_STORE_ID);
    }

    const query = knex(`${tableNames.variations} as v`)
      .select(
        'v.productId',
        knex.raw(`MIN(v."itemPrice") as "minPrice"`),
        knex.raw(`(array_agg(v.msrp ORDER BY v."itemPrice" ASC))[1] > MIN(v."itemPrice") as "onSale"`)
      )
      .join(`${tableNames.manufacturerSuppliers} as ms`, 'v.id', 'ms.variationId')
      .whereNull('v.deletedAt')
      .whereNull('ms.deletedAt')
      .where('v.itemPrice', '>', 0)
      .where('ms.quantity', '>', 0)
      .whereExists(existsSubquery)
      .groupBy('v.productId');

    let rows: Array<{ productId: number; minPrice: string | null; onSale: boolean | null }> = [];
    try {
      await knex.transaction(async (trx) => {
        await trx.raw('SET LOCAL statement_timeout = 60000');
        rows = await query.transacting(trx) as typeof rows;
      });
    } catch (err) {
      console.error('[_computeProductPriceData] query failed:', err instanceof Error ? err.message : err);
      return { priceMap: new Map<number, number>(), onSaleIds: new Set<number>() };
    }

    const priceMap = new Map<number, number>();
    const onSaleIds = new Set<number>();
    for (const row of rows) {
      const price = row.minPrice ? Number(row.minPrice) : 0;
      if (price > 0) priceMap.set(row.productId, price);
      if (row.onSale) onSaleIds.add(row.productId);
    }

    console.log(`[_computeProductPriceData] cached ${priceMap.size} products, ${onSaleIds.size} on sale`);
    const result = { priceMap, onSaleIds };
    setCache(cacheKey, result);
    return result;
  });
}

export async function getProductPriceMap(): Promise<Map<number, number>> {
  return (await _computeProductPriceData()).priceMap;
}

export async function getOnSaleProductIds(): Promise<Set<number>> {
  return (await _computeProductPriceData()).onSaleIds;
}

/**
 * Fetch product details with brand and category for a list of product IDs.
 * Splits into two queries to avoid the category join fan-out problem
 * (a product with N categories x M variations = N*M rows in a single join).
 */
export async function fetchProductsWithBrandAndCategory(productIds: number[]) {
  // Query 1: products + brand (via one variation per product, deduplicated by groupBy)
  const products = await knex(tableNames.storeProducts)
    .select(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      `${tableNames.storeProducts}.description`,
      `${tableNames.brands}.brand as brandName`,
      `${tableNames.variations}.brandId`
    )
    .leftJoin(tableNames.variations, function () {
      this.on(`${tableNames.storeProducts}.id`, '=', `${tableNames.variations}.productId`)
        .andOnNull(`${tableNames.variations}.deletedAt`);
    })
    .leftJoin(
      tableNames.brands,
      `${tableNames.variations}.brandId`,
      `${tableNames.brands}.id`
    )
    .whereIn(`${tableNames.storeProducts}.id`, productIds)
    .groupBy(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      `${tableNames.storeProducts}.description`,
      `${tableNames.brands}.brand`,
      `${tableNames.variations}.brandId`
    );

  // Query 2: one category per product (separate to avoid row multiplication)
  const categoryRows = await knex(tableNames.storeProductCategories)
    .select(
      `${tableNames.storeProductCategories}.storeProductId`,
      `${tableNames.channelCategories}.categoryName`,
      `${tableNames.channelCategories}.id as categoryId`
    )
    .leftJoin(
      tableNames.channelCategories,
      `${tableNames.storeProductCategories}.channelCategoryId`,
      `${tableNames.channelCategories}.id`
    )
    .whereIn(`${tableNames.storeProductCategories}.storeProductId`, productIds)
    .groupBy(
      `${tableNames.storeProductCategories}.storeProductId`,
      `${tableNames.channelCategories}.categoryName`,
      `${tableNames.channelCategories}.id`
    );

  const categoryMap = new Map<number, { categoryName: string | null; categoryId: number | null }>();
  for (const row of categoryRows) {
    if (!categoryMap.has(row.storeProductId)) {
      categoryMap.set(row.storeProductId, {
        categoryName: row.categoryName,
        categoryId: row.categoryId,
      });
    }
  }

  return products.map(p => ({
    ...p,
    categoryName: categoryMap.get(p.id)?.categoryName ?? null,
    categoryId: categoryMap.get(p.id)?.categoryId ?? null,
  }));
}

/**
 * Escapes special characters in LIKE patterns to prevent SQL injection
 * and wildcard abuse attacks.
 *
 * Characters escaped:
 * - % (matches any sequence of characters)
 * - _ (matches any single character)
 * - \ (escape character itself)
 *
 * @param str - The search string to escape
 * @returns Escaped string safe for use in LIKE queries
 *
 * Note: Product name + description use PostgreSQL full-text search (to_tsvector/plainto_tsquery)
 * with a GIN expression index for stemming and relevance ranking.
 * Brand, SKU, and category fields still use ILIKE and need this escaping.
 */
export function escapeLikePattern(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

/** Maximum allowed search string length */
export const MAX_SEARCH_LENGTH = 100;

/** Minimum required search string length */
export const MIN_SEARCH_LENGTH = 2;
import type {
  ProductListItem,
  ProductDetail,
  VariationDetail,
  CategoryWithChildren,
  Category,
  ProductSuggestion,
  CategorySuggestion,
  SearchSuggestionsResponse
} from '~/types';
import type { ReviewAggregate, ReviewsResponse, ReviewSortOption } from '~/types/review';
import { parseSearchQuery } from './search-utils';

/**
 * Get featured products for the homepage
 * Returns top-selling products from the catalogue feed table
 * Ranked by total quantity sold across all channels
 */
export async function getFeaturedProducts(limit: number = 8): Promise<ProductListItem[]> {
  const cacheKey = `featuredProducts:${limit}`;
  const cached = getCachedLong<ProductListItem[]>(cacheKey);
  if (cached) return cached;

  // Coalesce concurrent requests — all callers share one in-flight query
  return coalesceRequest(cacheKey, async () => {
    // Double-check cache after winning the race
    const cachedAgain = getCachedLong<ProductListItem[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    // Get top-selling product IDs from order history
    const topSellingProducts = await knex('order_items as oi')
      .select('v.productId')
      .sum('oi.quantity as totalSold')
      .join(`${tableNames.variations} as v`, 'oi.variationId', 'v.id')
      .whereIn('v.productId', function () {
        this.select('productId').distinct().from(tableNames.catalogueFeed);
      })
      .whereNot('v.productId', 0)
      .whereNull('v.deletedAt')
      .groupBy('v.productId')
      .orderBy('totalSold', 'desc')
      .limit(limit);

    let productIds = topSellingProducts.map(p => p.productId);

    // Backfill: if fewer than limit products have sales data, fill with random feed products
    if (productIds.length < limit) {
      const feedProducts = await knex(tableNames.catalogueFeed)
        .select('productId')
        .distinct()
        .whereNot('productId', 0)
        .whereNotIn('productId', productIds)
        .limit(limit - productIds.length);
      productIds = [...productIds, ...feedProducts.map(p => p.productId)];
    }

    if (productIds.length === 0) {
      return [];
    }

    const productsWithCategories = await fetchProductsWithBrandAndCategory(productIds);
    const enrichedProducts = await enrichProductList(productsWithCategories);

    // Sort by sales rank (maintain the order from topSellingProducts)
    const productIdOrder = new Map(productIds.map((id, index) => [id, index]));
    enrichedProducts.sort((a, b) => {
      const orderA = productIdOrder.get(a.id) ?? 999;
      const orderB = productIdOrder.get(b.id) ?? 999;
      return orderA - orderB;
    });

    // Cache with long TTL — featured products are stable
    setCache(cacheKey, enrichedProducts);
    return enrichedProducts;
  });
}

/**
 * Get top-level categories (categories without a parent) with product counts
 * Product counts include all products in subcategories
 */
export async function getTopLevelCategories(): Promise<(Category & { productCount: number })[]> {
  const cacheKey = 'topLevelCategories';
  const cached = getCachedLong<(Category & { productCount: number })[]>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<(Category & { productCount: number })[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    const result = await _buildTopLevelCategories();
    setCache(cacheKey, result);
    return result;
  });
}

async function _buildTopLevelCategories(): Promise<(Category & { productCount: number })[]> {
  // Get all categories to build hierarchy
  const allCategories = await knex(tableNames.channelCategories)
    .select('*')
    .orderBy('categoryName', 'asc');

  // Find root categories (deduplicate by name, prefer lowest ID — the original with products)
  const rootsByName = new Map<string, Category>();
  for (const cat of allCategories) {
    if (cat.parentCategoryId === null) {
      const existing = rootsByName.get(cat.categoryName);
      if (!existing || cat.id < existing.id) {
        rootsByName.set(cat.categoryName, cat);
      }
    }
  }
  const topLevelRoots = Array.from(rootsByName.values());

  if (topLevelRoots.length === 0) {
    return [];
  }

  // Build a map of parent -> children for efficient lookup
  const childrenMap = new Map<number, number[]>();
  for (const cat of allCategories) {
    if (cat.parentCategoryId !== null) {
      const children = childrenMap.get(cat.parentCategoryId) || [];
      children.push(cat.id);
      childrenMap.set(cat.parentCategoryId, children);
    }
  }

  // Function to get all descendant category IDs (including self)
  const getAllDescendantIds = (categoryId: number): number[] => {
    const result = [categoryId];
    const children = childrenMap.get(categoryId) || [];
    for (const childId of children) {
      result.push(...getAllDescendantIds(childId));
    }
    return result;
  };

  // For each root, get all category IDs (self + descendants)
  const rootToDescendants = new Map<number, number[]>();
  for (const root of topLevelRoots) {
    rootToDescendants.set(root.id, getAllDescendantIds(root.id));
  }

  // Get all descendant category IDs across all roots
  const allDescendantIds = [...new Set(
    Array.from(rootToDescendants.values()).flat()
  )];

  // Get product counts per category (for all descendants)
  let countQuery = knex(tableNames.storeProductCategories)
    .select(
      `${tableNames.storeProductCategories}.channelCategoryId`,
      knex.raw('COUNT(DISTINCT store_products.id) as count')
    )
    .join(
      tableNames.storeProducts,
      `${tableNames.storeProductCategories}.storeProductId`,
      `${tableNames.storeProducts}.id`
    )
    .join(
      tableNames.stores,
      `${tableNames.storeProducts}.storeId`,
      `${tableNames.stores}.id`
    )
    .where(`${tableNames.stores}.companyId`, STOREFRONT_COMPANY_ID)
    .whereNull(`${tableNames.storeProductCategories}.deletedAt`)
    .whereNull(`${tableNames.storeProducts}.deactivatedAt`)
    .whereIn(`${tableNames.storeProductCategories}.channelCategoryId`, allDescendantIds);

  if (STOREFRONT_STORE_ID) {
    countQuery = countQuery.where(`${tableNames.storeProducts}.storeId`, STOREFRONT_STORE_ID);
  }

  const productCounts = await countQuery.groupBy(`${tableNames.storeProductCategories}.channelCategoryId`);

  // Build count map
  const countMap = new Map<number, number>();
  for (const pc of productCounts) {
    countMap.set(Number(pc.channelCategoryId), Number(pc.count) || 0);
  }

  // Calculate total count for each root (sum of all descendants)
  const results: (Category & { productCount: number })[] = [];
  for (const root of topLevelRoots) {
    const descendantIds = rootToDescendants.get(root.id) || [root.id];
    let totalCount = 0;
    for (const catId of descendantIds) {
      totalCount += countMap.get(catId) || 0;
    }
    results.push({
      ...root,
      productCount: totalCount,
    });
  }

  // Sort by name
  results.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

  return results;
}

/**
 * Get hierarchical category tree for the storefront
 * Returns nested categories that have products from the specified company/store
 */
export async function getCategoryTreeForStorefront(): Promise<CategoryWithChildren[]> {
  // Check cache first (category tree is very stable, use long TTL)
  const cacheKey = 'categoryTree';
  const cached = getCachedLong<CategoryWithChildren[]>(cacheKey);
  if (cached) return cached;

  // Coalesce concurrent requests — all callers share one in-flight query
  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<CategoryWithChildren[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    return _buildCategoryTree();
  });
}

async function _buildCategoryTree(): Promise<CategoryWithChildren[]> {
  const cacheKey = 'categoryTree';

  // Get all categories first to build lookup (filtered by company to exclude unrelated categories)
  const allCategories = await knex(tableNames.channelCategories)
    .select('*')
    .where('companyId', STOREFRONT_COMPANY_ID)
    .orderBy('categoryName', 'asc');

  // Find ALL root category IDs (deduplicate by name, prefer lowest ID — the original with products)
  const rootIds = new Set<number>();
  const rootCandidates = new Map<string, number>(); // name -> lowest ID

  for (const cat of allCategories) {
    if (cat.parentCategoryId === null) {
      const existing = rootCandidates.get(cat.categoryName);
      if (existing === undefined || cat.id < existing) {
        rootCandidates.set(cat.categoryName, cat.id);
      }
    }
  }
  for (const id of rootCandidates.values()) {
    rootIds.add(id);
  }

  // Find all category IDs (roots + descendants)
  const allCategoryIds = new Set<number>(rootIds);
  const findDescendants = (parentId: number) => {
    for (const cat of allCategories) {
      if (cat.parentCategoryId === parentId && !allCategoryIds.has(cat.id)) {
        allCategoryIds.add(cat.id);
        findDescendants(cat.id);
      }
    }
  };
  for (const rootId of rootIds) {
    findDescendants(rootId);
  }

  if (allCategoryIds.size === 0) {
    return [];
  }

  // -- Sibling deduplication: merge same-named children within each parent --
  // Groups non-root siblings by (parentCategoryId, normalizedName); keeps lowest ID as primary.
  const siblingGroups = new Map<string, Array<{ id: number; parentCategoryId: number | null; categoryName: string }>>();
  for (const cat of allCategories) {
    if (!allCategoryIds.has(cat.id)) continue;
    if (cat.parentCategoryId === null) continue; // roots handled by existing dedup above
    const key = `${cat.parentCategoryId}::${normalizeCategoryName(cat.categoryName)}`;
    if (!siblingGroups.has(key)) siblingGroups.set(key, []);
    siblingGroups.get(key)!.push(cat);
  }

  const mergedIntoMap = new Map<number, number>(); // secondary ID → primary ID
  const mergedIdsMap = new Map<number, number[]>(); // primary ID → all IDs (including self)

  for (const group of siblingGroups.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => a.id - b.id);
    const primary = sorted[0]!;
    const allMergedIds = sorted.map(c => c.id);
    mergedIdsMap.set(primary.id, allMergedIds);
    for (const secondary of sorted.slice(1)) {
      mergedIntoMap.set(secondary.id, primary.id);
    }
  }

  // Get all (productId, categoryId) pairs for products with valid pricing
  // This allows us to count DISTINCT products per category tree (not sum counts)
  // JOIN catalogue_feed instead of whereIn(all IDs) for better query performance
  let productCategoryQuery = knex(tableNames.storeProductCategories)
    .select(
      `${tableNames.storeProductCategories}.channelCategoryId`,
      `${tableNames.storeProducts}.id as productId`
    )
    .join(
      tableNames.storeProducts,
      `${tableNames.storeProductCategories}.storeProductId`,
      `${tableNames.storeProducts}.id`
    )
    .join(tableNames.catalogueFeed, `${tableNames.catalogueFeed}.productId`, `${tableNames.storeProducts}.id`)
    .whereNull(`${tableNames.storeProductCategories}.deletedAt`)
    .whereNull(`${tableNames.storeProducts}.deactivatedAt`)
    .whereIn(`${tableNames.storeProductCategories}.channelCategoryId`, Array.from(allCategoryIds))
    // Only count products with valid pricing data
    .whereExists(function () {
      this.select(knex.raw('1'))
        .from(`${tableNames.variations} as price_var`)
        .join(
          tableNames.manufacturerSuppliers,
          'price_var.id',
          `${tableNames.manufacturerSuppliers}.variationId`
        )
        .whereRaw(`price_var."productId" = ${tableNames.storeProducts}.id`)
        .whereNull(`${tableNames.manufacturerSuppliers}.deletedAt`)
        .whereNull('price_var.deletedAt')
        .where(`${tableNames.manufacturerSuppliers}.cost`, '>', 0)
        .where(`${tableNames.manufacturerSuppliers}.quantity`, '>', 0)
        .where(function () {
          this.whereNotNull(`${tableNames.manufacturerSuppliers}.estimatedShipping`)
            .orWhereNotNull(`${tableNames.manufacturerSuppliers}.shippingCost`);
        });
    });

  if (STOREFRONT_STORE_ID) {
    productCategoryQuery = productCategoryQuery.where(`${tableNames.storeProducts}.storeId`, STOREFRONT_STORE_ID);
  }

  const productCategoryPairs = await productCategoryQuery;

  // Build a map of categoryId -> Set of productIds
  // Remap secondary category IDs to their primary to merge duplicate siblings.
  const categoryProductsMap = new Map<number, Set<number>>();
  for (const pair of productCategoryPairs) {
    const rawCatId = Number(pair.channelCategoryId);
    const catId = mergedIntoMap.get(rawCatId) ?? rawCatId;
    const prodId = Number(pair.productId);
    if (!categoryProductsMap.has(catId)) {
      categoryProductsMap.set(catId, new Set());
    }
    categoryProductsMap.get(catId)!.add(prodId);
  }

  // Build a map of parent -> children for descendant calculation.
  // Skip secondary categories; reparent any child whose parent is secondary to its primary.
  const childrenMap = new Map<number, number[]>();
  for (const cat of allCategories) {
    if (!cat.parentCategoryId || !allCategoryIds.has(cat.id)) continue;
    if (mergedIntoMap.has(cat.id)) continue; // skip secondaries
    const effectiveParentId = mergedIntoMap.get(cat.parentCategoryId) ?? cat.parentCategoryId;
    const children = childrenMap.get(effectiveParentId) || [];
    children.push(cat.id);
    childrenMap.set(effectiveParentId, children);
  }

  // Function to get all descendant category IDs (including self)
  const getDescendantIds = (catId: number): number[] => {
    const result = [catId];
    const children = childrenMap.get(catId) || [];
    for (const childId of children) {
      result.push(...getDescendantIds(childId));
    }
    return result;
  };

  // Calculate DISTINCT product count for each category tree
  const countMap = new Map<number, number>();
  for (const catId of allCategoryIds) {
    const descendantIds = getDescendantIds(catId);
    const allProducts = new Set<number>();
    for (const descId of descendantIds) {
      const products = categoryProductsMap.get(descId);
      if (products) {
        for (const prodId of products) {
          allProducts.add(prodId);
        }
      }
    }
    countMap.set(catId, allProducts.size);
  }

  // Build tree structure
  const categoryMap = new Map<number, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // First pass: create all category objects (skip secondary merged categories)
  for (const cat of allCategories) {
    if (!allCategoryIds.has(cat.id)) continue;
    if (mergedIntoMap.has(cat.id)) continue; // skip secondaries
    const categoryWithChildren: CategoryWithChildren = {
      ...cat,
      children: [],
      productCount: countMap.get(cat.id) || 0,
      mergedCategoryIds: mergedIdsMap.get(cat.id) ?? [cat.id],
    };
    categoryMap.set(cat.id, categoryWithChildren);
  }

  // Second pass: build hierarchy (skip secondaries; reparent via effective parent)
  for (const cat of allCategories) {
    if (!allCategoryIds.has(cat.id)) continue;
    if (mergedIntoMap.has(cat.id)) continue; // skip secondaries

    const categoryWithChildren = categoryMap.get(cat.id)!;
    const effectiveParentId = cat.parentCategoryId != null
      ? (mergedIntoMap.get(cat.parentCategoryId) ?? cat.parentCategoryId)
      : null;

    if (effectiveParentId === null || !allCategoryIds.has(effectiveParentId)) {
      // Root category or parent not in set
      rootCategories.push(categoryWithChildren);
    } else {
      const parent = categoryMap.get(effectiveParentId);
      if (parent) {
        parent.children.push(categoryWithChildren);
      } else {
        rootCategories.push(categoryWithChildren);
      }
    }
  }

  // Sort children by name
  const sortChildren = (categories: CategoryWithChildren[]) => {
    categories.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    for (const cat of categories) {
      if (cat.children.length > 0) {
        sortChildren(cat.children);
      }
    }
  };

  sortChildren(rootCategories);

  // Note: Product counts are already calculated as DISTINCT products per category tree
  // (including all descendants) in the countMap above, so no aggregation needed here

  // FALLBACK: If all product counts are 0 (store_product_categories empty),
  // use keyword-based categories derived from product names in the catalogue feed.
  const totalProducts = rootCategories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);
  if (totalProducts === 0) {
    const fallbackTree = await _buildFallbackCategoryTree();
    if (fallbackTree.length > 0) {
      setCache(cacheKey, fallbackTree);
      return fallbackTree;
    }
  }

  // Cache the result
  setCache(cacheKey, rootCategories);
  return rootCategories;
}

/**
 * Build a fallback category tree using keyword matching on product names.
 * Used when store_product_categories has no rows for this store.
 */
async function _buildFallbackCategoryTree(): Promise<CategoryWithChildren[]> {
  // Fetch all product names from the catalogue feed
  let query = knex(tableNames.storeProducts)
    .select(`${tableNames.storeProducts}.id`, `${tableNames.storeProducts}.name`)
    .join(`${tableNames.catalogueFeed} as cf`, 'cf.productId', `${tableNames.storeProducts}.id`)
    .whereNull(`${tableNames.storeProducts}.deactivatedAt`);

  if (STOREFRONT_STORE_ID) {
    query = query.where(`${tableNames.storeProducts}.storeId`, STOREFRONT_STORE_ID);
  }

  const products = await query;

  // Match each product to fallback categories
  const categoryCounts = new Map<number, number>();
  for (const cat of FALLBACK_CATEGORIES) {
    categoryCounts.set(cat.id, 0);
  }

  for (const product of products) {
    const name = product.name || '';
    for (const cat of FALLBACK_CATEGORIES) {
      if (cat.keywords.test(name)) {
        categoryCounts.set(cat.id, (categoryCounts.get(cat.id) || 0) + 1);
      }
    }
  }

  // Build CategoryWithChildren objects for categories that have products
  const result: CategoryWithChildren[] = [];
  for (const cat of FALLBACK_CATEGORIES) {
    const count = categoryCounts.get(cat.id) || 0;
    if (count === 0) continue;

    result.push({
      id: cat.id,
      categoryName: cat.categoryName,
      parentCategoryId: null,
      amazonCategoryId: null,
      walmartCategoryId: null,
      wooCommerceCategoryId: null,
      ebayCategoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
      productCount: count,
      mergedCategoryIds: [cat.id],
    });
  }

  result.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  return result;
}


/**
 * Get nested category tree for mega menu navigation
 */
export async function getNestedCategoryTree(): Promise<CategoryWithChildren[]> {
  // Get all categories (filtered by company)
  const allCategories = await knex(tableNames.channelCategories)
    .select('*')
    .where('companyId', STOREFRONT_COMPANY_ID)
    .orderBy('categoryName', 'asc');

  // Get product counts per category
  const productCounts = await knex(tableNames.storeProductCategories)
    .select('channelCategoryId')
    .count('* as count')
    .whereNull('deletedAt')
    .groupBy('channelCategoryId');

  const countMap = new Map<number, number>();
  for (const pc of productCounts) {
    countMap.set(Number(pc.channelCategoryId), Number(pc.count) || 0);
  }

  // Build tree structure
  const categoryMap = new Map<number, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // First pass: create all category objects
  for (const cat of allCategories) {
    const categoryWithChildren: CategoryWithChildren = {
      ...cat,
      children: [],
      productCount: countMap.get(cat.id) || 0,
    };
    categoryMap.set(cat.id, categoryWithChildren);
  }

  // Second pass: build hierarchy
  for (const cat of allCategories) {
    const categoryWithChildren = categoryMap.get(cat.id)!;

    if (cat.parentCategoryId === null) {
      rootCategories.push(categoryWithChildren);
    } else {
      const parent = categoryMap.get(cat.parentCategoryId);
      if (parent) {
        parent.children.push(categoryWithChildren);
      } else {
        // Orphaned category - add to root
        rootCategories.push(categoryWithChildren);
      }
    }
  }

  // Sort children by name
  const sortChildren = (categories: CategoryWithChildren[]) => {
    categories.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    for (const cat of categories) {
      if (cat.children.length > 0) {
        sortChildren(cat.children);
      }
    }
  };

  sortChildren(rootCategories);

  return rootCategories;
}

/**
 * Helper function to create URL-safe slugs
 */
function slugify(text: string | null | undefined): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ============================================
// Product Functions
// ============================================

// (Fitment/YMM functions removed - Alpha Munitions does not use vehicle fitment)

interface GetProductsFilters {
  categoryId?: number;
  categoryIds?: number[]; // For filtering by multiple categories (e.g., parent + all descendants)
  brandId?: number;
  brandIds?: number[]; // For filtering by multiple brands
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

/**
 * Get the price range for products matching the given filters.
 * Returns min/max in dollars (not cents).
 *
 * Uses the pre-computed priceMap from _computeProductPriceData() — zero DB cost per call.
 * For category/brand/search filters, runs a lightweight SQL query (no variation/MS joins)
 * to get matching product IDs, then intersects with the cached price map in JS.
 */
export async function getPriceRange(
  filters: Omit<GetProductsFilters, 'minPrice' | 'maxPrice'> = {}
): Promise<{ min: number; max: number }> {
  const { categoryId, categoryIds, brandId, brandIds, search, inStock: _inStock, onSale, packAvailable, productIds } = filters;

  const filterKey = JSON.stringify({ categoryId, categoryIds, brandId, brandIds, search, onSale, packAvailable, productIds: productIds?.slice(0, 10) });
  const cacheKey = `priceRange:${filterKey}`;
  const cached = getCachedLong<{ min: number; max: number }>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<{ min: number; max: number }>(cacheKey);
    if (cachedAgain) return cachedAgain;

    // Get the pre-computed price map — only hits DB once per 5-min TTL window
    const priceMap = await getProductPriceMap();
    if (priceMap.size === 0) {
      const fallback = { min: 0, max: 10000 };
      setCache(cacheKey, fallback);
      return fallback;
    }

    // Build set of allowed product IDs based on filters
    let filteredIds: Set<number> | null = null;

    if (productIds && productIds.length > 0) {
      // Fitment search: product IDs already known — filter priceMap directly, zero DB cost
      filteredIds = new Set(productIds);
    } else if (categoryId || categoryIds?.length || brandId || brandIds?.length || search || packAvailable) {
      // Lightweight SQL — no variation/MS joins (pricing is handled by cached priceMap)
      const allCategoryIds = categoryIds ?? (categoryId ? [categoryId] : null);
      const allBrandIds = brandIds ?? (brandId ? [brandId] : null);

      let idsQuery = knex(`${tableNames.storeProducts} as sp`)
        .select('sp.id')
        .distinct()
        .join(`${tableNames.catalogueFeed} as cf`, 'cf.productId', 'sp.id')
        .whereNull('sp.deactivatedAt');

      if (STOREFRONT_STORE_ID) {
        idsQuery = idsQuery.where('sp.storeId', STOREFRONT_STORE_ID);
      }

      if (allCategoryIds && allCategoryIds.length > 0) {
        const fallbackIds = allCategoryIds.filter(id => id < 0);
        const realIds = allCategoryIds.filter(id => id > 0);

        if (fallbackIds.length > 0) {
          // Fallback categories: match product names with keyword regex
          const pattern = getFallbackCategoryPattern(fallbackIds);
          if (pattern) {
            idsQuery = idsQuery.whereRaw('sp.name ~* ?', [pattern]);
          }
        } else if (realIds.length > 0) {
          idsQuery = idsQuery.whereExists(function () {
            this.select(knex.raw('1'))
              .from(`${tableNames.storeProductCategories} as spc`)
              .whereRaw('"spc"."storeProductId" = sp.id')
              .whereIn('spc.channelCategoryId', realIds)
              .whereNull('spc.deletedAt');
          });
        }
      }

      if (allBrandIds && allBrandIds.length > 0) {
        idsQuery = idsQuery.whereExists(function () {
          this.select(knex.raw('1'))
            .from(`${tableNames.variations} as v`)
            .whereRaw('"v"."productId" = sp.id')
            .whereIn('v.brandId', allBrandIds)
            .whereNull('v.deletedAt');
        });
      }

      if (search) {
        const searchTerm = `%${search.toLowerCase()}%`;
        idsQuery = idsQuery.whereRaw('LOWER(sp.name) LIKE ?', [searchTerm]);
      }

      if (packAvailable) {
        idsQuery = idsQuery.whereExists(function () {
          this.select(knex.raw('1'))
            .from(`${tableNames.variations} as v`)
            .whereRaw('"v"."productId" = sp.id')
            .whereNull('v.deletedAt')
            .whereNotNull('v.packCount')
            .where('v.packCount', '>', 0);
        });
      }

      const rows = await idsQuery;
      filteredIds = new Set(rows.map((r: { id: number }) => r.id));
    }

    // Apply onSale filter using cached set (zero DB cost)
    let onSaleSet: Set<number> | null = null;
    if (onSale) {
      onSaleSet = await getOnSaleProductIds();
    }

    // Compute min/max in JS — iterates cached priceMap, no DB query needed
    let min = Infinity, max = -Infinity;
    for (const [id, price] of priceMap) {
      if (filteredIds && !filteredIds.has(id)) continue;
      if (onSaleSet && !onSaleSet.has(id)) continue;
      if (price < min) min = price;
      if (price > max) max = price;
    }

    const priceRange = {
      min: min === Infinity ? 0 : Math.floor(min / 100),
      max: max === -Infinity ? 10000 : Math.ceil(max / 100),
    };

    console.log(`[getPriceRange] $${priceRange.min}–$${priceRange.max} (map: ${priceMap.size}, filtered: ${filteredIds?.size ?? priceMap.size})`);
    setCache(cacheKey, priceRange);
    return priceRange;
  });
}

/**
 * Get products with filtering, pagination, and sorting
 */
export async function getProducts(
  filters: GetProductsFilters = {},
  sortBy: string = 'name_asc',
  pagination: GetProductsPagination = {}
): Promise<{
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
}> {
  const { categoryId, categoryIds, brandId, brandIds, search, minPrice, maxPrice, inStock, onSale, packAvailable, productIds } = filters;
  const { page = 1, pageSize = 24 } = pagination;

  // Cache search results — the ID query + enrichment is the main bottleneck for search.
  // Only cache "simple" searches (keyword only, no additional filters) to keep cache keys predictable.
  const isSimpleSearch = search && !categoryId && (!categoryIds || categoryIds.length === 0)
    && !brandId && (!brandIds || brandIds.length === 0)
    && !minPrice && !maxPrice && !inStock && !onSale && !packAvailable
    && (!productIds || productIds.length === 0);
  if (isSimpleSearch) {
    const searchCacheKey = `searchResults:${search!.trim().toLowerCase()}:${sortBy}:${page}:${pageSize}`;
    type SearchResult = { products: ProductListItem[]; totalCount: number; totalPages: number };
    const cachedResult = getCached<SearchResult>(searchCacheKey, CACHE_TTL_SEARCH_MS);
    if (cachedResult) return cachedResult;

    // Coalesce concurrent identical searches (e.g. prefetch + click arriving together)
    return coalesceRequest(searchCacheKey, async () => {
      const cachedAgain = getCached<SearchResult>(searchCacheKey, CACHE_TTL_SEARCH_MS);
      if (cachedAgain) return cachedAgain;

      const result = await getProductsUncached(filters, sortBy, pagination);
      setCache(searchCacheKey, result);
      return result;
    });
  }

  return getProductsUncached(filters, sortBy, pagination);
}

async function getProductsUncached(
  filters: GetProductsFilters = {},
  sortBy: string = 'name_asc',
  pagination: GetProductsPagination = {}
): Promise<{
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
}> {
  const { categoryId, categoryIds, brandId, brandIds, search, minPrice, maxPrice, inStock, onSale, packAvailable, productIds } = filters;
  const { page = 1, pageSize = 24 } = pagination;

  const offset = (page - 1) * pageSize;

  // Validate and sanitize search parameter to prevent SQL injection
  let sanitizedSearch: string | null = null;
  if (search) {
    const trimmedSearch = search.trim();

    // Reject searches that are too short or too long
    if (trimmedSearch.length < MIN_SEARCH_LENGTH) {
      return { products: [], totalCount: 0, totalPages: 0 };
    }
    if (trimmedSearch.length > MAX_SEARCH_LENGTH) {
      return { products: [], totalCount: 0, totalPages: 0 };
    }

    // Escape special LIKE characters to prevent wildcard abuse
    sanitizedSearch = escapeLikePattern(trimmedSearch);
  }

  // Step 1: Check catalogue feed is non-empty (cached)
  const feedProductIdSet = await getCatalogueFeedProductIds();
  if (feedProductIdSet.size === 0) {
    return { products: [], totalCount: 0, totalPages: 0 };
  }

  // Step 2: Build a query to get UNIQUE product IDs that match filters
  // This prevents duplicates from category/variation joins
  // Include name and createdAt for sorting (required by PostgreSQL DISTINCT)
  // JOIN catalogue_feed instead of whereIn(all IDs) — much faster for large catalogues
  let idsQuery = knex(tableNames.storeProducts)
    .select(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      `${tableNames.storeProducts}.createdAt`
    )
    .distinct()
    .join(`${tableNames.catalogueFeed} as cf`, `cf.productId`, `${tableNames.storeProducts}.id`)
    // Exclude deactivated products (must match getCategoryTreeForStorefront filter)
    .whereNull(`${tableNames.storeProducts}.deactivatedAt`);

  // Pricing check: correlated EXISTS subquery (same as midnightauto pattern).
  // PostgreSQL short-circuits on first matching supplier row per product — much faster
  // than a derived table JOIN that must materialise ALL priced product IDs upfront.
  idsQuery = idsQuery.whereExists(function () {
    this.select(knex.raw('1'))
      .from(tableNames.variations + ' as price_var')
      .join(
        tableNames.manufacturerSuppliers,
        'price_var.id',
        `${tableNames.manufacturerSuppliers}.variationId`
      )
      .whereRaw(`price_var."productId" = ${tableNames.storeProducts}.id`)
      .whereNull(`${tableNames.manufacturerSuppliers}.deletedAt`)
      .whereNull('price_var.deletedAt')
      .where(`${tableNames.manufacturerSuppliers}.cost`, '>', 0)
      .where(`${tableNames.manufacturerSuppliers}.quantity`, '>', 0)
      .where(function () {
        this.whereNotNull(`${tableNames.manufacturerSuppliers}.estimatedShipping`)
          .orWhereNotNull(`${tableNames.manufacturerSuppliers}.shippingCost`);
      });
  });

  // Filter by store if STOREFRONT_STORE_ID is set (must match getCategoryTreeForStorefront filter)
  if (STOREFRONT_STORE_ID) {
    idsQuery = idsQuery.where(`${tableNames.storeProducts}.storeId`, STOREFRONT_STORE_ID);
  }

  // Brand filtering uses EXISTS subqueries (not LEFT JOIN) to avoid row multiplication
  // LEFT JOIN causes N rows per product (1 per variation), making DISTINCT + ORDER BY + LIMIT slow

  // Check if using fallback categories (negative IDs = keyword-based matching)
  const isFallbackCategory = categoryIds?.some(id => id < 0) || (categoryId != null && categoryId < 0);

  // Join categories if we need to filter by them OR if we're searching (to search category names)
  // Skip category join for fallback categories — they use product name regex instead
  const needsCategoryJoin = !isFallbackCategory && !sanitizedSearch && ((categoryIds && categoryIds.length > 0) || !!categoryId);
  if (needsCategoryJoin) {
    idsQuery = idsQuery
      .leftJoin(
        tableNames.storeProductCategories,
        `${tableNames.storeProducts}.id`,
        `${tableNames.storeProductCategories}.storeProductId`
      )
      .leftJoin(
        tableNames.channelCategories,
        `${tableNames.storeProductCategories}.channelCategoryId`,
        `${tableNames.channelCategories}.id`
      );

    // Only apply deletedAt filter when filtering by category (not just searching)
    if ((categoryIds && categoryIds.length > 0) || categoryId) {
      idsQuery = idsQuery.whereNull(`${tableNames.storeProductCategories}.deletedAt`);
    }
  }

  // Fallback category filtering: match product names with keyword regex
  if (isFallbackCategory) {
    const fallbackIds = categoryIds?.filter(id => id < 0) ?? (categoryId != null && categoryId < 0 ? [categoryId] : []);
    const pattern = getFallbackCategoryPattern(fallbackIds);
    if (pattern) {
      idsQuery = idsQuery.whereRaw(`${tableNames.storeProducts}.name ~* ?`, [pattern]);
    }
  }

  // Apply filters to the IDs query
  // When search is active, LEFT JOINs are skipped — use EXISTS subqueries instead
  if (sanitizedSearch) {
    // Category filter via EXISTS (no LEFT JOIN available during search)
    // Skip for fallback categories (already handled above)
    if (!isFallbackCategory && categoryIds && categoryIds.length > 0) {
      idsQuery = idsQuery.whereExists(function () {
        this.select(knex.raw('1'))
          .from(`${tableNames.storeProductCategories} as spc_f`)
          .whereRaw(`spc_f."storeProductId" = ${tableNames.storeProducts}.id`)
          .whereNull('spc_f.deletedAt')
          .whereIn('spc_f.channelCategoryId', categoryIds);
      });
    } else if (!isFallbackCategory && categoryId) {
      idsQuery = idsQuery.whereExists(function () {
        this.select(knex.raw('1'))
          .from(`${tableNames.storeProductCategories} as spc_f`)
          .whereRaw(`spc_f."storeProductId" = ${tableNames.storeProducts}.id`)
          .whereNull('spc_f.deletedAt')
          .where('spc_f.channelCategoryId', categoryId);
      });
    }

    // Brand filter via EXISTS (no LEFT JOIN available during search)
    if (brandIds && brandIds.length > 0) {
      idsQuery = idsQuery.whereExists(function () {
        this.select(knex.raw('1'))
          .from(`${tableNames.variations} as br_var`)
          .whereRaw(`br_var."productId" = ${tableNames.storeProducts}.id`)
          .whereNull('br_var.deletedAt')
          .whereIn('br_var.brandId', brandIds);
      });
    } else if (brandId) {
      idsQuery = idsQuery.whereExists(function () {
        this.select(knex.raw('1'))
          .from(`${tableNames.variations} as br_var`)
          .whereRaw(`br_var."productId" = ${tableNames.storeProducts}.id`)
          .whereNull('br_var.deletedAt')
          .where('br_var.brandId', brandId);
      });
    }

    // Search condition: use EXISTS for brand/sku/category matches (no row multiplication)
    const trimmedSearch = search!.trim();
    idsQuery = idsQuery.where(function () {
      this
        // Full-text search on product name + description
        .whereRaw(
          `to_tsvector('english', coalesce(${tableNames.storeProducts}.name, '') || ' ' || coalesce(${tableNames.storeProducts}.description, '')) @@ plainto_tsquery('english', ?)`,
          [trimmedSearch]
        )
        // Brand name match via EXISTS
        .orWhereExists(function () {
          this.select(knex.raw('1'))
            .from(`${tableNames.variations} as sv`)
            .join(`${tableNames.brands} as sb`, 'sv.brandId', 'sb.id')
            .whereRaw(`sv."productId" = ${tableNames.storeProducts}.id`)
            .whereNull('sv.deletedAt')
            .whereILike('sb.brand', `%${sanitizedSearch}%`);
        })
        // SKU/manufacturer number match via EXISTS
        .orWhereExists(function () {
          this.select(knex.raw('1'))
            .from(`${tableNames.variations} as mv`)
            .whereRaw(`mv."productId" = ${tableNames.storeProducts}.id`)
            .whereNull('mv.deletedAt')
            .whereILike('mv.manufacturerNo', `%${sanitizedSearch}%`);
        })
        // Category name match via EXISTS
        .orWhereExists(function () {
          this.select(knex.raw('1'))
            .from(`${tableNames.storeProductCategories} as spc`)
            .join(`${tableNames.channelCategories} as cc`, 'spc.channelCategoryId', 'cc.id')
            .whereRaw(`spc."storeProductId" = ${tableNames.storeProducts}.id`)
            .whereILike('cc.categoryName', `%${sanitizedSearch}%`);
        });
    });
  } else {
    // Non-search path: use direct column references from LEFT JOINs
    // Skip for fallback categories (already handled above via regex)
    if (!isFallbackCategory && categoryIds && categoryIds.length > 0) {
      idsQuery = idsQuery.whereIn(`${tableNames.storeProductCategories}.channelCategoryId`, categoryIds);
    } else if (!isFallbackCategory && categoryId) {
      idsQuery = idsQuery.where(`${tableNames.storeProductCategories}.channelCategoryId`, categoryId);
    }

    if (brandIds && brandIds.length > 0) {
      idsQuery = idsQuery.whereExists(function () {
        this.select(knex.raw('1'))
          .from(`${tableNames.variations} as br_var`)
          .whereRaw(`br_var."productId" = ${tableNames.storeProducts}.id`)
          .whereNull('br_var.deletedAt')
          .whereIn('br_var.brandId', brandIds);
      });
    } else if (brandId) {
      idsQuery = idsQuery.whereExists(function () {
        this.select(knex.raw('1'))
          .from(`${tableNames.variations} as br_var`)
          .whereRaw(`br_var."productId" = ${tableNames.storeProducts}.id`)
          .whereNull('br_var.deletedAt')
          .where('br_var.brandId', brandId);
      });
    }
  }

  // Now build the main query without category joins (to avoid duplicates)
  // Use MIN() aggregates for brand fields to ensure one row per product
  let query = knex(tableNames.storeProducts)
    .select(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      `${tableNames.storeProducts}.description`,
      knex.raw(`MIN(${tableNames.brands}.brand) as "brandName"`),
      knex.raw(`MIN(${tableNames.variations}."brandId") as "brandId"`)
    )
    .leftJoin(tableNames.variations, function () {
      this.on(`${tableNames.storeProducts}.id`, '=', `${tableNames.variations}.productId`)
        .andOnNull(`${tableNames.variations}.deletedAt`);
    })
    .leftJoin(
      tableNames.brands,
      `${tableNames.variations}.brandId`,
      `${tableNames.brands}.id`
    );

  // Apply productIds filter to idsQuery
  if (productIds && productIds.length > 0) {
    idsQuery = idsQuery.whereIn(`${tableNames.storeProducts}.id`, productIds);
  }

  // Apply in-stock filter to idsQuery
  if (inStock) {
    idsQuery = idsQuery.whereExists(function () {
      this.select(knex.raw('1'))
        .from(tableNames.variations + ' as inv_var')
        .join(
          tableNames.manufacturerSuppliers,
          'inv_var.id',
          `${tableNames.manufacturerSuppliers}.variationId`
        )
        .whereRaw(`inv_var."productId" = ${tableNames.storeProducts}.id`)
        .whereNull(`${tableNames.manufacturerSuppliers}.deletedAt`)
        .whereNull('inv_var.deletedAt')
        .where(`${tableNames.manufacturerSuppliers}.quantity`, '>', 0);
    });
  }

  // Apply on-sale filter using pre-computed cached set (avoids 21+ second EXISTS subquery)
  if (onSale) {
    const onSaleIds = await getOnSaleProductIds();
    if (onSaleIds.size > 0) {
      idsQuery = idsQuery.whereIn(`${tableNames.storeProducts}.id`, Array.from(onSaleIds));
    } else {
      return { products: [], totalCount: 0, totalPages: 0 };
    }
  }

  // Apply pack available filter to idsQuery
  if (packAvailable) {
    idsQuery = idsQuery.whereExists(function () {
      this.select(knex.raw('1'))
        .from('variations as v3')
        .whereRaw(`v3."productId" = ${tableNames.storeProducts}.id`)
        .whereNull('v3.deletedAt')
        .whereNotNull('v3.packCount')
        .where('v3.packCount', '>', 0);
    });
  }

  // Apply price filter to idsQuery
  // Filter by the MINIMUM calculated price of a product's variations
  // Price formula: GREATEST(MAP, CEIL((cost + shipping) * markup))
  // This must match the formula used in enrichProductList for consistency
  // Apply price filter using pre-computed cached price map (avoids expensive HAVING subquery)
  if (minPrice || maxPrice) {
    const priceMap = await getProductPriceMap();
    const filteredIds: number[] = [];
    for (const [productId, minPriceValue] of priceMap) {
      if (minPrice && minPriceValue < minPrice) continue;
      if (maxPrice && minPriceValue > maxPrice) continue;
      filteredIds.push(productId);
    }
    if (filteredIds.length > 0) {
      idsQuery = idsQuery.whereIn(`${tableNames.storeProducts}.id`, filteredIds);
    } else {
      return { products: [], totalCount: 0, totalPages: 0 };
    }
  }

  // Handle price sorting via cached priceMap (avoids expensive correlated subquery per row)
  if (sortBy === 'price_asc' || sortBy === 'price_desc') {
    const priceMap = await getProductPriceMap();

    // Get ALL matching product rows (id + name) without LIMIT/OFFSET
    let allRows: Array<{ id: number; name: string }>;
    try {
      allRows = await idsQuery;
    } catch (err) {
      console.error('[getProducts] IDs query failed (price sort):', err instanceof Error ? err.message : err);
      allRows = [];
    }

    // Sort in JS using cached priceMap — O(n log n), zero DB cost
    const fallback = sortBy === 'price_asc' ? Infinity : -Infinity;
    allRows.sort((a, b) => {
      const pa = priceMap.get(a.id) ?? fallback;
      const pb = priceMap.get(b.id) ?? fallback;
      const diff = sortBy === 'price_asc' ? pa - pb : pb - pa;
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });

    const totalCount = allRows.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const pageRows = allRows.slice(offset, offset + pageSize);
    const pageIds = pageRows.map(r => r.id);

    if (pageIds.length === 0) return { products: [], totalCount, totalPages };

    // Fetch full product details for the page IDs
    const pageProducts = await query
      .whereIn(`${tableNames.storeProducts}.id`, pageIds)
      .groupBy(
        `${tableNames.storeProducts}.id`,
        `${tableNames.storeProducts}.name`,
        `${tableNames.storeProducts}.description`
      )
      .orderByRaw(`${tableNames.storeProducts}.name ASC`);

    const enriched = await enrichProductList(pageProducts);

    // Re-order enriched products to match the price-sorted pageIds order
    const idOrder = new Map(pageIds.map((id, i) => [id, i]));
    enriched.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

    return { products: enriched, totalCount, totalPages };
  }

  // Apply sorting to idsQuery
  switch (sortBy) {
    case 'relevance':
      // Sort by full-text search relevance (only meaningful when search is active)
      if (sanitizedSearch) {
        const trimmedSearch = search!.trim();
        idsQuery = idsQuery
          .select(knex.raw(
            `ts_rank(to_tsvector('english', coalesce(${tableNames.storeProducts}.name, '') || ' ' || coalesce(${tableNames.storeProducts}.description, '')), plainto_tsquery('english', ?)) as search_rank`,
            [trimmedSearch]
          ))
          .orderByRaw(`search_rank DESC, ${tableNames.storeProducts}.name ASC`);
      } else {
        idsQuery = idsQuery.orderBy(`${tableNames.storeProducts}.name`, 'asc');
      }
      break;
    case 'name_desc':
      idsQuery = idsQuery.orderBy(`${tableNames.storeProducts}.name`, 'desc');
      break;
    case 'newest':
      idsQuery = idsQuery.orderBy(`${tableNames.storeProducts}.createdAt`, 'desc');
      break;
    case 'oldest':
      idsQuery = idsQuery.orderBy(`${tableNames.storeProducts}.createdAt`, 'asc');
      break;
    case 'best_sellers':
      // Sort by total quantity sold via a pre-aggregated derived table.
      // This computes the SUM once across all order_items, then joins the
      // result — much faster than a correlated subquery (per-row) or a
      // direct JOIN (row explosion).
      idsQuery = idsQuery
        .select(knex.raw('COALESCE(product_sales.total_sold, 0) as total_sold'))
        .leftJoin(
          knex.raw(`(
            SELECT v_sales."productId", SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN ${tableNames.variations} v_sales ON oi."variationId" = v_sales.id
            WHERE v_sales."deletedAt" IS NULL
            GROUP BY v_sales."productId"
          ) as product_sales ON product_sales."productId" = ${tableNames.storeProducts}.id`)
        )
        .orderBy('total_sold', 'desc')
        .orderBy(`${tableNames.storeProducts}.name`, 'asc');
      break;
    case 'top_rated':
      // Sort by average review rating via a LEFT JOIN on the review_aggregates table.
      // COALESCE(x, 0) puts products with no reviews at the bottom when ordering DESC.
      // Aliases are selected so they satisfy SELECT DISTINCT's ORDER BY constraint.
      idsQuery = idsQuery
        .select(knex.raw('COALESCE(ra."averageRating", 0) as avg_rating'))
        .select(knex.raw('COALESCE(ra."totalReviews", 0) as total_reviews'))
        .leftJoin(
          knex(tableNames.reviewAggregates)
            .select('productId', 'averageRating', 'totalReviews')
            .where('companyId', STOREFRONT_COMPANY_ID)
            .as('ra'),
          `${tableNames.storeProducts}.id`, 'ra.productId'
        )
        .orderBy('avg_rating', 'desc')
        .orderBy('total_reviews', 'desc')
        .orderBy(`${tableNames.storeProducts}.name`, 'asc');
      break;
    case 'name_asc':
    default:
      idsQuery = idsQuery.orderBy(`${tableNames.storeProducts}.name`, 'asc');
      break;
  }

  // Run count and paginated IDs queries in parallel — they're independent
  const [totalCount, paginatedIds] = await Promise.all([
    (async () => {
      try {
        // When search is active, the idsQuery carries LEFT JOINs on variations, brands,
        // store_product_categories, and channel_categories. These multiply rows (N variations
        // × M categories per product), forcing COUNT(DISTINCT) to materialise the entire
        // cross-product before deduplicating — which times out on broad terms like "Helmets".
        //
        // Fix: build a separate count query that replaces LEFT JOINs with EXISTS subqueries.
        // Each product is counted exactly once (no row multiplication), EXISTS short-circuits
        // on first match, and we use COUNT(*) instead of COUNT(DISTINCT).
        if (sanitizedSearch) {
          const trimmedSearch = search!.trim();
          let searchCountQuery = knex(tableNames.storeProducts)
            .countDistinct(`${tableNames.storeProducts}.id as count`)
            .join(`${tableNames.catalogueFeed} as cf`, `cf.productId`, `${tableNames.storeProducts}.id`)
            .whereNull(`${tableNames.storeProducts}.deactivatedAt`);

          // Pricing EXISTS (same as idsQuery)
          searchCountQuery = searchCountQuery.whereExists(function () {
            this.select(knex.raw('1'))
              .from(tableNames.variations + ' as price_var')
              .join(
                tableNames.manufacturerSuppliers,
                'price_var.id',
                `${tableNames.manufacturerSuppliers}.variationId`
              )
              .whereRaw(`price_var."productId" = ${tableNames.storeProducts}.id`)
              .whereNull(`${tableNames.manufacturerSuppliers}.deletedAt`)
              .whereNull('price_var.deletedAt')
              .where(`${tableNames.manufacturerSuppliers}.cost`, '>', 0)
              .where(`${tableNames.manufacturerSuppliers}.quantity`, '>', 0)
              .where(function () {
                this.whereNotNull(`${tableNames.manufacturerSuppliers}.estimatedShipping`)
                  .orWhereNotNull(`${tableNames.manufacturerSuppliers}.shippingCost`);
              });
          });

          // Store filter
          if (STOREFRONT_STORE_ID) {
            searchCountQuery = searchCountQuery.where(`${tableNames.storeProducts}.storeId`, STOREFRONT_STORE_ID);
          }

          // Category filter (direct WHERE, not EXISTS — these are explicit filter selections)
          if (categoryIds && categoryIds.length > 0) {
            searchCountQuery = searchCountQuery.whereExists(function () {
              this.select(knex.raw('1'))
                .from(`${tableNames.storeProductCategories} as spc_f`)
                .whereRaw(`spc_f."storeProductId" = ${tableNames.storeProducts}.id`)
                .whereNull('spc_f.deletedAt')
                .whereIn('spc_f.channelCategoryId', categoryIds);
            });
          } else if (categoryId) {
            searchCountQuery = searchCountQuery.whereExists(function () {
              this.select(knex.raw('1'))
                .from(`${tableNames.storeProductCategories} as spc_f`)
                .whereRaw(`spc_f."storeProductId" = ${tableNames.storeProducts}.id`)
                .whereNull('spc_f.deletedAt')
                .where('spc_f.channelCategoryId', categoryId);
            });
          }

          // Brand filter
          if (brandIds && brandIds.length > 0) {
            searchCountQuery = searchCountQuery.whereExists(function () {
              this.select(knex.raw('1'))
                .from(`${tableNames.variations} as br_var`)
                .whereRaw(`br_var."productId" = ${tableNames.storeProducts}.id`)
                .whereNull('br_var.deletedAt')
                .whereIn('br_var.brandId', brandIds);
            });
          } else if (brandId) {
            searchCountQuery = searchCountQuery.whereExists(function () {
              this.select(knex.raw('1'))
                .from(`${tableNames.variations} as br_var`)
                .whereRaw(`br_var."productId" = ${tableNames.storeProducts}.id`)
                .whereNull('br_var.deletedAt')
                .where('br_var.brandId', brandId);
            });
          }

          // Product IDs filter
          if (productIds && productIds.length > 0) {
            searchCountQuery = searchCountQuery.whereIn(`${tableNames.storeProducts}.id`, productIds);
          }

          // In-stock filter
          if (inStock) {
            searchCountQuery = searchCountQuery.whereExists(function () {
              this.select(knex.raw('1'))
                .from(tableNames.variations + ' as inv_var')
                .join(
                  tableNames.manufacturerSuppliers,
                  'inv_var.id',
                  `${tableNames.manufacturerSuppliers}.variationId`
                )
                .whereRaw(`inv_var."productId" = ${tableNames.storeProducts}.id`)
                .whereNull(`${tableNames.manufacturerSuppliers}.deletedAt`)
                .whereNull('inv_var.deletedAt')
                .where(`${tableNames.manufacturerSuppliers}.quantity`, '>', 0);
            });
          }

          // On-sale filter
          if (onSale) {
            const onSaleIds = await getOnSaleProductIds();
            if (onSaleIds.size > 0) {
              searchCountQuery = searchCountQuery.whereIn(`${tableNames.storeProducts}.id`, Array.from(onSaleIds));
            } else {
              return 0;
            }
          }

          // Pack available filter
          if (packAvailable) {
            searchCountQuery = searchCountQuery.whereExists(function () {
              this.select(knex.raw('1'))
                .from('variations as v3')
                .whereRaw(`v3."productId" = ${tableNames.storeProducts}.id`)
                .whereNull('v3.deletedAt')
                .whereNotNull('v3.packCount')
                .where('v3.packCount', '>', 0);
            });
          }

          // Price filter
          if (minPrice || maxPrice) {
            const priceMap = await getProductPriceMap();
            const filteredIds: number[] = [];
            for (const [productId, minPriceValue] of priceMap) {
              if (minPrice && minPriceValue < minPrice) continue;
              if (maxPrice && minPriceValue > maxPrice) continue;
              filteredIds.push(productId);
            }
            if (filteredIds.length > 0) {
              searchCountQuery = searchCountQuery.whereIn(`${tableNames.storeProducts}.id`, filteredIds);
            } else {
              return 0;
            }
          }

          // Search condition: use EXISTS for brand/sku/category matches instead of LEFT JOINs
          searchCountQuery = searchCountQuery.where(function () {
            this
              // Full-text search on product name + description
              .whereRaw(
                `to_tsvector('english', coalesce(${tableNames.storeProducts}.name, '') || ' ' || coalesce(${tableNames.storeProducts}.description, '')) @@ plainto_tsquery('english', ?)`,
                [trimmedSearch]
              )
              // Brand name match via EXISTS (no row multiplication)
              .orWhereExists(function () {
                this.select(knex.raw('1'))
                  .from(`${tableNames.variations} as sv`)
                  .join(`${tableNames.brands} as sb`, 'sv.brandId', 'sb.id')
                  .whereRaw(`sv."productId" = ${tableNames.storeProducts}.id`)
                  .whereNull('sv.deletedAt')
                  .whereILike('sb.brand', `%${sanitizedSearch}%`);
              })
              // SKU/manufacturer number match via EXISTS
              .orWhereExists(function () {
                this.select(knex.raw('1'))
                  .from(`${tableNames.variations} as mv`)
                  .whereRaw(`mv."productId" = ${tableNames.storeProducts}.id`)
                  .whereNull('mv.deletedAt')
                  .whereILike('mv.manufacturerNo', `%${sanitizedSearch}%`);
              })
              // Category name match via EXISTS
              .orWhereExists(function () {
                this.select(knex.raw('1'))
                  .from(`${tableNames.storeProductCategories} as spc`)
                  .join(`${tableNames.channelCategories} as cc`, 'spc.channelCategoryId', 'cc.id')
                  .whereRaw(`spc."storeProductId" = ${tableNames.storeProducts}.id`)
                  .whereILike('cc.categoryName', `%${sanitizedSearch}%`);
              });
          });

          const countResult = await searchCountQuery.first();
          return Number(countResult?.count) || 0;
        }

        // Non-search path: clone approach works fine (no row-multiplying JOINs or small result sets)
        const countQuery = idsQuery.clone();
        const countResult = await countQuery
          .clearSelect()
          .clearOrder()
          .countDistinct(`${tableNames.storeProducts}.id as count`)
          .first();
        return Number(countResult?.count) || 0;
      } catch (err) {
        console.error('[getProducts] count query failed:', err instanceof Error ? err.message : err);
        return 0;
      }
    })(),
    (async () => {
      try {
        return await idsQuery.limit(pageSize).offset(offset);
      } catch (err) {
        console.error('[getProducts] IDs query failed:', err instanceof Error ? err.message : err);
        return [];
      }
    })(),
  ]);
  const totalPages = Math.ceil(totalCount / pageSize);
  const uniqueProductIds = paginatedIds.map(p => p.id);

  if (uniqueProductIds.length === 0) {
    return { products: [], totalCount, totalPages };
  }

  // Fetch product details for the unique IDs
  // Maintain the same sort order
  // For best_sellers and price sorting, we need to preserve the order from paginatedIds
  let orderByClause: string;
  let useIdOrder = false;
  switch (sortBy) {
    case 'relevance':
      // Preserve order from the sorted IDs query (rank was calculated there)
      useIdOrder = true;
      orderByClause = `${tableNames.storeProducts}.name ASC`; // Fallback
      break;
    case 'name_desc':
      orderByClause = `${tableNames.storeProducts}.name DESC`;
      break;
    case 'newest':
      orderByClause = `${tableNames.storeProducts}."createdAt" DESC`;
      break;
    case 'oldest':
      orderByClause = `${tableNames.storeProducts}."createdAt" ASC`;
      break;
    case 'best_sellers':
    case 'top_rated':
      // Preserve order from the sorted IDs query
      useIdOrder = true;
      orderByClause = `${tableNames.storeProducts}.name ASC`; // Fallback
      break;
    case 'name_asc':
    default:
      orderByClause = `${tableNames.storeProducts}.name ASC`;
      break;
  }

  query = query
    .whereIn(`${tableNames.storeProducts}.id`, uniqueProductIds)
    .groupBy(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      `${tableNames.storeProducts}.description`
    )
    .orderByRaw(orderByClause);

  const products = await query;

  if (products.length === 0) {
    return { products: [], totalCount, totalPages };
  }

  // Enrich with images and pricing
  let enrichedProducts = await enrichProductList(products);

  // For best_sellers, preserve the order from the sorted query
  if (useIdOrder) {
    const idOrderMap = new Map(uniqueProductIds.map((id, index) => [id, index]));
    enrichedProducts = enrichedProducts.sort((a, b) => {
      const orderA = idOrderMap.get(a.id) ?? 999;
      const orderB = idOrderMap.get(b.id) ?? 999;
      return orderA - orderB;
    });
  }


  return { products: enrichedProducts, totalCount, totalPages };
}

/**
 * Get a product by its slug
 */
export async function getProductBySlug(slug: string): Promise<ProductListItem | null> {
  const cacheKey = `productBySlug:${slug}`;
  const missCacheKey = `productBySlugMiss:${slug}`;
  const cached = getCachedLong<ProductListItem>(cacheKey);
  if (cached) return cached;
  if (getCachedLong<boolean>(missCacheKey)) return null;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductListItem>(cacheKey);
    if (cachedAgain) return cachedAgain;

    // LIGHTWEIGHT LOOKUP: Only query store_products + catalogue_feed (2 tables).
    // The old approach joined 5 tables (variations, brands, categories) just to
    // find the product ID — returning hundreds of rows that get filtered in JS.
    // Now we find the ID first, then enrich only the single matched product.
    const firstPart = slug.split('-')[0];

    const query = knex(tableNames.storeProducts)
      .select(
        `${tableNames.storeProducts}.id`,
        `${tableNames.storeProducts}.name`,
        `${tableNames.storeProducts}.description`
      )
      .join(
        tableNames.catalogueFeed,
        `${tableNames.storeProducts}.id`,
        `${tableNames.catalogueFeed}.productId`
      )
      .groupBy(
        `${tableNames.storeProducts}.id`,
        `${tableNames.storeProducts}.name`,
        `${tableNames.storeProducts}.description`
      );

    if (firstPart && firstPart.length > 2) {
      query.where(`${tableNames.storeProducts}.name`, 'ilike', `${firstPart}%`);
    }

    const candidates = await query;
    const match = candidates.find(p => slugify(p.name) === slug);

    if (!match) {
      // Prefix didn't match (e.g. name starts with special char) — try without prefix
      if (firstPart && firstPart.length > 2) {
        const fallbackResult = await getProductBySlugFallback(slug);
        if (fallbackResult) {
          setCache(cacheKey, fallbackResult);
          return fallbackResult;
        }
      }
      // Final fallback: try resolving as {slug}-{manufacturerNo} (used by GMC links)
      const byMfgNo = await getProductByMfgNoSlug(slug);
      if (byMfgNo) {
        setCache(cacheKey, byMfgNo);
      } else {
        setCache(missCacheKey, true);
      }
      return byMfgNo;
    }

    // Now enrich only the single matched product (brand, category, images, pricing)
    const products = await fetchProductsWithBrandAndCategory([match.id]);
    if (products.length === 0) {
      setCache(missCacheKey, true);
      return null;
    }
    const enriched = await enrichProductList(products);
    const result = enriched[0] || null;
    if (result) {
      setCache(cacheKey, result);
    }
    return result;
  });
}

/**
 * Fallback for getProductBySlug when targeted search fails.
 * Lightweight: queries only store_products + catalogue_feed (no 5-table join).
 */
async function getProductBySlugFallback(slug: string): Promise<ProductListItem | null> {
  const candidates = await knex(tableNames.storeProducts)
    .select(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      `${tableNames.storeProducts}.description`
    )
    .join(
      tableNames.catalogueFeed,
      `${tableNames.storeProducts}.id`,
      `${tableNames.catalogueFeed}.productId`
    )
    .groupBy(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      `${tableNames.storeProducts}.description`
    );

  const match = candidates.find(p => slugify(p.name) === slug);
  if (!match) return null;

  const products = await fetchProductsWithBrandAndCategory([match.id]);
  if (products.length === 0) return null;
  const enriched = await enrichProductList(products);
  return enriched[0] || null;
}

/**
 * Try to resolve a slug that includes a slugified manufacturer number suffix.
 * GMC links use format: /products/{slugify(productName)}-{slugify(manufacturerNo)}
 * e.g., "FRSP 435150" becomes "frsp-435150" in the URL.
 * Fetches all products with manufacturer numbers in one query,
 * then tries each possible split point comparing slugified values.
 */
async function getProductByMfgNoSlug(fullSlug: string): Promise<ProductListItem | null> {
  const parts = fullSlug.split('-');
  if (parts.length < 2) return null;

  // Build normalized manufacturer suffix candidates from URL:
  // "frsp-435150" => "frsp435150" for comparison against manufacturerNo.
  const normalizedMfgCandidates = new Set<string>();
  for (let suffixLen = 1; suffixLen <= Math.min(6, parts.length - 1); suffixLen++) {
    const mfgNoPart = parts.slice(parts.length - suffixLen).join('-');
    if (!mfgNoPart) continue;
    const normalized = mfgNoPart.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (normalized) normalizedMfgCandidates.add(normalized);
  }
  if (normalizedMfgCandidates.size === 0) return null;

  // Lightweight lookup: only store_products + variations + catalogue_feed
  // No brand/category joins — those get added later via fetchProductsWithBrandAndCategory
  const products = await knex(tableNames.storeProducts)
    .select(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      `${tableNames.storeProducts}.description`,
      `${tableNames.variations}.manufacturerNo`
    )
    .join(tableNames.variations, function () {
      this.on(`${tableNames.storeProducts}.id`, '=', `${tableNames.variations}.productId`)
        .andOnNull(`${tableNames.variations}.deletedAt`);
    })
    .join(
      tableNames.catalogueFeed,
      `${tableNames.storeProducts}.id`,
      `${tableNames.catalogueFeed}.productId`
    )
    .whereNotNull(`${tableNames.variations}.manufacturerNo`)
    .where(function () {
      for (const candidate of normalizedMfgCandidates) {
        this.orWhereRaw(
          `LOWER(REGEXP_REPLACE(${tableNames.variations}."manufacturerNo", '[^a-zA-Z0-9]+', '', 'g')) = ?`,
          [candidate]
        );
      }
    })
    .groupBy(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      `${tableNames.storeProducts}.description`,
      `${tableNames.variations}.manufacturerNo`
    );

  for (let suffixLen = 1; suffixLen <= Math.min(6, parts.length - 1); suffixLen++) {
    const slugPart = parts.slice(0, parts.length - suffixLen).join('-');
    const mfgNoPart = parts.slice(parts.length - suffixLen).join('-');
    if (!slugPart || !mfgNoPart) continue;

    const match = products.find((p: any) =>
      slugify(p.name) === slugPart && slugify(p.manufacturerNo) === mfgNoPart
    );
    if (match) {
      // Enrich only the matched product with brand/category/images/pricing
      const enrichedProducts = await fetchProductsWithBrandAndCategory([match.id]);
      if (enrichedProducts.length === 0) return null;
      const enriched = await enrichProductList(enrichedProducts);
      return enriched[0] || null;
    }
  }

  return null;
}

/**
 * Get product recommendations (upsell/cross-sell) for a product
 *
 * Algorithm based on OneApp's GroupedSuggestionsApi:
 * - Uses co-occurrence analysis from order history
 * - Only returns products that have been purchased together multiple times
 * - Filters by time window (sinceDays) to focus on recent purchase behavior
 * - Requires minimum co-occurrence count to filter out noise
 * - Ranked by frequency (most frequently bought together first)
 *
 * @param productId - The product to get recommendations for
 * @param options - Configuration options
 * @param options.minCooccurrence - Minimum times products must be bought together (default: 2)
 * @param options.sinceDays - Only look at orders from the last N days (default: 365)
 * @param options.limit - Maximum number of recommendations to return (default: 12)
 */
export async function getProductRecommendations(
  productId: number,
  _categoryId?: number | null, // Kept for backward compatibility but not used
  _brandId?: number | null,    // Kept for backward compatibility but not used
  limit: number = 12,
  options: {
    minCooccurrence?: number;
    sinceDays?: number;
  } = {}
): Promise<ProductListItem[]> {
  if (!RECOMMENDATIONS_ENABLED) {
    return [];
  }

  const cacheKey = `recommendations:${productId}:${limit}`;
  const cached = getCachedLong<ProductListItem[]>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductListItem[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    const { minCooccurrence = 2, sinceDays = 365 } = options;

    const feedIds = await getCatalogueFeedProductIds();
    const availableProductIds = new Set(feedIds);
    availableProductIds.delete(productId);

    if (availableProductIds.size === 0) {
      return [];
    }

    try {
      const cooccurrenceQuery = `
        WITH order_variations AS (
          SELECT
            oi."orderId",
            v."productId"
          FROM order_items oi
          JOIN orders o ON o.id = oi."orderId"
          JOIN "${tableNames.variations}" v ON v.id = oi."variationId"
          WHERE o."purchaseDate" >= NOW() - INTERVAL '${sinceDays} days'
            AND v."deletedAt" IS NULL
          GROUP BY oi."orderId", v."productId"
        ),
        cooccurrence AS (
          SELECT
            ov2."productId" as "recommendedProductId",
            COUNT(*)::int as "pairCount"
          FROM order_variations ov1
          JOIN order_variations ov2
            ON ov1."orderId" = ov2."orderId"
            AND ov1."productId" != ov2."productId"
          WHERE ov1."productId" = ?
          GROUP BY ov2."productId"
          HAVING COUNT(*) >= ?
        )
        SELECT "recommendedProductId", "pairCount"
        FROM cooccurrence
        WHERE "recommendedProductId" = ANY(?)
        ORDER BY "pairCount" DESC
        LIMIT ?
      `;

      const queryResult = await knex.raw(cooccurrenceQuery, [
        productId,
        minCooccurrence,
        Array.from(availableProductIds),
        limit
      ]);

      const coPurchased = queryResult.rows as Array<{ recommendedProductId: number; pairCount: number }>;

      if (coPurchased.length === 0) {
        return [];
      }

      const recommendations = coPurchased.map(row => row.recommendedProductId);
      const products = await fetchProductsWithBrandAndCategory(recommendations);
      const enrichedProducts = await enrichProductList(products);

      const productIdOrder = new Map(recommendations.map((id, index) => [id, index]));
      enrichedProducts.sort((a, b) => {
        const orderA = productIdOrder.get(a.id) ?? 999;
        const orderB = productIdOrder.get(b.id) ?? 999;
        return orderA - orderB;
      });

      const result = enrichedProducts.slice(0, limit);
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Co-occurrence recommendation query failed:', error);
      return [];
    }
  });
}

/**
 * Get recommendations for multiple products at once (optimized for cart)
 * Returns deduplicated recommendations excluding the source products
 */
export async function getBatchedRecommendations(
  productIds: number[],
  limit: number = 12
): Promise<ProductListItem[]> {
  if (!RECOMMENDATIONS_ENABLED) return [];
  if (productIds.length === 0) return [];

  const cacheKey = `batchRec:${[...productIds].sort().join(',')}:${limit}`;
  const cached = getCachedLong<ProductListItem[]>(cacheKey);
  if (cached) return cached;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductListItem[]>(cacheKey);
    if (cachedAgain) return cachedAgain;

    const feedIds = await getCatalogueFeedProductIds();
    const availableProductIds = new Set(feedIds);

    for (const id of productIds) {
      availableProductIds.delete(id);
    }

    if (availableProductIds.size === 0) return [];

    try {
      const cooccurrenceQuery = `
        WITH order_variations AS (
          SELECT DISTINCT oi."orderId", v."productId"
          FROM order_items oi
          JOIN orders o ON o.id = oi."orderId"
          JOIN variations v ON v.id = oi."variationId"
          WHERE o."purchaseDate" >= NOW() - INTERVAL '365 days'
            AND v."deletedAt" IS NULL
            AND v."productId" = ANY(?)
        ),
        cooccurrence AS (
          SELECT
            oi2_v."productId" as "recommendedProductId",
            COUNT(DISTINCT ov."orderId")::int as "pairCount"
          FROM order_variations ov
          JOIN order_items oi2 ON ov."orderId" = oi2."orderId"
          JOIN variations oi2_v ON oi2."variationId" = oi2_v.id
          WHERE oi2_v."productId" != ALL(?)
            AND oi2_v."deletedAt" IS NULL
          GROUP BY oi2_v."productId"
          HAVING COUNT(DISTINCT ov."orderId") >= 2
        )
        SELECT "recommendedProductId", "pairCount"
        FROM cooccurrence
        WHERE "recommendedProductId" = ANY(?)
        ORDER BY "pairCount" DESC
        LIMIT ?
      `;

      const queryResult = await knex.raw(cooccurrenceQuery, [
        productIds,
        productIds,
        Array.from(availableProductIds),
        limit
      ]);

      const coPurchased = queryResult.rows as Array<{ recommendedProductId: number; pairCount: number }>;

      if (coPurchased.length === 0) return [];

      const recommendedIds = coPurchased.map(row => row.recommendedProductId);
      const products = await fetchProductsWithBrandAndCategory(recommendedIds);
      const enrichedProducts = await enrichProductList(products);

      const idOrder = new Map(recommendedIds.map((id, i) => [id, i]));
      enrichedProducts.sort((a, b) => (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999));

      const finalResult = enrichedProducts.slice(0, limit);
      setCache(cacheKey, finalResult);
      return finalResult;
    } catch (error) {
      console.error('Batched recommendation query failed:', error);
      return [];
    }
  });
}

/**
 * Get full product detail by slug (for product detail page)
 */
export async function getProductDetailBySlug(slug: string): Promise<ProductDetail | null> {
  const cacheKey = `productDetailBySlug:${slug}`;
  const missCacheKey = `productDetailBySlugMiss:${slug}`;
  const cached = getCachedLong<ProductDetail>(cacheKey);
  if (cached) return cached;
  if (getCachedLong<boolean>(missCacheKey)) return null;

  return coalesceRequest(cacheKey, async () => {
    const cachedAgain = getCachedLong<ProductDetail>(cacheKey);
    if (cachedAgain) return cachedAgain;

    // First get the basic product info
    const basicProduct = await getProductBySlug(slug);

    if (!basicProduct) {
      setCache(missCacheKey, true);
      return null;
    }

    // Fetch all related data in parallel to avoid waterfalling
    const [fullProduct, variations, productImages] = await Promise.all([
      knex(tableNames.storeProducts)
        .select('*')
        .where('id', basicProduct.id)
        .first(),
      knex(tableNames.variations)
        .select('*')
        .where('productId', basicProduct.id)
        .whereNull('deletedAt')
        .orderBy('id', 'asc'),
      knex(tableNames.productImages)
        .select('*')
        .where('productId', basicProduct.id)
        .whereNull('deletedAt')
        .orderBy('sortOrder', 'asc'),
    ]);

    // Get variation IDs and manufacturer numbers for subsequent queries
    const variationIds = variations.map((v: { id: number }) => v.id);
    const manufacturerNos = variations.map((v: { manufacturerNo: string }) => v.manufacturerNo).filter(Boolean);

    // Get the product's brandId from variations (they should all have the same brand)
    const productBrandId = variations.length > 0 ? variations[0].brandId : null;

    // Fetch secondary related data in parallel
    const [variationImages, inventoryInfo] = await Promise.all([
      variationIds.length > 0
        ? knex(tableNames.variationImages)
          .select('*')
          .whereIn('variationId', variationIds)
          .whereNull('deletedAt')
        : Promise.resolve([]),
      variationIds.length > 0
        ? knex(tableNames.manufacturerSuppliers)
          .select(
            'variationId',
            'manufacturerNo',
            'brandId',
            // Only count quantity from suppliers with valid pricing data (cost > 0, shipping exists)
            // This ensures stock status matches whether a price can be calculated
            knex.raw(`SUM(CASE
              WHEN cost > 0
                AND quantity > 0
                AND COALESCE("estimatedShipping", "shippingCost") IS NOT NULL
              THEN quantity
              ELSE 0
            END) as "totalQuantity"`),
            // Shipping: use estimatedShipping, fallback to shippingCost, filter out if both null
            // minCost: cost for in-stock items (quantity > 0)
            knex.raw('MIN(CASE WHEN cost > 0 AND quantity > 0 AND COALESCE("estimatedShipping", "shippingCost") IS NOT NULL THEN cost + COALESCE("estimatedShipping", "shippingCost") ELSE NULL END) as "minCost"'),
            // minCostOnly: just the cost without shipping (for pack calculations)
            knex.raw('MIN(CASE WHEN cost > 0 AND quantity > 0 AND COALESCE("estimatedShipping", "shippingCost") IS NOT NULL THEN cost ELSE NULL END) as "minCostOnly"'),
            // minCostAny: cost for any item regardless of quantity (for out-of-stock display)
            knex.raw('MIN(CASE WHEN cost > 0 AND COALESCE("estimatedShipping", "shippingCost") IS NOT NULL THEN cost + COALESCE("estimatedShipping", "shippingCost") ELSE NULL END) as "minCostAny"'),
            // minCostOnlyAny: just the cost without shipping (for pack calculations, regardless of stock)
            knex.raw('MIN(CASE WHEN cost > 0 AND COALESCE("estimatedShipping", "shippingCost") IS NOT NULL THEN cost ELSE NULL END) as "minCostOnlyAny"'),
            knex.raw('MAX(msrp) as msrp')
          )
          .where(function () {
            this.whereIn('variationId', variationIds)
              .orWhereIn('manufacturerNo', manufacturerNos);
          })
          .whereNull('deletedAt')
          .groupBy('variationId', 'manufacturerNo', 'brandId')
        : Promise.resolve([]),
    ]);

    // Build inventory maps (prefer exact variationId match, fallback to manufacturerNo)
    const inventoryByIdMap = new Map<number, { quantity: number; minCost: number | null; minCostOnly: number | null; minCostAny: number | null; minCostOnlyAny: number | null; msrp: number | null }>();
    const inventoryBySkuMap = new Map<string, { quantity: number; minCost: number | null; minCostOnly: number | null; minCostAny: number | null; minCostOnlyAny: number | null; msrp: number | null }>();

    // Create a Set of this product's variation IDs for quick lookup
    const productVariationIds = new Set(variationIds);

    for (const inv of inventoryInfo) {
      const data = {
        quantity: Number(inv.totalQuantity) || 0,
        minCost: inv.minCost ? Math.round(Number(inv.minCost)) : null,
        minCostOnly: inv.minCostOnly ? Math.round(Number(inv.minCostOnly)) : null, // Cost without shipping
        minCostAny: inv.minCostAny ? Math.round(Number(inv.minCostAny)) : null, // Cost regardless of stock
        minCostOnlyAny: inv.minCostOnlyAny ? Math.round(Number(inv.minCostOnlyAny)) : null, // Cost without shipping, regardless of stock
        msrp: inv.msrp ? Math.round(Number(inv.msrp)) : null,
      };
      if (inv.variationId) inventoryByIdMap.set(Number(inv.variationId), data);
      // Only add to SKU map if:
      // 1. The variation belongs to THIS product's variations
      // 2. The supplier's brandId matches the product's brand (prevents SKU collisions between different brands)
      if (inv.manufacturerNo && inv.variationId &&
        productVariationIds.has(Number(inv.variationId)) &&
        (!productBrandId || inv.brandId === productBrandId)) {
        inventoryBySkuMap.set(String(inv.manufacturerNo), data);
      }
    }

    // Helper to check if URL is a valid product image (not a placeholder)
    const isValidProductImage = (url: unknown): boolean => {
      if (!url || typeof url !== 'string') return false;
      const lowerUrl = url.toLowerCase();
      // Filter out placeholder images
      if (lowerUrl.includes('placeholder')) return false;
      if (lowerUrl.includes('no-image')) return false;
      if (lowerUrl.includes('noimage')) return false;
      return true;
    };

    // Build variation images map
    const varImageMap = new Map<number, string[]>();
    for (const img of variationImages) {
      const url = Array.isArray(img.imageUrl) ? img.imageUrl[0] : img.imageUrl;
      if (url && isValidProductImage(url)) {
        const images = varImageMap.get(img.variationId) || [];
        images.push(url);
        varImageMap.set(img.variationId, images);
      }
    }

    // Helper function to extract pack count from variation
    // Supports formats: "Pack of 4", "4-Pack", "16-Pack", etc.
    const extractPackCount = (variation: any): number => {
      if (variation.packCount && variation.packCount > 1) return variation.packCount;
      const name = `${variation.variation || ''} ${variation.variationTwo || ''}`.toLowerCase();
      const matchPackOf = name.match(/pack of (\d+)/);
      if (matchPackOf) return parseInt(matchPackOf[1]!, 10);
      const matchNPack = name.match(/(\d+)[- ]?pack/);
      if (matchNPack) return parseInt(matchNPack[1]!, 10);
      return 1;
    };

    // Helper function to get base variation name (without pack suffix)
    // Strips: "(Pack of 4)", "4-Pack", "16-Pack", etc.
    const getBaseVariationName = (name: string | null): string | null => {
      if (!name) return null;
      return name
        .replace(/\s*\(Pack of \d+\)/i, '')
        .replace(/\s*\d+[- ]?pack/i, '')
        .trim();
    };

    // Pack shipping costs (in cents)
    const getPackShipping = (packCount: number): number => {
      if (packCount <= 4) return 600;  // $6.00
      if (packCount <= 6) return 700;  // $7.00
      return 800;  // $8.00 for 8+
    };

    // Build maps of single-unit costs for pack price calculations
    // Map by variation name and by manufacturerNo, plus a global cheapest single-unit cost
    const singleUnitCostsByName = new Map<string, number>();
    const singleUnitCostsBySku = new Map<string, number>();
    let cheapestSingleUnitCost: number | null = null;
    for (const v of variations) {
      const packCount = extractPackCount(v);
      if (packCount === 1) {
        // This is a single-unit variation
        const inv = inventoryByIdMap.get(v.id);
        const invSku = v.manufacturerNo ? inventoryBySkuMap.get(v.manufacturerNo) : null;
        const cost = inv?.minCostOnly || invSku?.minCostOnly || null;
        if (cost) {
          // Track cheapest single-unit cost across all variations
          if (!cheapestSingleUnitCost || cost < cheapestSingleUnitCost) {
            cheapestSingleUnitCost = cost;
          }
          // Store by variation name
          const baseName = getBaseVariationName(v.variation);
          if (baseName) {
            const existing = singleUnitCostsByName.get(baseName);
            if (!existing || cost < existing) {
              singleUnitCostsByName.set(baseName, cost);
            }
          }
          // Also store by manufacturerNo (SKU)
          if (v.manufacturerNo) {
            const existing = singleUnitCostsBySku.get(v.manufacturerNo);
            if (!existing || cost < existing) {
              singleUnitCostsBySku.set(v.manufacturerNo, cost);
            }
          }
        }
      }
    }

    // Build variation details
    const variationDetails: VariationDetail[] = variations
      .map((v: any) => {
        // Try variationId first (exact match)
        const invById = inventoryByIdMap.get(v.id);
        // Fallback to SKU for inventory only
        const invBySku = v.manufacturerNo ? inventoryBySkuMap.get(v.manufacturerNo) : null;

        const packCount = extractPackCount(v);

        // If we fallback to SKU inventory, we must divide the quantity by the pack size
        let quantity = invById ? invById.quantity : (invBySku ? invBySku.quantity : 0);
        if (!invById && invBySku && packCount > 1) {
          quantity = Math.floor(quantity / packCount);
        }

        // Price: use itemPrice directly from the variation (no markup calculation)
        const price = v.itemPrice ? Math.round(Number(v.itemPrice)) : 0;

        // MSRP calculation: same priority order
        // Don't multiply by packCount - MSRP is already for the sellable unit (pack)
        let msrp = 0;
        if (invById && invById.msrp) {
          msrp = invById.msrp;
        } else if (invBySku && invBySku.msrp) {
          msrp = invBySku.msrp;
        } else if (v.msrp) {
          msrp = v.msrp;
        }

        const images = varImageMap.get(v.id) || [];

        return {
          id: v.id,
          manufacturerNo: v.manufacturerNo,
          variantType: v.variantType,
          variation: v.variation,
          variantTypeTwo: v.variantTypeTwo,
          variationTwo: v.variationTwo,
          price,
          msrp,
          map: v.map,
          weight: v.weight,
          images,
          inStock: quantity > 0,
          quantity,
        };
      })
      .filter(v => v.inStock || (v.price !== 0 && v.price !== null)) // Keep in-stock variations and those with valid prices
      .sort((a, b) => {
        // In-stock items first
        if (a.inStock && !b.inStock) return -1;
        if (!a.inStock && b.inStock) return 1;
        // Then by price (lowest first)
        return (a.price || Infinity) - (b.price || Infinity);
      });

    // Build product images array
    // Prefer product-level images, but fallback to variation images if no product images exist
    const images: string[] = [];

    // Add product-level images (filter out placeholders)
    for (const img of productImages) {
      const url = Array.isArray(img.imageUrl) ? img.imageUrl[0] : img.imageUrl;
      if (url && isValidProductImage(url)) images.push(url);
    }

    // If no product images, fallback to variation images
    if (images.length === 0) {
      const allVariationImages = new Set<string>();
      for (const img of variationImages) {
        const url = Array.isArray(img.imageUrl) ? img.imageUrl[0] : img.imageUrl;
        if (url && isValidProductImage(url)) allVariationImages.add(url);
      }
      images.push(...Array.from(allVariationImages));
    }

    // If no variations have valid prices, the product can't be displayed
    if (variationDetails.length === 0) {
      return null;
    }

    // Fetch product recommendations (upsell/cross-sell)
    // Do this after we have the product info to pass categoryId and brandId
    const relatedProducts = RECOMMENDATIONS_ENABLED
      ? await getProductRecommendations(
        basicProduct.id,
        basicProduct.categoryId,
        productBrandId,
        12
      )
      : [];

    // Build the full product detail
    const productDetail: ProductDetail = {
      ...basicProduct,
      bulletPoints: fullProduct?.bulletPoints || [],
      keywords: fullProduct?.keywords || null,
      images,
      variations: variationDetails,
      relatedProducts,
    };

    setCache(cacheKey, productDetail);
    return productDetail;
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
  } = {}
): Promise<{ products: ProductListItem[]; totalCount: number; totalPages: number }> {
  return getProducts(
    {
      search: query,
      categoryIds: options.categoryIds,
      brandIds: options.brandIds,
      inStock: options.inStock,
      onSale: options.onSale,
      packAvailable: options.packAvailable,
      minPrice: options.minPrice,
      maxPrice: options.maxPrice,
    },
    options.sort || 'relevance',
    { page: options.page, pageSize: options.pageSize }
  );
}

// ============================================
// Category Functions
// ============================================

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  return knex(tableNames.channelCategories)
    .select('*')
    .orderBy('categoryName', 'asc');
}

/**
 * Get category tree filtered by company/store
 */
export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  return getCategoryTreeForStorefront();
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await knex(tableNames.channelCategories)
    .select('*')
    .orderBy('categoryName', 'asc');

  // Find all categories matching this slug
  const matchingCategories = categories.filter((c: Category) => slugify(c.categoryName) === slug);

  if (matchingCategories.length === 0) {
    return null;
  }

  if (matchingCategories.length === 1) {
    return matchingCategories[0];
  }

  // Multiple categories with same slug - prefer lowest ID (original)
  matchingCategories.sort((a: Category, b: Category) => a.id - b.id);
  return matchingCategories[0];
}

/**
 * Get all descendant category IDs for a given category (including the category itself)
 * Used to fetch products from a category and all its subcategories
 */
export async function getCategoryWithDescendantIds(categoryId: number): Promise<number[]> {
  const allCategories = await knex(tableNames.channelCategories)
    .select('id', 'parentCategoryId');

  // Build a map of parent -> children
  const childrenMap = new Map<number, number[]>();
  for (const cat of allCategories) {
    if (cat.parentCategoryId) {
      const children = childrenMap.get(cat.parentCategoryId) || [];
      children.push(cat.id);
      childrenMap.set(cat.parentCategoryId, children);
    }
  }

  // Recursively collect all descendant IDs
  const collectDescendants = (id: number): number[] => {
    const result = [id];
    const children = childrenMap.get(id) || [];
    for (const childId of children) {
      result.push(...collectDescendants(childId));
    }
    return result;
  };

  return collectDescendants(categoryId);
}


/**
 * Get all category IDs that match a category name pattern
 * This finds categories where the name contains the search term (case-insensitive)
 * Used to find ALL related categories regardless of hierarchy
 *
 * For example, searching for "tire" will find:
 * - "Tires"
 * - "ATV Tires"
 * - "Motorcycle Tires"
 * - "Tire Accessories"
 * etc.
 */
export async function getCategoryIdsByNamePattern(categoryName: string): Promise<number[]> {
  // Normalize the search term - remove common suffixes and get the root word
  const searchTerm = categoryName
    .toLowerCase()
    .replace(/s$/, '')  // Remove trailing 's' (Tires -> Tire)
    .trim();

  const allCategories = await knex(tableNames.channelCategories)
    .select('id', 'categoryName');

  // Find all categories where the name contains the search term
  const matchingIds: number[] = [];
  for (const cat of allCategories) {
    const catNameLower = cat.categoryName.toLowerCase();
    // Match if category name contains the search term
    if (catNameLower.includes(searchTerm)) {
      matchingIds.push(cat.id);
    }
  }

  return matchingIds;
}

/**
 * Get all category IDs related to a category:
 * 1. The category itself
 * 2. All descendant categories (children, grandchildren, etc.)
 * 3. All categories with similar names (containing the category name)
 *
 * This ensures comprehensive product coverage for a category page
 */
export async function getAllRelatedCategoryIds(categoryId: number, categoryName: string): Promise<number[]> {
  const [descendantIds, nameMatchIds] = await Promise.all([
    getCategoryWithDescendantIds(categoryId),
    getCategoryIdsByNamePattern(categoryName),
  ]);

  // Combine and deduplicate
  const allIds = new Set([...descendantIds, ...nameMatchIds]);
  return Array.from(allIds);
}

/**
 * Get category with its hierarchy (breadcrumb)
 */
export async function getCategoryWithHierarchy(categoryId: number): Promise<Category[]> {
  const allCategories = await knex(tableNames.channelCategories).select('*');
  const categoryMap = new Map<number, Category>();

  for (const cat of allCategories) {
    categoryMap.set(cat.id, cat);
  }

  const hierarchy: Category[] = [];
  let currentId: number | null = categoryId;

  while (currentId !== null) {
    const category = categoryMap.get(currentId);
    if (category) {
      hierarchy.unshift(category);
      currentId = category.parentCategoryId;
    } else {
      break;
    }
  }

  return hierarchy;
}



/**
 * Enrich a list of products with images and pricing
 */
export async function enrichProductList(products: Array<{
  id: number;
  name: string;
  description: string | null;
  brandName: string | null;
  brandId: number | null;
  categoryName?: string | null;
  categoryId?: number | null;
}>): Promise<ProductListItem[]> {
  const productIds = products.map(p => p.id);

  if (productIds.length === 0) {
    return [];
  }

  // Cache enriched results by product ID set (60s TTL)
  const sortedIds = [...productIds].sort((a, b) => a - b);
  const cacheKey = `enrichProducts:${sortedIds.join(',')}`;
  const cached = getCached<ProductListItem[]>(cacheKey);
  if (cached) {
    // Merge cached enrichment with current product metadata (names etc may differ)
    const cachedMap = new Map(cached.map(p => [p.id, p]));
    const merged = products.map(p => {
      const c = cachedMap.get(p.id);
      if (c) return { ...c, name: p.name, description: p.description, brandName: p.brandName, brandId: p.brandId };
      return null;
    }).filter(Boolean) as ProductListItem[];
    if (merged.length === products.length) return merged;
  }

  // PERFORMANCE: Run all independent queries in parallel
  // Wave 1: Get all variations (needed for variationIds)
  const allVariations = await knex(tableNames.variations)
      .select('id', 'productId')
      .whereIn('productId', productIds)
      .whereNull('deletedAt');

  const variationIds = allVariations.map(v => v.id);

  // Wave 2: Run all remaining independent queries in parallel
  // - productImages: only needs productIds
  // - variationImages: needs variationIds from wave 1
  // - variationInfo: only needs productIds
  // - pricing: uses itemPrice directly from variations
  // - dataFromLowestPrice: uses itemPrice directly from variations
  const [productImages, variationImages, variationInfo, pricing, dataFromLowestPrice] = await Promise.all([
    // Product images
    knex(tableNames.productImages)
      .select('productId', 'imageUrl')
      .whereIn('productId', productIds)
      .whereNull('deletedAt')
      .orderBy('sortOrder', 'asc'),
    // Variation images
    variationIds.length > 0
      ? knex(tableNames.variationImages)
        .select('variationId', 'imageUrl')
        .whereIn('variationId', variationIds)
        .whereNull('deletedAt')
      : Promise.resolve([]),
    // Variation count
    knex(tableNames.variations)
      .select('productId')
      .count('* as variationCount')
      .whereIn('productId', productIds)
      .whereNull('deletedAt')
      .groupBy('productId'),
    // Pricing query — use itemPrice directly from variations
    knex(tableNames.variations)
      .select(
        `${tableNames.variations}.productId`,
        knex.raw(`MIN(CASE
          WHEN "${tableNames.variations}"."itemPrice" > 0
            AND "manufacturer_suppliers".quantity > 0
          THEN "${tableNames.variations}"."itemPrice"
          ELSE NULL
        END) as "minPrice"`),
        knex.raw(`MAX(CASE
          WHEN "${tableNames.variations}"."itemPrice" > 0
            AND "manufacturer_suppliers".quantity > 0
          THEN "${tableNames.variations}"."itemPrice"
          ELSE NULL
        END) as "maxPrice"`),
        knex.raw(`MIN(CASE
          WHEN "${tableNames.variations}"."itemPrice" > 0
          THEN "${tableNames.variations}"."itemPrice"
          ELSE NULL
        END) as "minPriceAny"`),
        knex.raw('MIN(CASE WHEN "manufacturer_suppliers".msrp > 0 AND "manufacturer_suppliers".quantity > 0 THEN "manufacturer_suppliers".msrp ELSE "variations".msrp END) as msrp'),
        knex.raw('MAX(CASE WHEN "manufacturer_suppliers".msrp > 0 AND "manufacturer_suppliers".quantity > 0 THEN "manufacturer_suppliers".msrp ELSE "variations".msrp END) as "maxMsrp"'),
        knex.raw(`SUM(CASE
          WHEN "manufacturer_suppliers".quantity > 0
          THEN "manufacturer_suppliers".quantity
          ELSE 0
        END) as "totalQuantity"`)
      )
      .leftJoin(
        tableNames.manufacturerSuppliers,
        `${tableNames.variations}.id`,
        `${tableNames.manufacturerSuppliers}.variationId`
      )
      .whereIn(`${tableNames.variations}.productId`, productIds)
      .whereNull(`${tableNames.variations}.deletedAt`)
      .where(function () {
        this.whereNull(`${tableNames.manufacturerSuppliers}.deletedAt`)
          .orWhereNull(`${tableNames.manufacturerSuppliers}.id`);
      })
      .groupBy(`${tableNames.variations}.productId`),
    // Lowest price variation data — uses itemPrice directly
    knex.raw(`
      SELECT DISTINCT ON ("productId")
        "productId",
        "variationId",
        map as "minPriceMap",
        "itemPrice" as "calculatedPrice"
      FROM (
        SELECT
          v."productId",
          v.id as "variationId",
          v.map,
          v."itemPrice",
          ms.quantity
        FROM ${tableNames.variations} v
        LEFT JOIN ${tableNames.manufacturerSuppliers} ms ON v.id = ms."variationId"
        WHERE v."productId" = ANY(ARRAY[${productIds.join(',')}])
          AND v."deletedAt" IS NULL
          AND (ms."deletedAt" IS NULL OR ms.id IS NULL)
          AND v."itemPrice" > 0
          AND ms.quantity > 0
      ) sub
      ORDER BY "productId", "calculatedPrice" ASC
    `)
  ]);

  // Get the variation IDs of the lowest-priced variations
  const lowestPriceVariationIds = (dataFromLowestPrice.rows || []).map((row: any) => Number(row.variationId)).filter(Boolean);

  // Get MSRP for the lowest-priced variations using the same logic as product detail page
  // (MAX(msrp) from manufacturer_suppliers, fallback to variations.msrp)
  const msrpForLowestPrice = lowestPriceVariationIds.length > 0
    ? await knex(tableNames.variations)
      .select(
        `${tableNames.variations}.id as variationId`,
        `${tableNames.variations}.productId`,
        `${tableNames.variations}.msrp as variationMsrp`,
        knex.raw('MAX("manufacturer_suppliers".msrp) as "supplierMsrp"')
      )
      .leftJoin(
        tableNames.manufacturerSuppliers,
        `${tableNames.variations}.id`,
        `${tableNames.manufacturerSuppliers}.variationId`
      )
      .whereIn(`${tableNames.variations}.id`, lowestPriceVariationIds)
      .where(function () {
        this.whereNull(`${tableNames.manufacturerSuppliers}.deletedAt`)
          .orWhereNull(`${tableNames.manufacturerSuppliers}.id`);
      })
      .groupBy(`${tableNames.variations}.id`, `${tableNames.variations}.productId`, `${tableNames.variations}.msrp`)
    : [];

  // Build maps of productId -> MAP and MSRP from lowest priced variation
  const mapFromLowestPriceMap = new Map<number, number | null>();
  const msrpFromLowestPriceMap = new Map<number, number | null>();
  for (const row of dataFromLowestPrice.rows || []) {
    mapFromLowestPriceMap.set(Number(row.productId), row.minPriceMap ? Math.round(Number(row.minPriceMap)) : null);
  }
  for (const row of msrpForLowestPrice) {
    // Use supplier MSRP if available (matches product detail page logic), otherwise variation MSRP
    const msrp = row.supplierMsrp ? Math.round(Number(row.supplierMsrp)) : (row.variationMsrp ? Math.round(Number(row.variationMsrp)) : null);
    msrpFromLowestPriceMap.set(Number(row.productId), msrp);
  }

  // Build image map: prefer variation images over product images
  // Store both primary and fallback images
  const imageMap = new Map<number, { primary: string | null; fallback: string | null }>();

  // Helper to check if URL is a valid product image (not a placeholder)
  const isValidProductImage = (url: unknown): boolean => {
    if (!url || typeof url !== 'string') return false;
    const lowerUrl = url.toLowerCase();
    // Filter out placeholder images
    if (lowerUrl.includes('placeholder')) return false;
    if (lowerUrl.includes('no-image')) return false;
    if (lowerUrl.includes('noimage')) return false;
    return true;
  };

  // First map variation images by their product
  // Build a lookup map for faster access (using Number to handle type coercion)
  const variationLookup = new Map<number, { id: number; productId: number }>();
  for (const v of allVariations) {
    variationLookup.set(Number(v.id), { id: Number(v.id), productId: Number(v.productId) });
  }

  const variationImagesByProduct = new Map<number, string[]>();
  for (const vImg of variationImages) {
    const variation = variationLookup.get(Number(vImg.variationId));
    if (variation) {
      const existing = variationImagesByProduct.get(variation.productId) || [];
      const url = Array.isArray(vImg.imageUrl) ? vImg.imageUrl[0] : vImg.imageUrl;
      // Only add if it's a valid image (not a placeholder)
      if (url && !existing.includes(url) && isValidProductImage(url)) {
        existing.push(url);
      }
      variationImagesByProduct.set(variation.productId, existing);
    }
  }

  // Collect product images by product
  const productImagesByProduct = new Map<number, string[]>();
  for (const prodImg of productImages) {
    const productId = Number(prodImg.productId);
    const existing = productImagesByProduct.get(productId) || [];
    const url = Array.isArray(prodImg.imageUrl) ? prodImg.imageUrl[0] : prodImg.imageUrl;
    // Only add if it's a valid image (not a placeholder)
    if (url && !existing.includes(url) && isValidProductImage(url)) {
      existing.push(url);
    }
    productImagesByProduct.set(productId, existing);
  }

  // Helper to score image URLs by domain reliability
  // Lower score = more reliable/preferred
  // Score 100+ = known broken/unavailable domains (effectively blacklisted)
  const getImageDomainScore = (url: string): number => {
    const lowerUrl = url.toLowerCase();

    // BLACKLISTED - Known broken/dead domains (use as absolute last resort)
    if (lowerUrl.includes('thed.zone')) return 100;
    if (lowerUrl.includes('dealer.tucker.com')) return 100;

    // Most reliable - our known good CDNs
    if (lowerUrl.includes('rockymountainatvmc.com')) return 1;
    if (lowerUrl.includes('wpsstatic.com')) return 2;
    if (lowerUrl.includes('walmartimages.com')) return 2;
    if (lowerUrl.includes('media-amazon.com')) return 3;
    if (lowerUrl.includes('cloudfront.net')) return 4;

    // Less reliable - Shopify CDN has many expired/broken old images
    if (lowerUrl.includes('shopify.com')) return 8;
    if (lowerUrl.includes('cdn.shopify.com')) return 8;

    // Least reliable - user-generated content platforms
    if (lowerUrl.includes('ebayimg.com')) return 10;
    if (lowerUrl.includes('ebay.com')) return 10;

    // Default for unknown domains
    return 6;
  };

  // Populate imageMap: combine and sort images by domain reliability
  // Store both primary and fallback for each product
  for (const productId of productIds) {
    const numProductId = Number(productId);
    const varImages = variationImagesByProduct.get(numProductId) || [];
    const prodImages = productImagesByProduct.get(numProductId) || [];

    // Combine all available images and remove duplicates
    const allImages = [...prodImages, ...varImages].filter((url, index, arr) => arr.indexOf(url) === index);

    // Sort by domain reliability (most reliable first)
    allImages.sort((a, b) => getImageDomainScore(a) - getImageDomainScore(b));

    imageMap.set(numProductId, {
      primary: allImages[0] || null,
      fallback: allImages[1] || null, // Second image as fallback
    });
  }

  const variationMap = new Map<number, number>();
  for (const v of variationInfo) {
    variationMap.set(Number(v.productId), Number(v.variationCount) || 1);
  }

  const pricingMap = new Map<number, { price: number | null; maxPrice: number | null; msrp: number | null; maxMsrp: number | null; map: number | null; maxMap: number | null; inStock: boolean }>();
  for (const p of pricing) {
    // Prices are now pre-calculated in the SQL query using the formula:
    // price = GREATEST(map, (cost + shipping) * markup)
    // Use minPrice for in-stock items, fallback to minPriceAny for out-of-stock display
    const minPrice = p.minPrice ? Math.round(Number(p.minPrice)) : null;
    const minPriceAny = p.minPriceAny ? Math.round(Number(p.minPriceAny)) : null;
    const maxPrice = p.maxPrice ? Math.round(Number(p.maxPrice)) : null;
    const isInStock = Number(p.totalQuantity) > 0;
    const productId = Number(p.productId);

    // Get MAP and MSRP from the variation with the lowest price (matches product detail page behavior)
    const mapFromLowestPriceVariation = mapFromLowestPriceMap.get(productId);
    const msrpFromLowestPriceVariation = msrpFromLowestPriceMap.get(productId);

    pricingMap.set(productId, {
      // Use in-stock price if available, otherwise fallback to any price (for out-of-stock display)
      price: minPrice ?? minPriceAny,
      maxPrice: maxPrice,
      // Use MSRP from the lowest-priced variation for discount calculation (matches product detail page)
      msrp: msrpFromLowestPriceVariation ?? (p.msrp ? Math.round(Number(p.msrp)) : null),
      maxMsrp: p.maxMsrp ? Math.round(Number(p.maxMsrp)) : null,
      // Use MAP from the variation with the lowest price for consistency with product detail page
      map: mapFromLowestPriceVariation ?? null,
      maxMap: null, // Not used - we only care about the first variation's MAP for discount calculation
      inStock: isInStock,
    });
  }

  // Fetch review aggregates for all products in one query
  const reviewAggregates = await knex(tableNames.reviewAggregates)
    .select('productId', 'averageRating', 'totalReviews')
    .whereIn('productId', productIds)
    .where('companyId', STOREFRONT_COMPANY_ID);

  const reviewMap = new Map<number, { averageRating: number; totalReviews: number }>();
  for (const ra of reviewAggregates) {
    const total = Number(ra.totalReviews) || 0;
    if (total > 0) {
      reviewMap.set(Number(ra.productId), {
        averageRating: Number(ra.averageRating) || 0,
        totalReviews: total,
      });
    }
  }

  const enrichedResult = products
    .map(p => {
      const numId = Number(p.id);
      const priceInfo = pricingMap.get(numId) || { price: null, maxPrice: null, msrp: null, maxMsrp: null, map: null, maxMap: null, inStock: false };
      const reviewInfo = reviewMap.get(numId);
      return {
        id: p.id,
        slug: slugify(p.name),
        name: p.name,
        description: p.description,
        brandName: p.brandName,
        brandId: p.brandId,
        categoryName: p.categoryName ?? null,
        categoryId: p.categoryId ?? null,
        primaryImage: imageMap.get(numId)?.primary || null,
        fallbackImage: imageMap.get(numId)?.fallback || null,
        price: priceInfo.price,
        maxPrice: priceInfo.maxPrice,
        msrp: priceInfo.msrp,
        maxMsrp: priceInfo.maxMsrp,
        map: priceInfo.map,
        maxMap: priceInfo.maxMap,
        inStock: priceInfo.inStock,
        variationCount: variationMap.get(numId) || 1,
        ...(reviewInfo && { averageRating: reviewInfo.averageRating, totalReviews: reviewInfo.totalReviews }),
      };
    }); // Products are pre-filtered in query to ensure valid pricing

  // Cache the enriched results
  setCache(cacheKey, enrichedResult);
  return enrichedResult;
}

// ============================================
// Search Suggestions (Autocomplete)
// ============================================

/**
 * Get search suggestions for autocomplete
 * Returns products, categories, brands, and vehicle suggestions
 * Optimized for speed with parallel queries
 */
export async function getSearchSuggestions(query: string): Promise<SearchSuggestionsResponse> {
  const trimmed = query.trim();

  // Cache search suggestions for 60s to avoid hammering DB on repeated searches
  const cacheKey = `searchSuggestions:${trimmed.toLowerCase()}`;
  const cached = getCached<SearchSuggestionsResponse>(cacheKey);
  if (cached) return cached;

  // Parse query to detect type
  const parsed = parseSearchQuery(trimmed);
  const escapedQuery = escapeLikePattern(trimmed);

  // Run all queries in parallel for speed
  const [products, categories] = await Promise.all([
    // Product suggestions (limit 5)
    getProductSuggestions(escapedQuery, trimmed, parsed.type === 'sku'),
    // Category suggestions (limit 3)
    getCategorySuggestions(escapedQuery),
  ]);

  const result: SearchSuggestionsResponse = {
    products,
    categories,
    queryType: parsed.type,
  };

  setCache(cacheKey, result);
  return result;
}

/**
 * Get product suggestions for autocomplete
 * Prioritizes: exact match > prefix match > contains match
 */
async function getProductSuggestions(escapedQuery: string, rawQuery: string, isSku: boolean): Promise<ProductSuggestion[]> {

  // Build the base query
  let query = knex(tableNames.storeProducts)
    .select(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`,
      knex.raw(`MIN(${tableNames.brands}.brand) as "brandName"`)
    )
    .leftJoin(tableNames.variations, function () {
      this.on(`${tableNames.storeProducts}.id`, '=', `${tableNames.variations}.productId`)
        .andOnNull(`${tableNames.variations}.deletedAt`);
    })
    .leftJoin(
      tableNames.brands,
      `${tableNames.variations}.brandId`,
      `${tableNames.brands}.id`
    )
    // Only include products in the catalogue feed
    .whereIn(`${tableNames.storeProducts}.id`, function () {
      this.select('productId').distinct().from(tableNames.catalogueFeed);
    })
    .whereNull(`${tableNames.storeProducts}.deactivatedAt`);

  // Add search condition based on query type
  if (isSku) {
    // SKU search: prioritize manufacturerNo match
    query = query.where(function () {
      this.where(`${tableNames.variations}.manufacturerNo`, 'ILIKE', `%${escapedQuery}%`);
    });
  } else {
    // Keyword search: full-text search on name, ILIKE fallback for brand and SKU
    query = query.where(function () {
      this.whereRaw(
        `to_tsvector('english', coalesce(${tableNames.storeProducts}.name, '')) @@ plainto_tsquery('english', ?)`,
        [rawQuery]
      )
        .orWhere(`${tableNames.brands}.brand`, 'ILIKE', `%${escapedQuery}%`)
        .orWhere(`${tableNames.variations}.manufacturerNo`, 'ILIKE', `%${escapedQuery}%`);
    });
  }

  // Order by relevance (exact > prefix > contains) and limit
  const products = await query
    .groupBy(
      `${tableNames.storeProducts}.id`,
      `${tableNames.storeProducts}.name`
    )
    .orderByRaw(`
      CASE
        WHEN LOWER(${tableNames.storeProducts}.name) = LOWER(?) THEN 0
        WHEN LOWER(${tableNames.storeProducts}.name) LIKE LOWER(?) THEN 1
        ELSE 2
      END,
      ${tableNames.storeProducts}.name
    `, [escapedQuery, `${escapedQuery}%`])
    .limit(5);

  if (products.length === 0) {
    return [];
  }

  // Enrich with images and pricing
  const productIds = products.map(p => p.id);

  // Get images
  const [productImages, variationImages, allVariations] = await Promise.all([
    knex(tableNames.productImages)
      .select('productId', 'imageUrl')
      .whereIn('productId', productIds)
      .whereNull('deletedAt'),
    knex(tableNames.variations)
      .select('v.id', 'v.productId', 'vi.imageUrl')
      .from(`${tableNames.variations} as v`)
      .leftJoin(`${tableNames.variationImages} as vi`, 'v.id', 'vi.variationId')
      .whereIn('v.productId', productIds)
      .whereNull('v.deletedAt'),
    knex(tableNames.variations)
      .select('id', 'productId')
      .whereIn('productId', productIds)
      .whereNull('deletedAt'),
  ]);

  // Get pricing — use itemPrice directly from variations
  const pricing = await knex(tableNames.variations)
    .select(
      `${tableNames.variations}.productId`,
      knex.raw(`MIN(CASE
        WHEN "${tableNames.variations}"."itemPrice" > 0
          AND "manufacturer_suppliers".quantity > 0
        THEN "${tableNames.variations}"."itemPrice"
        ELSE NULL
      END) as "price"`),
      knex.raw('SUM(COALESCE("manufacturer_suppliers".quantity, 0)) as "totalQuantity"')
    )
    .leftJoin(
      tableNames.manufacturerSuppliers,
      `${tableNames.variations}.id`,
      `${tableNames.manufacturerSuppliers}.variationId`
    )
    .whereIn(`${tableNames.variations}.productId`, productIds)
    .whereNull(`${tableNames.variations}.deletedAt`)
    .where(function () {
      this.whereNull(`${tableNames.manufacturerSuppliers}.deletedAt`)
        .orWhereNull(`${tableNames.manufacturerSuppliers}.id`);
    })
    .groupBy(`${tableNames.variations}.productId`);

  // Build maps
  const imageMap = new Map<number, string>();
  const variationImagesByProduct = new Map<number, string[]>();

  for (const vImg of variationImages) {
    if (vImg.imageUrl) {
      const existing = variationImagesByProduct.get(vImg.productId) || [];
      const url = Array.isArray(vImg.imageUrl) ? vImg.imageUrl[0] : vImg.imageUrl;
      if (url && !existing.includes(url)) {
        existing.push(url);
      }
      variationImagesByProduct.set(vImg.productId, existing);
    }
  }

  for (const productId of productIds) {
    const varImages = variationImagesByProduct.get(productId);
    if (varImages && varImages.length > 0) {
      imageMap.set(productId, varImages[0]!);
      continue;
    }
    const prodImg = productImages.find(img => img.productId === productId);
    if (prodImg) {
      const url = Array.isArray(prodImg.imageUrl) ? prodImg.imageUrl[0] : prodImg.imageUrl;
      if (url) imageMap.set(productId, url);
    }
  }

  const pricingMap = new Map<number, { price: number | null; inStock: boolean }>();
  for (const p of pricing) {
    pricingMap.set(Number(p.productId), {
      price: p.price ? Math.round(Number(p.price)) : null,
      inStock: Number(p.totalQuantity) > 0,
    });
  }

  return products.map(p => {
    const priceInfo = pricingMap.get(p.id) || { price: null, inStock: false };
    return {
      id: p.id,
      slug: slugify(p.name),
      name: p.name,
      brandName: p.brandName || null,
      primaryImage: imageMap.get(p.id) || null,
      price: priceInfo.price,
      inStock: priceInfo.inStock,
    };
  });
}

/**
 * Get category suggestions for autocomplete
 */
async function getCategorySuggestions(escapedQuery: string): Promise<CategorySuggestion[]> {
  const categories = await knex(tableNames.channelCategories)
    .select(
      `${tableNames.channelCategories}.id`,
      `${tableNames.channelCategories}.categoryName as name`,
      'parent.categoryName as parentName'
    )
    .leftJoin(
      `${tableNames.channelCategories} as parent`,
      `${tableNames.channelCategories}.parentCategoryId`,
      'parent.id'
    )
    .where(`${tableNames.channelCategories}.categoryName`, 'ILIKE', `%${escapedQuery}%`)
    // Filter to powersports categories
    .whereIn(`${tableNames.channelCategories}.id`, function () {
      // Get all category IDs that are descendants of powersports roots
      this.select('spc.channelCategoryId')
        .from(`${tableNames.storeProductCategories} as spc`)
        .join(`${tableNames.storeProducts} as sp`, 'spc.storeProductId', 'sp.id')
        .whereNull('sp.deactivatedAt')
        .whereIn('sp.id', function () {
          this.select('productId').distinct().from(tableNames.catalogueFeed);
        });
    })
    .orderByRaw(`
      CASE
        WHEN LOWER(${tableNames.channelCategories}."categoryName") = LOWER(?) THEN 0
        WHEN LOWER(${tableNames.channelCategories}."categoryName") LIKE LOWER(?) THEN 1
        ELSE 2
      END
    `, [escapedQuery, `${escapedQuery}%`])
    .limit(3);

  // Get product counts for each category
  const categoryIds = categories.map(c => c.id);
  if (categoryIds.length === 0) {
    return [];
  }

  const counts = await knex(tableNames.storeProductCategories)
    .select('channelCategoryId')
    .count('* as count')
    .whereIn('channelCategoryId', categoryIds)
    .groupBy('channelCategoryId');

  const countMap = new Map<number, number>();
  for (const c of counts) {
    countMap.set(Number(c.channelCategoryId), Number(c.count));
  }

  return categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: slugify(c.name),
    productCount: countMap.get(c.id) || 0,
    parentName: c.parentName || null,
  }));
}

// ============================================
// Reviews
// ============================================

/**
 * Get review aggregate (average rating, counts) for a product.
 * Cached for 5 minutes since aggregates change infrequently.
 */
export async function getReviewAggregate(productId: number): Promise<ReviewAggregate | null> {
  const cacheKey = `reviewAggregate:${productId}`;
  const cached = getCachedLong<ReviewAggregate | null>(cacheKey);
  if (cached !== null) return cached;

  const row = await knex(tableNames.reviewAggregates)
    .where({ productId, companyId: STOREFRONT_COMPANY_ID })
    .first();

  if (!row) {
    setCache(cacheKey, null);
    return null;
  }

  const aggregate: ReviewAggregate = {
    totalReviews: Number(row.totalReviews) || 0,
    averageRating: Number(row.averageRating) || 0,
    rating1Count: Number(row.rating1Count) || 0,
    rating2Count: Number(row.rating2Count) || 0,
    rating3Count: Number(row.rating3Count) || 0,
    rating4Count: Number(row.rating4Count) || 0,
    rating5Count: Number(row.rating5Count) || 0,
  };

  setCache(cacheKey, aggregate);
  return aggregate;
}

/**
 * Get paginated reviews for a product with images.
 */
export async function getProductReviews(
  productId: number,
  options: { page?: number; limit?: number; sort?: ReviewSortOption } = {}
): Promise<ReviewsResponse> {
  const page = options.page ?? 1;
  const limit = Math.min(options.limit ?? 10, 50);
  const sort = options.sort ?? 'newest';
  const offset = (page - 1) * limit;

  const cacheKey = `productReviews:${productId}:${page}:${limit}:${sort}`;
  const cached = getCached<ReviewsResponse>(cacheKey);
  if (cached) return cached;

  // Get aggregate in parallel with reviews
  const [aggregate, countResult, reviews] = await Promise.all([
    getReviewAggregate(productId),
    knex(tableNames.reviews)
      .where({ productId, companyId: STOREFRONT_COMPANY_ID })
      .whereNull('deletedAt')
      .count('* as total')
      .first(),
    knex(tableNames.reviews)
      .where({ productId, companyId: STOREFRONT_COMPANY_ID })
      .whereNull('deletedAt')
      .select('id', 'customerName', 'rating', 'title', 'content', 'verifiedPurchase', 'helpfulCount', 'createdAt')
      .modify((qb) => {
        switch (sort) {
          case 'oldest': qb.orderBy('createdAt', 'asc'); break;
          case 'highest': qb.orderBy('rating', 'desc').orderBy('createdAt', 'desc'); break;
          case 'lowest': qb.orderBy('rating', 'asc').orderBy('createdAt', 'desc'); break;
          case 'helpful': qb.orderBy('helpfulCount', 'desc').orderBy('createdAt', 'desc'); break;
          default: qb.orderBy('createdAt', 'desc'); break;
        }
      })
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(countResult?.total) || 0;

  // Fetch images for all reviews in one query
  const reviewIds = reviews.map((r: { id: number }) => r.id);
  const images = reviewIds.length > 0
    ? await knex(tableNames.reviewImages)
        .whereIn('reviewId', reviewIds)
        .select('id', 'reviewId', 'imageUrl', 'thumbnailUrl')
    : [];

  const imagesByReview = new Map<number, typeof images>();
  for (const img of images) {
    const existing = imagesByReview.get(img.reviewId) || [];
    existing.push(img);
    imagesByReview.set(img.reviewId, existing);
  }

  const result: ReviewsResponse = {
    reviews: reviews.map((r: any) => ({
      id: r.id,
      customerName: r.customerName || 'Anonymous',
      rating: Number(r.rating),
      title: r.title || null,
      content: r.content || '',
      verifiedPurchase: Boolean(r.verifiedPurchase),
      helpfulCount: Number(r.helpfulCount) || 0,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      images: (imagesByReview.get(r.id) || []).map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        thumbnailUrl: img.thumbnailUrl || null,
      })),
    })),
    aggregate: aggregate || {
      totalReviews: 0,
      averageRating: 0,
      rating1Count: 0,
      rating2Count: 0,
      rating3Count: 0,
      rating4Count: 0,
      rating5Count: 0,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  setCache(cacheKey, result);
  return result;
}

