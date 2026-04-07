/**
 * Search utilities for smart query parsing
 */

export interface ParsedSearch {
  type: "sku" | "keyword";
  keywords: string;
  original: string;
}

/**
 * Parse a search query and detect its type (SKU or keyword)
 */
export function parseSearchQuery(query: string): ParsedSearch {
  const trimmed = query.trim();

  // Default result
  const result: ParsedSearch = {
    type: "keyword",
    keywords: trimmed,
    original: trimmed,
  };

  if (!trimmed) {
    return result;
  }

  // SKU check (first priority)
  if (/^\d{5,}$/.test(trimmed) || /^[A-Z]{1,4}[-]?\d{5,}$/i.test(trimmed)) {
    result.type = "sku";
    return result;
  }

  return result;
}

/**
 * Check if a search query looks like a SKU
 */
export function isSku(query: string): boolean {
  const trimmed = query.trim();
  return /^\d{5,}$/.test(trimmed) || /^[A-Z]{1,4}[-]?\d{5,}$/i.test(trimmed);
}
