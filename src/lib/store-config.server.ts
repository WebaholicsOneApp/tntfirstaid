/**
 * Server-only store config that merges DB branding with env defaults.
 * Do NOT import this file from client components -- it uses the database.
 */
import { getStorefrontBranding } from './db';
import { storeConfig, type StoreConfig } from './store-config';

export async function getStoreConfig(): Promise<StoreConfig> {
  let branding: Awaited<ReturnType<typeof getStorefrontBranding>>;
  try {
    branding = await getStorefrontBranding();
  } catch {
    branding = {};
  }
  const phone = branding.storePhone || storeConfig.phone;
  return {
    ...storeConfig,
    ...(branding.siteName && { siteName: branding.siteName }),
    ...(branding.storeAddress && { address: branding.storeAddress }),
    ...(branding.storePhone && { phone, phoneHref: `tel:${phone.replace(/[\s()-]/g, '')}` }),
    ...(branding.storeEmail && { email: branding.storeEmail }),
    ...(branding.supportEmail && { supportEmail: branding.supportEmail }),
    ...(branding.storeHours && { hours: branding.storeHours }),
    ...(branding.mapsQuery && { mapsQuery: branding.mapsQuery }),
    ...(branding.logoUrl && { logoUrl: branding.logoUrl }),
    ...(branding.primaryColor && { primaryColor: branding.primaryColor }),
    ...(branding.secondaryColor && { secondaryColor: branding.secondaryColor }),
  };
}
