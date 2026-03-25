/**
 * Storefront Config Service
 *
 * All data access goes through the OneApp Storefront API (see api-client.ts).
 * This file provides branding, policy, and cache-clearing functions.
 * No database credentials or Knex required.
 */

import { getApiClient, clearCache } from './api-client';

// ---------------------------------------------------------------------------
// API config response shape (subset we care about)
// ---------------------------------------------------------------------------

interface StorefrontApiConfig {
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  contact?: {
    email?: string;
    supportEmail?: string;
    phone?: string;
    address?: string;
    storeHours?: string;
    mapsQuery?: string;
  };
  siteName?: string;
  policies?: {
    privacyPolicy?: Record<string, unknown>;
    termsOfService?: Record<string, unknown>;
    shippingPolicy?: Record<string, unknown>;
    returnPolicy?: Record<string, unknown>;
  };
  features?: {
    customerAuthEnabled?: boolean;
  };
}

// ---------------------------------------------------------------------------
// StorefrontBrandingConfig — mapped from API /config response
// ---------------------------------------------------------------------------

export interface StorefrontBrandingConfig {
  siteName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  supportEmail?: string;
  storeHours?: string;
  mapsQuery?: string;
}

export async function getStorefrontBranding(): Promise<StorefrontBrandingConfig> {
  try {
    const config = await getApiClient().getConfig<StorefrontApiConfig>();
    const branding = config.branding || {};
    const contact = config.contact || {};
    return {
      siteName: config.siteName,
      logoUrl: branding.logoUrl,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      storeAddress: contact.address,
      storePhone: contact.phone,
      storeEmail: contact.email,
      supportEmail: contact.supportEmail,
      storeHours: contact.storeHours,
      mapsQuery: contact.mapsQuery,
    };
  } catch (error) {
    console.error('[db.ts] Failed to fetch storefront branding via API:', error);
    return {};
  }
}

export function clearBrandingCache(): void {
  clearCache('/config');
}

// ---------------------------------------------------------------------------
// PolicyTemplatesConfig — mapped from API /config response
// ---------------------------------------------------------------------------

export interface PolicyTemplatesConfig {
  privacy_policy?: Record<string, unknown>;
  terms_of_service?: Record<string, unknown>;
  shipping_returns?: Record<string, unknown>;
}

export async function getPolicyTemplates(): Promise<PolicyTemplatesConfig> {
  try {
    const config = await getApiClient().getConfig<StorefrontApiConfig>();
    const policies = config.policies || {};
    return {
      privacy_policy: policies.privacyPolicy ?? undefined,
      terms_of_service: policies.termsOfService ?? undefined,
      shipping_returns: policies.shippingPolicy ?? policies.returnPolicy ?? undefined,
    };
  } catch (error) {
    console.error('[db.ts] Failed to fetch policy templates via API:', error);
    return {};
  }
}

export function clearPolicyCache(): void {
  clearCache('/config');
}

// ---------------------------------------------------------------------------
// Customer Auth Feature Flag
// ---------------------------------------------------------------------------

export async function getCustomerAuthEnabled(): Promise<boolean> {
  try {
    const config = await getApiClient().getConfig<StorefrontApiConfig>();
    return !!config.features?.customerAuthEnabled;
  } catch {
    return false;
  }
}
