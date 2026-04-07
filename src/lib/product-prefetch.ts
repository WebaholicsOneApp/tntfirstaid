/**
 * Lightweight client-side cache for product detail prefetching.
 * Used by ProductCard (hover) and QuickAddModal (open).
 */

interface CacheEntry {
  promise: Promise<unknown>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function prefetchProduct(slug: string): void {
  const existing = cache.get(slug);
  if (existing && Date.now() - existing.timestamp < CACHE_TTL) return;

  const promise = fetch(`/api/products/${slug}`)
    .then((res) => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    })
    .catch((err) => {
      cache.delete(slug); // Clear failed entries
      throw err;
    });

  cache.set(slug, { promise, timestamp: Date.now() });
}

export function getCachedProduct<T = unknown>(slug: string): Promise<T> | null {
  const entry = cache.get(slug);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(slug);
    return null;
  }
  return entry.promise as Promise<T>;
}
