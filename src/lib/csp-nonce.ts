/**
 * CSP Nonce Utilities
 * Generates and manages Content Security Policy nonces for inline scripts
 *
 * A nonce (number used once) is a cryptographically secure random value
 * that allows specific inline scripts to execute while blocking others.
 */

/**
 * Generates a cryptographically secure nonce
 * Uses Web Crypto API for security
 *
 * @returns Base64-encoded random nonce string
 */
export function generateNonce(): string {
  // Generate 16 bytes of random data (128 bits)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  // Convert to base64
  return btoa(String.fromCharCode(...array));
}

/**
 * Header name used to pass nonce from middleware to components
 */
export const CSP_NONCE_HEADER = 'x-csp-nonce';

/**
 * Builds CSP directives with nonce support
 *
 * @param nonce - The nonce value to include
 * @param isProduction - Whether running in production
 * @returns CSP header value string
 */
export function buildCSPWithNonce(nonce: string, isProduction: boolean): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005';

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      // Strict dynamic allows scripts loaded by nonced scripts
      "'strict-dynamic'",
      // Fallbacks for browsers that don't support nonce
      ...(isProduction ? [] : ["'unsafe-inline'"]),
      'https://js.stripe.com',
      'https://maps.googleapis.com',
      'https://apis.google.com',
    ],
    'style-src': [
      "'self'",
      // Styles often need unsafe-inline for CSS-in-JS
      "'unsafe-inline'",
    ],
    'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      siteUrl,
      'https://api.stripe.com',
      'https://maps.googleapis.com',
      'https://apis.google.com',
      ...(isProduction ? [] : ['http://localhost:*', 'ws://localhost:*']),
    ],
    'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com', 'https://www.google.com'],
    'frame-ancestors': ["'self'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
  };

  // Add upgrade-insecure-requests in production
  if (isProduction) {
    directives['upgrade-insecure-requests'] = [];
  }

  // Build the CSP string
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Security headers to apply alongside CSP
 */
export function getSecurityHeaders(nonce: string, isProduction: boolean): Record<string, string> {
  const csp = buildCSPWithNonce(nonce, isProduction);

  return {
    // CSP - use report-only in development for easier debugging
    [isProduction ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only']: csp,
    // Pass nonce to application
    [CSP_NONCE_HEADER]: nonce,
    // HSTS - only in production
    ...(isProduction
      ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' }
      : {}),
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',
    // XSS protection for legacy browsers
    'X-XSS-Protection': '1; mode=block',
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  };
}
