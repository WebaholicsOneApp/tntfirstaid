/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
      { protocol: 'https', hostname: 'cdn.alphamunitions.com' },
      { protocol: 'https', hostname: 'alphamunitions.com' },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  reactStrictMode: true,
  // Externalize Knex optional DB drivers for webpack bundling
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3',
        'sqlite3': 'commonjs sqlite3',
        'tedious': 'commonjs tedious',
        'mysql': 'commonjs mysql',
        'mysql2': 'commonjs mysql2',
        'oracledb': 'commonjs oracledb',
        'pg-query-stream': 'commonjs pg-query-stream',
      });
    }
    return config;
  },
  // Turbopack also needs these marked as external
  serverExternalPackages: [
    'pg', 'pg-native', 'pg-query-stream', 'knex',
    'better-sqlite3', 'sqlite3', 'tedious',
    'mysql', 'mysql2', 'oracledb',
  ],
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/products', destination: '/shop', permanent: true },
      { source: '/products/:slug', destination: '/product/:slug', permanent: true },
    ];
  },
};

export default config;
