import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),

    // Stripe (server-side — optional when OneApp handles payments)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

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

    // Dev checkout bypass (never enable in production)
    DEV_CHECKOUT_BYPASS: z.string().optional(),
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

    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

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

    // Dev checkout bypass
    DEV_CHECKOUT_BYPASS: process.env.DEV_CHECKOUT_BYPASS,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
