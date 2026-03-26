/**
 * CORS Configuration Utility
 * Security implementation for #8: No CORS Protection
 *
 * This module provides CORS (Cross-Origin Resource Sharing) configuration
 * to prevent unauthorized cross-origin API access.
 */

// ============================================
// Configuration
// ============================================

/**
 * Allowed origins for CORS requests
 * In production, this should be restricted to your actual domains
 */
export function getAllowedOrigins(): string[] {
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
      'https://localhost:3000',
      'https://localhost:3001',
      'https://localhost:3005',
      'https://localhost:3443',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3005',
      'https://127.0.0.1:3000',
      'https://127.0.0.1:3001',
      'https://127.0.0.1:3005',
      'https://127.0.0.1:3443',
    );
  }

  return [...new Set(origins)]; // Remove duplicates
}

/**
 * Allowed HTTP methods for CORS
 */
export const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] as const;
export type AllowedMethod = typeof ALLOWED_METHODS[number];

/**
 * Allowed headers for CORS requests
 */
export const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'Cache-Control',
] as const;

/**
 * Headers exposed to the client
 */
export const EXPOSED_HEADERS = [
  'Content-Length',
  'X-Request-Id',
] as const;

/**
 * Preflight cache duration in seconds (24 hours)
 */
export const PREFLIGHT_MAX_AGE = 86400;

// ============================================
// CORS Validation
// ============================================

/**
 * Validates if an origin is allowed
 * @param origin - The origin to validate
 * @returns Whether the origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    // Requests without origin (same-origin, curl, etc.) are allowed
    return true;
  }

  const allowedOrigins = getAllowedOrigins();

  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check wildcard patterns (e.g., https://*.example.com)
  for (const allowed of allowedOrigins) {
    if (allowed.includes('*')) {
      const pattern = allowed
        .replace(/\./g, '\\.')
        .replace(/\*/g, '[^.]+');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(origin)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates if a method is allowed
 * @param method - The HTTP method to validate
 * @returns Whether the method is allowed
 */
export function isMethodAllowed(method: string): boolean {
  return ALLOWED_METHODS.includes(method.toUpperCase() as AllowedMethod);
}

/**
 * Validates if a header is allowed
 * @param header - The header name to validate
 * @returns Whether the header is allowed
 */
export function isHeaderAllowed(header: string): boolean {
  const normalizedHeader = header.toLowerCase();
  return ALLOWED_HEADERS.some(h => h.toLowerCase() === normalizedHeader);
}

/**
 * Validates all requested headers
 * @param requestedHeaders - Comma-separated list of headers
 * @returns Whether all headers are allowed
 */
export function areHeadersAllowed(requestedHeaders: string | null): boolean {
  if (!requestedHeaders) {
    return true;
  }

  const headers = requestedHeaders.split(',').map(h => h.trim());
  return headers.every(isHeaderAllowed);
}

// ============================================
// CORS Headers Generation
// ============================================

export interface CorsHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Expose-Headers': string;
  'Access-Control-Max-Age': string;
  'Access-Control-Allow-Credentials': string;
  'Vary': string;
}

/**
 * Generates CORS headers for a request
 * @param origin - The request origin
 * @returns CORS headers object or null if origin not allowed
 */
export function getCorsHeaders(origin: string | null): CorsHeaders | null {
  if (!isOriginAllowed(origin)) {
    return null;
  }

  // Use the actual origin or '*' if no origin (same-origin request)
  const allowOrigin = origin || '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Expose-Headers': EXPOSED_HEADERS.join(', '),
    'Access-Control-Max-Age': PREFLIGHT_MAX_AGE.toString(),
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

/**
 * Generates headers for a preflight (OPTIONS) response
 * @param origin - The request origin
 * @param requestMethod - The requested method (Access-Control-Request-Method)
 * @param requestHeaders - The requested headers (Access-Control-Request-Headers)
 * @returns Headers and status for preflight response
 */
export function handlePreflight(
  origin: string | null,
  requestMethod: string | null,
  requestHeaders: string | null
): { headers: CorsHeaders | null; allowed: boolean; reason?: string } {
  // Validate origin
  if (!isOriginAllowed(origin)) {
    return {
      headers: null,
      allowed: false,
      reason: `Origin '${origin}' is not allowed`,
    };
  }

  // Validate method
  if (requestMethod && !isMethodAllowed(requestMethod)) {
    return {
      headers: null,
      allowed: false,
      reason: `Method '${requestMethod}' is not allowed`,
    };
  }

  // Validate headers
  if (!areHeadersAllowed(requestHeaders)) {
    return {
      headers: null,
      allowed: false,
      reason: `Some requested headers are not allowed`,
    };
  }

  const headers = getCorsHeaders(origin);
  return {
    headers,
    allowed: true,
  };
}

// ============================================
// Next.js Configuration Helpers
// ============================================

/**
 * Generates CORS headers configuration for next.config.js
 * Use this in the headers() function of next.config.js
 */
export function getNextConfigCorsHeaders(): Array<{ key: string; value: string }> {
  return [
    {
      key: 'Access-Control-Allow-Methods',
      value: ALLOWED_METHODS.join(', '),
    },
    {
      key: 'Access-Control-Allow-Headers',
      value: ALLOWED_HEADERS.join(', '),
    },
    {
      key: 'Access-Control-Expose-Headers',
      value: EXPOSED_HEADERS.join(', '),
    },
    {
      key: 'Access-Control-Max-Age',
      value: PREFLIGHT_MAX_AGE.toString(),
    },
    {
      key: 'Vary',
      value: 'Origin',
    },
  ];
}

// ============================================
// Error Response Helpers
// ============================================

export interface CorsError {
  error: string;
  code: 'CORS_ORIGIN_DENIED' | 'CORS_METHOD_DENIED' | 'CORS_HEADERS_DENIED';
  allowed?: string[];
}

/**
 * Creates a CORS error response
 */
export function createCorsError(
  code: CorsError['code'],
  details?: string
): CorsError {
  const errors: Record<CorsError['code'], string> = {
    CORS_ORIGIN_DENIED: 'Cross-origin request blocked: origin not allowed',
    CORS_METHOD_DENIED: 'Cross-origin request blocked: method not allowed',
    CORS_HEADERS_DENIED: 'Cross-origin request blocked: headers not allowed',
  };

  return {
    error: details || errors[code],
    code,
    allowed: code === 'CORS_METHOD_DENIED' ? [...ALLOWED_METHODS] : undefined,
  };
}

// ============================================
// Statistics (for monitoring)
// ============================================

let corsStats = {
  allowed: 0,
  blocked: 0,
  preflightAllowed: 0,
  preflightBlocked: 0,
};

export function recordCorsRequest(allowed: boolean, isPreflight: boolean = false): void {
  if (isPreflight) {
    if (allowed) {
      corsStats.preflightAllowed++;
    } else {
      corsStats.preflightBlocked++;
    }
  } else {
    if (allowed) {
      corsStats.allowed++;
    } else {
      corsStats.blocked++;
    }
  }
}

export function getCorsStats(): typeof corsStats {
  return { ...corsStats };
}

export function resetCorsStats(): void {
  corsStats = {
    allowed: 0,
    blocked: 0,
    preflightAllowed: 0,
    preflightBlocked: 0,
  };
}
