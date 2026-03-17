import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),

    // Database (legacy direct-DB approach — optional when using OneApp API)
    PG_HOST: z.string().optional(),
    PG_USER: z.string().optional(),
    PG_PASS: z.string().optional(),
    PG_DB: z.string().optional(),
    PG_PORT: z.string().default("5432"),
    PG_SSL_REJECT_UNAUTHORIZED: z.string().default("false"),

    // Stripe (server-side — optional when OneApp handles payments)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // Storefront IDs (legacy — optional when using OneApp API)
    STOREFRONT_COMPANY_ID: z.string().optional(),
    STOREFRONT_CHANNEL_ID: z.string().default("6"),
    STOREFRONT_STORE_ID: z.string().optional(),
    STORE_CHANNEL_ID: z.string().optional(),

    // Catalogue Feed
    CATALOGUE_FEED_TABLE: z.string().optional(),

    // OneApp Backend
    ONEAPP_API_URL: z.string().url(),
    ONEAPP_API_KEY: z.string().min(1),
    ONEAPP_WEBHOOK_SECRET: z.string().min(1),

    // Security
    ID_OBFUSCATION_SECRET: z.string().min(1),

    // Email
    RESEND_API_KEY: z.string().optional(),
    FROM_EMAIL: z.string().email().optional(),
    STORE_NAME: z.string().default("Alpha Munitions"),

    // CORS
    CORS_ALLOWED_ORIGINS: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_SITE_NAME: z.string().default("Alpha Munitions"),

    // Store contact info (optional — can be set via OneApp storefront branding instead)
    NEXT_PUBLIC_STORE_ADDRESS: z.string().optional(),
    NEXT_PUBLIC_STORE_PHONE: z.string().optional(),
    NEXT_PUBLIC_STORE_EMAIL: z.string().optional(),
    NEXT_PUBLIC_SUPPORT_EMAIL: z.string().optional(),
    NEXT_PUBLIC_STORE_HOURS: z.string().optional(),
    NEXT_PUBLIC_MAPS_QUERY: z.string().optional(),
    NEXT_PUBLIC_LOGO_URL: z.string().optional(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    // Database
    PG_HOST: process.env.PG_HOST,
    PG_USER: process.env.PG_USER,
    PG_PASS: process.env.PG_PASS,
    PG_DB: process.env.PG_DB,
    PG_PORT: process.env.PG_PORT,
    PG_SSL_REJECT_UNAUTHORIZED: process.env.PG_SSL_REJECT_UNAUTHORIZED,

    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

    // Storefront IDs
    STOREFRONT_COMPANY_ID: process.env.STOREFRONT_COMPANY_ID,
    STOREFRONT_CHANNEL_ID: process.env.STOREFRONT_CHANNEL_ID,
    STOREFRONT_STORE_ID: process.env.STOREFRONT_STORE_ID,
    STORE_CHANNEL_ID: process.env.STORE_CHANNEL_ID,

    // Catalogue Feed
    CATALOGUE_FEED_TABLE: process.env.CATALOGUE_FEED_TABLE,

    // OneApp Backend
    ONEAPP_API_URL: process.env.ONEAPP_API_URL,
    ONEAPP_API_KEY: process.env.ONEAPP_API_KEY,
    ONEAPP_WEBHOOK_SECRET: process.env.ONEAPP_WEBHOOK_SECRET,

    // Site
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,

    // Security
    ID_OBFUSCATION_SECRET: process.env.ID_OBFUSCATION_SECRET,

    // Email
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    STORE_NAME: process.env.STORE_NAME,

    // Store contact info
    NEXT_PUBLIC_STORE_ADDRESS: process.env.NEXT_PUBLIC_STORE_ADDRESS,
    NEXT_PUBLIC_STORE_PHONE: process.env.NEXT_PUBLIC_STORE_PHONE,
    NEXT_PUBLIC_STORE_EMAIL: process.env.NEXT_PUBLIC_STORE_EMAIL,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    NEXT_PUBLIC_STORE_HOURS: process.env.NEXT_PUBLIC_STORE_HOURS,
    NEXT_PUBLIC_MAPS_QUERY: process.env.NEXT_PUBLIC_MAPS_QUERY,
    NEXT_PUBLIC_LOGO_URL: process.env.NEXT_PUBLIC_LOGO_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
