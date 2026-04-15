/**
 * Download URL mapping for known downloadable products.
 * Provides fallback URLs when the OneApp API doesn't include downloadUrl in product metaData.
 */

const DOWNLOAD_MAP: Record<string, string> = {};

/** Known downloadable product names (for matching order items without slugs) */
const DOWNLOAD_NAME_MAP: Record<string, string> = {};

export function getDownloadUrl(slug: string): string | null {
  return DOWNLOAD_MAP[slug] ?? null;
}

export function getDownloadUrlByName(name: string): string | null {
  return DOWNLOAD_NAME_MAP[name] ?? null;
}

export function isKnownDownloadable(slug: string): boolean {
  return slug in DOWNLOAD_MAP;
}
