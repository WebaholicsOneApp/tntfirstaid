/**
 * Next.js Middleware
 * Handles CORS preflight requests, security headers, and CSP nonce generation
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================
// CSP Nonce Generation (inlined to avoid import issues in Edge Runtime)
// ============================================

const CSP_NONCE_HEADER = 'x-csp-nonce';

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function buildCSPWithNonce(nonce: string, isProduction: boolean): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005';

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(isProduction ? [] : ["'unsafe-inline'", "'unsafe-eval'"]),
      'https://js.stripe.com',
      'https://maps.googleapis.com',
      'https://apis.google.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      siteUrl,
      'https://api.stripe.com',
      'https://maps.googleapis.com',
      'https://apis.google.com',
      'https://staging.oneapp.today',
      'https://oneapp.today',
      'https://api.zippopotam.us',
      ...(isProduction ? [] : ['http://localhost:*', 'ws://localhost:*']),
    ],
    'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com', 'https://www.google.com', 'https://maps.google.com', 'https://www.youtube-nocookie.com'],
    'frame-ancestors': ["'self'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
  };

  if (isProduction) {
    directives['upgrade-insecure-requests'] = [];
  }

  return Object.entries(directives)
    .map(([key, values]) => (values.length === 0 ? key : `${key} ${values.join(' ')}`))
    .join('; ');
}

function getSecurityHeaders(nonce: string, isProduction: boolean): Record<string, string> {
  const csp = buildCSPWithNonce(nonce, isProduction);

  return {
    [isProduction ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only']: csp,
    [CSP_NONCE_HEADER]: nonce,
    ...(isProduction ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' } : {}),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  };
}

// ============================================
// CORS Configuration (inlined to avoid import issues in middleware)
// ============================================

function getAllowedOrigins(): string[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005';
  const additionalOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];

  const origins = [
    siteUrl,
    ...additionalOrigins,
  ];

  // In development, allow localhost variants
  if (process.env.NODE_ENV !== 'production') {
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3005',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3005',
    );
  }

  return [...new Set(origins)];
}

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'Cache-Control',
];
const EXPOSED_HEADERS = ['Content-Length', 'X-Request-Id'];
const PREFLIGHT_MAX_AGE = 86400;

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes(origin)) return true;

  // Check wildcard patterns
  for (const allowed of allowedOrigins) {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\./g, '\\.').replace(/\*/g, '[^.]+');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(origin)) return true;
    }
  }

  return false;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Expose-Headers': EXPOSED_HEADERS.join(', '),
    'Access-Control-Max-Age': PREFLIGHT_MAX_AGE.toString(),
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

// ============================================
// Middleware Function
// ============================================

// Auth-protected routes (require customer token cookie)
const AUTH_PROTECTED = ['/account/dashboard', '/account/orders', '/account/security', '/account/profile'];
const AUTH_COOKIE = 'alpha-customer-token';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const pathname = request.nextUrl.pathname;
  const isProduction = process.env.NODE_ENV === 'production';

  // ---------- Auth route protection ----------
  const hasToken = request.cookies.has(AUTH_COOKIE);

  // Protected account pages: redirect to login if no token
  if (AUTH_PROTECTED.some((p) => pathname.startsWith(p)) && !hasToken) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  // Login page: redirect to dashboard if already authenticated
  if (pathname === '/account' && hasToken) {
    // Server components signal expired tokens via ?expired=1 to break redirect loops
    if (request.nextUrl.searchParams.get('expired') === '1') {
      const response = NextResponse.redirect(new URL('/account', request.url));
      response.cookies.delete(AUTH_COOKIE);
      return response;
    }
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/account/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Generate a new nonce for this request
  const nonce = generateNonce();

  // Handle API routes with CORS
  if (pathname.startsWith('/api/')) {
    // Check if origin is allowed
    const originAllowed = isOriginAllowed(origin);

    // Handle preflight (OPTIONS) requests
    if (request.method === 'OPTIONS') {
      if (!originAllowed && origin) {
        // Block unauthorized preflight
        return new NextResponse(
          JSON.stringify({
            error: 'Cross-origin request blocked: origin not allowed',
            code: 'CORS_ORIGIN_DENIED',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Return successful preflight response
      return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    // For non-preflight requests, check origin
    if (!originAllowed && origin) {
      return new NextResponse(
        JSON.stringify({
          error: 'Cross-origin request blocked: origin not allowed',
          code: 'CORS_ORIGIN_DENIED',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Add CORS headers to the response
    const response = NextResponse.next();

    if (origin) {
      const corsHeaders = getCorsHeaders(origin);
      for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
      }
    }

    return response;
  }

  // For non-API routes, apply security headers with CSP nonce
  const response = NextResponse.next();

  // Add security headers including CSP with nonce
  const securityHeaders = getSecurityHeaders(nonce, isProduction);
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Also set the nonce in request headers so it's accessible to Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CSP_NONCE_HEADER, nonce);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
    headers: response.headers,
  });
}

// ============================================
// Middleware Configuration
// ============================================

export const config = {
  matcher: [
    // Match all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|api/auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
