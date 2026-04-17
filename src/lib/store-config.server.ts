/**
 * Server-only store config that merges DB branding with env defaults.
 * Do NOT import this file from client components -- it uses the database.
 *
 * Wrapped with React.cache() so that generateMetadata() and the layout/page
 * component share the same result within a single request (request-level dedup
 * on top of the API client's in-memory TTL cache).
 */
import { cache } from "react";
import { getStorefrontBranding } from "./db";
import { storeConfig, type StoreConfig } from "./store-config";

export const getStoreConfig = cache(async (): Promise<StoreConfig> => {
  let branding: Awaited<ReturnType<typeof getStorefrontBranding>>;
  try {
    branding = await getStorefrontBranding();
  } catch {
    branding = {};
  }
  return {
    ...storeConfig,
    // Logo: only override when toggle is ON
    ...(branding.overrideLogo &&
      branding.logoUrl && { logoUrl: branding.logoUrl }),
    // Colors: only override when toggle is ON
    ...(branding.overrideColors &&
      branding.primaryColor && { primaryColor: branding.primaryColor }),
    ...(branding.overrideColors &&
      branding.secondaryColor && { secondaryColor: branding.secondaryColor }),
    // Store info: only override when toggle is ON
    ...(branding.overrideStoreInfo &&
      branding.siteName && { siteName: branding.siteName }),
    ...(branding.overrideStoreInfo &&
      branding.storeAddress && { address: branding.storeAddress }),
    ...(branding.overrideStoreInfo &&
      branding.storePhone && { phone: branding.storePhone }),
    ...(branding.overrideStoreInfo &&
      branding.storeEmail && { email: branding.storeEmail }),
    ...(branding.overrideStoreInfo &&
      branding.supportEmail && { supportEmail: branding.supportEmail }),
    ...(branding.overrideStoreInfo &&
      branding.storeHours && { hours: branding.storeHours }),
    ...(branding.overrideStoreInfo &&
      branding.mapsQuery && { mapsQuery: branding.mapsQuery }),
  };
});
