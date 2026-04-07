/**
 * OneApp Storefront API Client
 *
 * Thin HTTP client that calls OneApp storefront API endpoints.
 * Replaces direct database access with API calls to OneApp.
 *
 * Features:
 * - Authenticated requests via X-Storefront-Api-Key header
 * - 10s default timeout with AbortController
 * - Retry logic for transient failures (503, network errors)
 * - In-memory cache with TTL for GET requests
 * - Typed response helpers for every storefront endpoint
 */

const ONEAPP_API_URL = process.env.ONEAPP_API_URL || "http://localhost:3001";
const ONEAPP_API_KEY = process.env.ONEAPP_API_KEY || "";
const IS_BUILD_PHASE = process.env.NEXT_PHASE === "phase-production-build";

const DEFAULT_TIMEOUT = 10_000; // 10 seconds
const MAX_RETRIES = 1;
const RETRY_DELAY = 500; // ms base delay (multiplied by attempt number, with jitter)

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/** Default cache TTL: 60 seconds */
const DEFAULT_CACHE_TTL = 60_000;

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

/** In-flight request coalescing — concurrent calls to the same key share one promise. */
const pendingRequests = new Map<string, Promise<unknown>>();

/** Clear the entire cache or a single key. */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
    pendingRequests.delete(key);
  } else {
    cache.clear();
    pendingRequests.clear();
  }
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Core client
// ---------------------------------------------------------------------------

type HttpMethod = "GET" | "POST";

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  timeout?: number;
  customerToken?: string;
}

class StorefrontApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = `${ONEAPP_API_URL}/api/v2/storefront`;
    this.apiKey = ONEAPP_API_KEY;
  }

  // ---- low-level ----

  private async request<T>(
    method: HttpMethod,
    path: string,
    options?: RequestOptions,
  ): Promise<T> {
    const {
      params,
      body,
      timeout = DEFAULT_TIMEOUT,
      customerToken,
    } = options || {};

    // During Vercel build, the OneApp API is unreachable. Fail fast so
    // callers hit their existing fallback paths immediately instead of
    // waiting through 10s timeout × 3 attempts per page.
    if (IS_BUILD_PHASE) {
      throw new Error(`Skipped API call during build: ${method} ${path}`);
    }

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Storefront-Api-Key": this.apiKey,
    };

    if (customerToken) {
      headers["X-Customer-Token"] = customerToken;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Client errors (4xx) -- no retry
        if (response.status >= 400 && response.status < 500) {
          const errorBody = await response.json().catch(() => ({}));
          throw new ApiClientError(
            (errorBody as Record<string, string>).error ||
              `API error: ${response.status}`,
            response.status,
          );
        }

        // Server errors (5xx) -- retry on 503 specifically, or any 5xx on last attempt
        if (!response.ok) {
          if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY * (attempt + 1));
            continue;
          }
          const errorBody = await response.json().catch(() => ({}));
          throw new ApiClientError(
            (errorBody as Record<string, string>).error ||
              `API error: ${response.status}`,
            response.status,
          );
        }

        return (await response.json()) as T;
      } catch (error: unknown) {
        clearTimeout(timeoutId);

        if (error instanceof ApiClientError) throw error;

        lastError = error instanceof Error ? error : new Error(String(error));

        if (error instanceof Error && error.name === "AbortError") {
          lastError = new Error(
            `Request timed out after ${timeout}ms: ${method} ${path}`,
          );
        }

        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY * (attempt + 1));
          continue;
        }
      }
    }

    throw (
      lastError ||
      new Error(`Failed after ${MAX_RETRIES + 1} attempts: ${method} ${path}`)
    );
  }

  // ---- public HTTP verbs ----

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
  ): Promise<T> {
    return this.request<T>("GET", path, { params });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, { body });
  }

  // ---- cached GET helper ----

  /**
   * GET with in-memory caching.
   * @param path    API path (e.g. "/config")
   * @param params  Optional query params
   * @param ttl     Cache TTL in ms (default 60 000)
   */
  async getCached<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
    ttl: number = DEFAULT_CACHE_TTL,
  ): Promise<T> {
    const cacheKey = buildCacheKey(path, params);
    const cached = getCached<T>(cacheKey);
    if (cached !== undefined) return cached;

    // Coalesce concurrent requests for the same cache key
    const pending = pendingRequests.get(cacheKey);
    if (pending) return pending as Promise<T>;

    const promise = this.get<T>(path, params)
      .then((data) => {
        setCache(cacheKey, data, ttl);
        pendingRequests.delete(cacheKey);
        return data;
      })
      .catch((err) => {
        pendingRequests.delete(cacheKey);
        throw err;
      });

    pendingRequests.set(cacheKey, promise);
    return promise;
  }

  // --------------------------------------------------------------------------
  // Storefront Config
  // --------------------------------------------------------------------------

  /** GET /config -- storefront branding, settings, etc. */
  getConfig<T = unknown>() {
    return this.getCached<T>("/config", undefined, 5 * 60_000); // 5 min TTL
  }

  /** GET /home -- homepage data (hero, featured products, etc.) */
  getHomePage<T = unknown>() {
    return this.getCached<T>("/home", undefined, 60_000);
  }

  // --------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------

  /** GET /products -- list with optional filters, pagination, sorting */
  getProducts<T = unknown>(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    [key: string]: string | number | boolean | undefined | null;
  }) {
    return this.getCached<T>(
      "/products",
      params as Record<string, string | number | boolean | undefined | null>,
    );
  }

  /** GET /products/:slug */
  getProductBySlug<T = unknown>(slug: string) {
    return this.getCached<T>(`/products/${encodeURIComponent(slug)}`);
  }

  /** GET /products/:id/recommendations */
  getRecommendations<T = unknown>(productId: number) {
    return this.getCached<T>(`/products/${productId}/recommendations`);
  }

  // --------------------------------------------------------------------------
  // Categories
  // --------------------------------------------------------------------------

  /** GET /categories/top (flat list of root categories with products) */
  getCategories<T = unknown>() {
    return this.getCached<T>("/categories/top", undefined, 5 * 60_000);
  }

  /** GET /categories/tree */
  getCategoryTree<T = unknown>() {
    return this.getCached<T>("/categories/tree", undefined, 5 * 60_000);
  }

  /** GET /categories/top */
  getTopCategories<T = unknown>() {
    return this.getCached<T>("/categories/top", undefined, 5 * 60_000);
  }

  /** GET /categories/:slug */
  getCategoryBySlug<T = unknown>(slug: string) {
    return this.getCached<T>(
      `/categories/${encodeURIComponent(slug)}`,
      undefined,
      5 * 60_000,
    );
  }

  /** GET /categories/:id/hierarchy */
  getCategoryHierarchy<T = unknown>(categoryId: number) {
    return this.getCached<T>(
      `/categories/${categoryId}/hierarchy`,
      undefined,
      5 * 60_000,
    );
  }

  /** GET /categories/:id/descendants */
  getCategoryDescendants<T = unknown>(categoryId: number) {
    return this.getCached<T>(
      `/categories/${categoryId}/descendants`,
      undefined,
      5 * 60_000,
    );
  }

  // --------------------------------------------------------------------------
  // Search
  // --------------------------------------------------------------------------

  /** GET /products/search?q=... (full-text search with relevance ranking) */
  searchProductsFts<T = unknown>(
    params: Record<string, string | number | boolean | undefined | null>,
  ) {
    return this.getCached<T>("/products/search", params, 30_000);
  }

  /** GET /search/suggestions?q=... */
  getSearchSuggestions<T = unknown>(query: string) {
    return this.get<T>("/search/suggestions", { q: query });
  }

  /** GET /search/price-range */
  getPriceRange<T = unknown>(
    params?: Record<string, string | number | boolean | undefined | null>,
  ) {
    return this.getCached<T>("/search/price-range", params, 5 * 60_000);
  }

  // --------------------------------------------------------------------------
  // Orders
  // --------------------------------------------------------------------------

  /** GET /orders/session/:sessionId */
  getOrderBySession<T = unknown>(sessionId: string) {
    return this.get<T>(`/orders/session/${encodeURIComponent(sessionId)}`);
  }

  /** POST /orders/sync */
  syncOrder<T = unknown>(body: unknown) {
    return this.post<T>("/orders/sync", body);
  }

  /** POST /orders/fulfillment-webhook */
  fulfillmentWebhook<T = unknown>(body: unknown) {
    return this.post<T>("/orders/fulfillment-webhook", body);
  }

  // --------------------------------------------------------------------------
  // Reviews
  // --------------------------------------------------------------------------

  /** GET /reviews/feed */
  getReviewsFeed<T = unknown>(
    params?: Record<string, string | number | boolean | undefined | null>,
  ) {
    return this.getCached<T>("/reviews/feed", params);
  }

  /** GET /reviews/product/:productId */
  getProductReviews<T = unknown>(
    productId: number,
    params?: Record<string, string | number | boolean | undefined | null>,
  ) {
    return this.getCached<T>(`/reviews/product/${productId}`, params);
  }

  /** GET /reviews/product/:productId/images */
  getProductReviewImages<T = unknown>(productId: number) {
    return this.getCached<T>(`/reviews/product/${productId}/images`);
  }

  /** POST /reviews/submit */
  submitReview<T = unknown>(body: unknown) {
    return this.post<T>("/reviews/submit", body);
  }

  /** POST /reviews/helpful */
  markReviewHelpful<T = unknown>(body: unknown) {
    return this.post<T>("/reviews/helpful", body);
  }

  /** POST /reviews/upload */
  uploadReviewImage<T = unknown>(body: unknown) {
    return this.post<T>("/reviews/upload", body);
  }

  /** GET /reviews/validate-token */
  validateReviewToken<T = unknown>(
    params?: Record<string, string | number | boolean | undefined | null>,
  ) {
    return this.get<T>("/reviews/validate-token", params);
  }

  /** POST /reviews/unsubscribe */
  unsubscribeReviews<T = unknown>(body: unknown) {
    return this.post<T>("/reviews/unsubscribe", body);
  }

  // --------------------------------------------------------------------------
  // Contact
  // --------------------------------------------------------------------------

  /** POST /contact */
  submitContactForm<T = unknown>(body: unknown) {
    return this.post<T>("/contact", body);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCacheKey(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  let key = path;
  if (params) {
    const sorted = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    if (sorted) key += `?${sorted}`;
  }
  return key;
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _client: StorefrontApiClient | null = null;

export function getApiClient(): StorefrontApiClient {
  if (!_client) {
    _client = new StorefrontApiClient();
  }
  return _client;
}

export type { StorefrontApiClient };
export default getApiClient;
