/**
 * In-Memory Rate Limiting
 *
 * Simple rate limiter that stores request counts in memory.
 * Sufficient for single-instance deployments.
 *
 * Note: Resets on server restart. For distributed rate limiting
 * across multiple instances, consider adding Redis support.
 */

// ============================================
// Configuration
// ============================================

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Checkout: 10 requests per minute per IP (prevent order spam)
  checkout: { requests: 10, windowSeconds: 60 },

  // General API: 100 requests per minute per IP
  api: { requests: 100, windowSeconds: 60 },

  // Search API: 120 requests per minute per IP (for autocomplete)
  search: { requests: 120, windowSeconds: 60 },

  // Strict: 5 requests per minute (for sensitive operations)
  strict: { requests: 5, windowSeconds: 60 },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

// ============================================
// In-Memory Store
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

// ============================================
// Rate Limit Interface
// ============================================

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
  limit: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (e.g., IP address)
 * @param type - Type of rate limit to apply
 * @returns Rate limit result with success status and remaining requests
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[type];
  const windowMs = config.windowSeconds * 1000;
  const now = Date.now();
  const key = `${type}:${identifier}`;

  let entry = rateLimitStore.get(key);

  // If no entry or window has passed, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      success: true,
      remaining: config.requests - 1,
      resetIn: config.windowSeconds,
      limit: config.requests,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.requests) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
      limit: config.requests,
    };
  }

  return {
    success: true,
    remaining: config.requests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
    limit: config.requests,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]!.trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Cloudflare
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Vercel
  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0]!.trim();
  }

  return 'unknown';
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${result.resetIn} seconds.`,
      retryAfter: result.resetIn,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.resetIn),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetIn),
      },
    }
  );
}
