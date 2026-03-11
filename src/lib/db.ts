/**
 * Database Connection for Storefront
 * Connects to the same PostgreSQL database as OneApp
 * Read-only access for product data
 */
import knex, { type Knex } from 'knex';

// Validate required environment variables
const requiredEnvVars = ['PG_HOST', 'PG_USER', 'PG_PASS', 'PG_DB', 'PG_PORT'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: Missing environment variable ${envVar}`);
  }
}

/**
 * SSL Configuration for PostgreSQL
 *
 * Security: SSL certificate verification is ENABLED by default to prevent
 * man-in-the-middle attacks. This ensures encrypted and authenticated connections.
 *
 * Environment Variables:
 * - PG_SSL_ENABLED: Set to 'false' to disable SSL entirely (NOT recommended for production)
 * - PG_SSL_REJECT_UNAUTHORIZED: Set to 'false' ONLY for development with self-signed certs
 * - PG_SSL_CA: Base64-encoded CA certificate for custom certificate authorities
 *
 * For Azure PostgreSQL: SSL is required and certificates are verified against
 * Azure's trusted certificate chain.
 */
function getSSLConfig(): boolean | { rejectUnauthorized: boolean; ca?: string; servername?: string } {
  const pgHost = process.env.PG_HOST || '';
  const isProduction = process.env.NODE_ENV === 'production';

  // Check if SSL should be disabled entirely
  if (process.env.PG_SSL_ENABLED === 'false') {
    if (isProduction) {
      console.warn('WARNING: SSL is disabled in production. This is a security risk!');
    }
    return false;
  }

  // Check if this is a cloud-hosted database that requires SSL
  const requiresSSL = pgHost.includes('azure') ||
                      pgHost.includes('amazonaws') ||
                      pgHost.includes('cloud') ||
                      pgHost.includes('digitalocean') ||
                      pgHost.includes('supabase');

  if (!requiresSSL && !isProduction) {
    // Local development without SSL requirement
    return false;
  }

  // Build SSL configuration with certificate verification ENABLED
  const sslConfig: { rejectUnauthorized: boolean; ca?: string; servername?: string } = {
    // SECURITY: Always verify certificates to prevent MITM attacks
    rejectUnauthorized: true,
    // SNI (Server Name Indication) for proper certificate validation
    servername: pgHost,
  };

  // Allow override for development with self-signed certificates ONLY
  if (process.env.PG_SSL_REJECT_UNAUTHORIZED === 'false') {
    // Check if this is actual production runtime vs just build time
    // During `npm run build`, NODE_ENV is 'production' but we're not actually running in prod
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
    const isActualProduction = isProduction && !isBuildTime && !process.env.VERCEL_ENV;

    if (isActualProduction) {
      // NEVER allow disabling certificate verification in actual production runtime
      console.error('SECURITY ERROR: Cannot disable SSL certificate verification in production!');
      console.error('Remove PG_SSL_REJECT_UNAUTHORIZED or set it to "true"');
      throw new Error('Invalid SSL configuration for production environment');
    }
    if (isBuildTime) {
      console.warn('Build time: SSL certificate verification disabled for local build');
    } else {
      console.warn('WARNING: SSL certificate verification is disabled. Only use this for development!');
    }
    sslConfig.rejectUnauthorized = false;
  }

  // Support custom CA certificate (useful for private PKI or specific cloud providers)
  if (process.env.PG_SSL_CA) {
    try {
      // CA certificate should be base64 encoded in the environment variable
      sslConfig.ca = Buffer.from(process.env.PG_SSL_CA, 'base64').toString('utf-8');
    } catch {
      console.error('Failed to decode PG_SSL_CA. Ensure it is base64 encoded.');
      throw new Error('Invalid PG_SSL_CA certificate format');
    }
  }

  return sslConfig;
}

// Database configuration - matches OneApp config
// Serverless pool config — tuned for Vercel where each instance gets its own pool.
const dbConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    database: process.env.PG_DB,
    port: Number(process.env.PG_PORT) || 5432,
    ssl: getSSLConfig(),
  },
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 8000,
    createTimeoutMillis: 8000,
    idleTimeoutMillis: 10000,
    reapIntervalMillis: 1000,
    // Set statement_timeout on every new connection to kill runaway queries
    afterCreate: (conn: unknown, done: (err: Error | null, conn: unknown) => void) => {
      const pgConn = conn as { query: (sql: string, cb: (err: Error | null) => void) => void };
      pgConn.query('SET statement_timeout = 10000;', (err) => {
        done(err, conn);
      });
    },
  },
};

// Create singleton database instance using globalThis to survive Next.js hot reloads
const globalForDb = globalThis as unknown as {
  __pgKnex?: Knex;
  __dbLoggingAttached?: boolean;
  __dbQueryStartTimes?: Map<string, number>;
};
const SLOW_DB_QUERY_MS = 400;

function attachDbLogging(instance: Knex): void {
  if (globalForDb.__dbLoggingAttached) return;

  if (!globalForDb.__dbQueryStartTimes) {
    globalForDb.__dbQueryStartTimes = new Map<string, number>();
  }

  instance.on('query', (queryData: { __knexQueryUid?: string }) => {
    if (!queryData.__knexQueryUid) return;
    globalForDb.__dbQueryStartTimes!.set(String(queryData.__knexQueryUid), Date.now());
  });

  instance.on('query-response', (_response: unknown, queryData: { __knexQueryUid?: string; sql?: string }) => {
    if (!queryData.__knexQueryUid) return;
    const queryId = String(queryData.__knexQueryUid);
    const startedAt = globalForDb.__dbQueryStartTimes!.get(queryId);
    globalForDb.__dbQueryStartTimes!.delete(queryId);
    if (!startedAt) return;

    const durationMs = Date.now() - startedAt;
    if (durationMs >= SLOW_DB_QUERY_MS) {
      console.warn('[DB] Slow query', {
        durationMs,
        sqlPreview: queryData.sql?.slice(0, 180),
      });
    }
  });

  instance.on('query-error', (error: unknown, queryData: { __knexQueryUid?: string; sql?: string }) => {
    const queryId = queryData.__knexQueryUid ? String(queryData.__knexQueryUid) : '';
    const startedAt = queryId ? globalForDb.__dbQueryStartTimes!.get(queryId) : undefined;
    if (queryId) {
      globalForDb.__dbQueryStartTimes!.delete(queryId);
    }

    console.error('[DB] Query error', {
      durationMs: startedAt ? Date.now() - startedAt : undefined,
      sqlPreview: queryData.sql?.slice(0, 180),
      error,
    });
  });

  globalForDb.__dbLoggingAttached = true;
}

function getDb(): Knex {
  if (!globalForDb.__pgKnex) {
    globalForDb.__pgKnex = knex(dbConfig);
    attachDbLogging(globalForDb.__pgKnex);
  }
  return globalForDb.__pgKnex;
}

// Export for direct use
export const pgKnex = getDb();

// Catalogue feed table name — read from env var per environment
export const CATALOGUE_FEED_TABLE = process.env.CATALOGUE_FEED_TABLE
  || (() => {
    console.error('CATALOGUE_FEED_TABLE environment variable is not set — queries to the catalogue feed will fail');
    return 'catalogue_feed_not_configured';
  })();

// Table names - matches constants/db.ts from OneApp
export const tableNames = {
  // Catalogue Feed
  catalogueFeed: CATALOGUE_FEED_TABLE,

  // Products
  storeProducts: 'store_products',
  variations: 'variations',
  variationImages: 'variation_images',
  productImages: 'product_images',
  storeProductCategories: 'store_product_categories',
  storeProductComponents: 'store_product_components',

  // Categories & Brands
  channelCategories: 'channel_categories',
  masterBrands: 'master_brands',
  brands: 'brands',
  companyBrands: 'company_brands',

  // Listings
  storeListings: 'store_listings',

  // Inventory
  manufacturerSuppliers: 'manufacturer_suppliers',

  // Stores
  stores: 'stores',
  storeChannels: 'store_channels',

  // CRM
  crmContacts: 'crm_contacts',
  crmContactContexts: 'crm_contact_contexts',
  crmConversations: 'crm_conversations',
  crmMessages: 'crm_messages',

  // Reviews
  reviews: 'reviews',
  reviewImages: 'review_images',
  reviewAggregates: 'review_aggregates',
  reviewEmailLog: 'review_email_log',
} as const;

// Company ID for this storefront - only show products from this company
export const STOREFRONT_COMPANY_ID = process.env.STOREFRONT_COMPANY_ID
  ? Number(process.env.STOREFRONT_COMPANY_ID)
  : (() => {
      console.error('STOREFRONT_COMPANY_ID environment variable is required');
      return 0;
    })();

// Store ID for this storefront - filters to a specific store within the company
export const STOREFRONT_STORE_ID = process.env.STOREFRONT_STORE_ID
  ? Number(process.env.STOREFRONT_STORE_ID)
  : null;

// Channel ID for this storefront - determines which sales channel orders go to
export const STOREFRONT_CHANNEL_ID = process.env.STOREFRONT_CHANNEL_ID
  ? Number(process.env.STOREFRONT_CHANNEL_ID)
  : (() => {
      console.error('STOREFRONT_CHANNEL_ID environment variable is required');
      return 0;
    })();

// Store channel row ID - used to read per-channel config (e.g., branding)
export const STORE_CHANNEL_ID = process.env.STORE_CHANNEL_ID
  ? Number(process.env.STORE_CHANNEL_ID)
  : null;

// Cached storefront branding from store_channels.metaData.storefrontBranding
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

let _cachedBranding: StorefrontBrandingConfig | null = null;
let _brandingCacheTime = 0;
const BRANDING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getStorefrontBranding(): Promise<StorefrontBrandingConfig> {
  const now = Date.now();
  if (_cachedBranding !== null && (now - _brandingCacheTime) < BRANDING_CACHE_TTL) {
    return _cachedBranding;
  }
  if (!STORE_CHANNEL_ID) return {};
  try {
    const row = await pgKnex('store_channels').where('id', STORE_CHANNEL_ID).first('metaData');
    const metaData = row?.metaData as Record<string, unknown> | undefined;
    const branding = (metaData?.storefrontBranding as StorefrontBrandingConfig) || {};
    _cachedBranding = branding;
    _brandingCacheTime = now;
    return branding;
  } catch {
    return _cachedBranding || {};
  }
}

export function clearBrandingCache(): void {
  _cachedBranding = null;
  _brandingCacheTime = 0;
}

// Cached policy templates from store_channels.metaData.policyTemplates
export interface PolicyTemplatesConfig {
  privacy_policy?: Record<string, unknown>;
  terms_of_service?: Record<string, unknown>;
  shipping_returns?: Record<string, unknown>;
}

let _cachedPolicyTemplates: PolicyTemplatesConfig | null = null;
let _policyCacheTime = 0;
const POLICY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getPolicyTemplates(): Promise<PolicyTemplatesConfig> {
  const now = Date.now();
  if (_cachedPolicyTemplates !== null && (now - _policyCacheTime) < POLICY_CACHE_TTL) {
    return _cachedPolicyTemplates;
  }
  if (!STORE_CHANNEL_ID) return {};
  try {
    const row = await pgKnex('store_channels').where('id', STORE_CHANNEL_ID).first('metaData');
    const metaData = row?.metaData as Record<string, unknown> | undefined;
    const templates = (metaData?.policyTemplates as PolicyTemplatesConfig) || {};
    _cachedPolicyTemplates = templates;
    _policyCacheTime = now;
    return templates;
  } catch {
    return _cachedPolicyTemplates || {};
  }
}

export function clearPolicyCache(): void {
  _cachedPolicyTemplates = null;
  _policyCacheTime = 0;
}

// Helper to close connection (for graceful shutdown)
export async function closeDb(): Promise<void> {
  if (globalForDb.__pgKnex) {
    await globalForDb.__pgKnex.destroy();
    globalForDb.__pgKnex = undefined;
  }
}

export default pgKnex;
