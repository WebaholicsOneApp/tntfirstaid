/**
 * Security Headers Utility
 * Security implementation for #9: Missing Security Headers
 *
 * This module provides comprehensive security headers configuration
 * to protect against XSS, clickjacking, MIME sniffing, and other attacks.
 */

// ============================================
// Types
// ============================================

export interface CSPDirectives {
  "default-src"?: string[];
  "script-src"?: string[];
  "style-src"?: string[];
  "img-src"?: string[];
  "font-src"?: string[];
  "connect-src"?: string[];
  "media-src"?: string[];
  "object-src"?: string[];
  "frame-src"?: string[];
  "frame-ancestors"?: string[];
  "form-action"?: string[];
  "base-uri"?: string[];
  "manifest-src"?: string[];
  "worker-src"?: string[];
  "child-src"?: string[];
  "navigate-to"?: string[];
  "upgrade-insecure-requests"?: boolean;
  "block-all-mixed-content"?: boolean;
  "report-uri"?: string;
  "report-to"?: string;
}

export interface SecurityHeadersConfig {
  // Content Security Policy
  csp?: CSPDirectives;
  cspReportOnly?: boolean;

  // HTTP Strict Transport Security
  hsts?: {
    maxAge: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };

  // Frame options
  frameOptions?: "DENY" | "SAMEORIGIN";

  // Content type options
  contentTypeOptions?: boolean;

  // XSS Protection (legacy)
  xssProtection?: boolean;

  // Referrer Policy
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";

  // Permissions Policy
  permissionsPolicy?: Record<string, string[]>;

  // Cross-Origin policies
  crossOriginEmbedderPolicy?: "require-corp" | "credentialless" | "unsafe-none";
  crossOriginOpenerPolicy?:
    | "same-origin"
    | "same-origin-allow-popups"
    | "unsafe-none";
  crossOriginResourcePolicy?: "same-origin" | "same-site" | "cross-origin";
}

export interface SecurityHeader {
  key: string;
  value: string;
}

// ============================================
// Default Configuration
// ============================================

/**
 * Get the site URL for CSP configuration
 */
function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3005";
}

/**
 * Default CSP directives for a Next.js e-commerce application
 */
export function getDefaultCSPDirectives(): CSPDirectives {
  const siteUrl = getSiteUrl();
  const isProduction = process.env.NODE_ENV === "production";

  return {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      // Next.js requires unsafe-inline for development
      ...(isProduction ? [] : ["'unsafe-inline'", "'unsafe-eval'"]),
      // Stripe
      "https://js.stripe.com",
      // Authorize.net
      "https://js.authorize.net",
      "https://jstest.authorize.net",
      "https://maps.googleapis.com",
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for styled-components, Tailwind, etc.
    ],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "http:", // Allow HTTP images from suppliers
    ],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      siteUrl,
      // Stripe
      "https://api.stripe.com",
      // Authorize.net
      "https://api.authorize.net",
      "https://apitest.authorize.net",
      "https://jstest.authorize.net",
      "https://maps.googleapis.com",
      // Allow localhost in development
      ...(isProduction ? [] : ["http://localhost:*", "ws://localhost:*"]),
    ],
    "frame-src": [
      "'self'",
      "https://js.stripe.com",
      "https://hooks.stripe.com",
      "https://accept.authorize.net",
      "https://test.authorize.net",
    ],
    "frame-ancestors": ["'self'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": isProduction,
  };
}

/**
 * Default security headers configuration
 */
export function getDefaultConfig(): SecurityHeadersConfig {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    csp: getDefaultCSPDirectives(),
    cspReportOnly: !isProduction, // Report-only in development
    hsts: isProduction
      ? {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        }
      : undefined,
    frameOptions: "DENY",
    contentTypeOptions: true,
    xssProtection: true,
    referrerPolicy: "strict-origin-when-cross-origin",
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      "interest-cohort": [], // Block FLoC
      payment: [
        "self",
        "https://js.stripe.com",
        "https://js.authorize.net",
        "https://jstest.authorize.net",
      ],
    },
    crossOriginEmbedderPolicy: "unsafe-none", // Required for cross-origin images
    crossOriginOpenerPolicy: "same-origin-allow-popups", // Allow Stripe popups
    crossOriginResourcePolicy: "cross-origin", // Allow cross-origin resources
  };
}

// ============================================
// CSP Builder
// ============================================

/**
 * Builds a CSP string from directives
 */
export function buildCSP(directives: CSPDirectives): string {
  const parts: string[] = [];

  for (const [directive, value] of Object.entries(directives)) {
    if (value === undefined) continue;

    if (typeof value === "boolean") {
      if (value) {
        parts.push(directive);
      }
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        parts.push(`${directive} ${value.join(" ")}`);
      }
    } else if (typeof value === "string") {
      parts.push(`${directive} ${value}`);
    }
  }

  return parts.join("; ");
}

/**
 * Merges CSP directives, with overrides taking precedence
 */
export function mergeCSPDirectives(
  base: CSPDirectives,
  overrides: Partial<CSPDirectives>,
): CSPDirectives {
  const merged: CSPDirectives = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;

    const directive = key as keyof CSPDirectives;

    if (Array.isArray(value) && Array.isArray(merged[directive])) {
      // Merge arrays, removing duplicates
      merged[directive] = [
        ...new Set([...(merged[directive] as string[]), ...value]),
      ] as any;
    } else {
      (merged as any)[directive] = value;
    }
  }

  return merged;
}

/**
 * Validates CSP directives
 */
export function validateCSP(directives: CSPDirectives): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for dangerous directives
  const scriptSrc = directives["script-src"] || [];
  if (
    scriptSrc.includes("'unsafe-inline'") &&
    process.env.NODE_ENV === "production"
  ) {
    errors.push(
      "Warning: 'unsafe-inline' in script-src weakens CSP protection",
    );
  }
  if (
    scriptSrc.includes("'unsafe-eval'") &&
    process.env.NODE_ENV === "production"
  ) {
    errors.push("Warning: 'unsafe-eval' in script-src weakens CSP protection");
  }

  // Check for missing critical directives
  if (!directives["default-src"]) {
    errors.push("Error: 'default-src' directive is required");
  }

  // Check frame-ancestors for clickjacking protection
  if (!directives["frame-ancestors"]) {
    errors.push(
      "Warning: 'frame-ancestors' not set, clickjacking protection may be incomplete",
    );
  }

  return {
    valid: errors.filter((e) => e.startsWith("Error:")).length === 0,
    errors,
  };
}

// ============================================
// Permissions Policy Builder
// ============================================

/**
 * Builds a Permissions-Policy header value
 */
export function buildPermissionsPolicy(
  policies: Record<string, string[]>,
): string {
  const parts: string[] = [];

  for (const [feature, allowList] of Object.entries(policies)) {
    if (allowList.length === 0) {
      parts.push(`${feature}=()`);
    } else {
      const sources = allowList
        .map((s) => (s === "self" ? "self" : `"${s}"`))
        .join(" ");
      parts.push(`${feature}=(${sources})`);
    }
  }

  return parts.join(", ");
}

// ============================================
// Header Generation
// ============================================

/**
 * Generates all security headers from configuration
 */
export function generateSecurityHeaders(
  config: SecurityHeadersConfig = getDefaultConfig(),
): SecurityHeader[] {
  const headers: SecurityHeader[] = [];

  // Content Security Policy
  if (config.csp) {
    const cspValue = buildCSP(config.csp);
    const cspKey = config.cspReportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";
    headers.push({ key: cspKey, value: cspValue });
  }

  // HTTP Strict Transport Security
  if (config.hsts) {
    let hstsValue = `max-age=${config.hsts.maxAge}`;
    if (config.hsts.includeSubDomains) {
      hstsValue += "; includeSubDomains";
    }
    if (config.hsts.preload) {
      hstsValue += "; preload";
    }
    headers.push({ key: "Strict-Transport-Security", value: hstsValue });
  }

  // X-Frame-Options
  if (config.frameOptions) {
    headers.push({ key: "X-Frame-Options", value: config.frameOptions });
  }

  // X-Content-Type-Options
  if (config.contentTypeOptions) {
    headers.push({ key: "X-Content-Type-Options", value: "nosniff" });
  }

  // X-XSS-Protection
  if (config.xssProtection) {
    headers.push({ key: "X-XSS-Protection", value: "1; mode=block" });
  }

  // Referrer-Policy
  if (config.referrerPolicy) {
    headers.push({ key: "Referrer-Policy", value: config.referrerPolicy });
  }

  // Permissions-Policy
  if (config.permissionsPolicy) {
    headers.push({
      key: "Permissions-Policy",
      value: buildPermissionsPolicy(config.permissionsPolicy),
    });
  }

  // Cross-Origin-Embedder-Policy
  if (config.crossOriginEmbedderPolicy) {
    headers.push({
      key: "Cross-Origin-Embedder-Policy",
      value: config.crossOriginEmbedderPolicy,
    });
  }

  // Cross-Origin-Opener-Policy
  if (config.crossOriginOpenerPolicy) {
    headers.push({
      key: "Cross-Origin-Opener-Policy",
      value: config.crossOriginOpenerPolicy,
    });
  }

  // Cross-Origin-Resource-Policy
  if (config.crossOriginResourcePolicy) {
    headers.push({
      key: "Cross-Origin-Resource-Policy",
      value: config.crossOriginResourcePolicy,
    });
  }

  return headers;
}

/**
 * Generates headers in Next.js config format
 */
export function getNextJsHeaders(
  config?: SecurityHeadersConfig,
): Array<{ key: string; value: string }> {
  return generateSecurityHeaders(config);
}

// ============================================
// Header Validation
// ============================================

export interface HeaderValidationResult {
  header: string;
  present: boolean;
  valid: boolean;
  value?: string;
  recommendation?: string;
}

/**
 * Validates security headers from a response
 */
export function validateSecurityHeaders(
  headers: Record<string, string>,
): HeaderValidationResult[] {
  const results: HeaderValidationResult[] = [];

  // Check CSP
  const csp =
    headers["content-security-policy"] ||
    headers["content-security-policy-report-only"];
  results.push({
    header: "Content-Security-Policy",
    present: !!csp,
    valid: !!csp && csp.includes("default-src"),
    value: csp,
    recommendation: !csp ? "Add CSP to prevent XSS attacks" : undefined,
  });

  // Check HSTS
  const hsts = headers["strict-transport-security"];
  results.push({
    header: "Strict-Transport-Security",
    present: !!hsts,
    valid: !!hsts && hsts.includes("max-age"),
    value: hsts,
    recommendation: !hsts ? "Add HSTS for HTTPS enforcement" : undefined,
  });

  // Check X-Frame-Options
  const frameOptions = headers["x-frame-options"];
  results.push({
    header: "X-Frame-Options",
    present: !!frameOptions,
    valid:
      !!frameOptions &&
      ["DENY", "SAMEORIGIN"].includes(frameOptions.toUpperCase()),
    value: frameOptions,
    recommendation: !frameOptions
      ? "Add X-Frame-Options to prevent clickjacking"
      : undefined,
  });

  // Check X-Content-Type-Options
  const contentType = headers["x-content-type-options"];
  results.push({
    header: "X-Content-Type-Options",
    present: !!contentType,
    valid: contentType?.toLowerCase() === "nosniff",
    value: contentType,
    recommendation: !contentType
      ? "Add nosniff to prevent MIME sniffing"
      : undefined,
  });

  // Check Referrer-Policy
  const referrer = headers["referrer-policy"];
  results.push({
    header: "Referrer-Policy",
    present: !!referrer,
    valid: !!referrer,
    value: referrer,
    recommendation: !referrer
      ? "Add Referrer-Policy to control referrer info"
      : undefined,
  });

  // Check Permissions-Policy
  const permissions = headers["permissions-policy"];
  results.push({
    header: "Permissions-Policy",
    present: !!permissions,
    valid: !!permissions,
    value: permissions,
    recommendation: !permissions
      ? "Add Permissions-Policy to restrict browser features"
      : undefined,
  });

  return results;
}

/**
 * Calculates a security score based on headers present
 */
export function calculateSecurityScore(headers: Record<string, string>): {
  score: number;
  maxScore: number;
  percentage: number;
  grade: "A" | "B" | "C" | "D" | "F";
} {
  const results = validateSecurityHeaders(headers);

  // Weighted scoring
  const weights: Record<string, number> = {
    "Content-Security-Policy": 30,
    "Strict-Transport-Security": 20,
    "X-Frame-Options": 15,
    "X-Content-Type-Options": 10,
    "Referrer-Policy": 10,
    "Permissions-Policy": 15,
  };

  let score = 0;
  let maxScore = 0;

  for (const result of results) {
    const weight = weights[result.header] || 10;
    maxScore += weight;
    if (result.present && result.valid) {
      score += weight;
    } else if (result.present) {
      score += weight * 0.5; // Partial credit for present but invalid
    }
  }

  const percentage = Math.round((score / maxScore) * 100);

  let grade: "A" | "B" | "C" | "D" | "F";
  if (percentage >= 90) grade = "A";
  else if (percentage >= 80) grade = "B";
  else if (percentage >= 70) grade = "C";
  else if (percentage >= 60) grade = "D";
  else grade = "F";

  return { score, maxScore, percentage, grade };
}

// ============================================
// Nonce Generation (for inline scripts)
// ============================================

/**
 * Generates a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return Buffer.from(crypto.randomUUID()).toString("base64");
  }
  // Fallback for environments without crypto.randomUUID
  const array = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Last resort: Math.random (not cryptographically secure)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.from(array).toString("base64");
}

/**
 * Adds a nonce to CSP script-src directive
 */
export function addNonceToCSP(
  directives: CSPDirectives,
  nonce: string,
): CSPDirectives {
  const scriptSrc = directives["script-src"] || ["'self'"];
  return {
    ...directives,
    "script-src": [...scriptSrc, `'nonce-${nonce}'`],
  };
}

// ============================================
// Presets
// ============================================

/**
 * Strict CSP preset (most secure, may break some functionality)
 */
export function getStrictCSP(): CSPDirectives {
  return {
    "default-src": ["'self'"],
    "script-src": ["'self'"],
    "style-src": ["'self'"],
    "img-src": ["'self'", "data:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'"],
    "frame-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": true,
    "block-all-mixed-content": true,
  };
}

/**
 * E-commerce CSP preset (balanced security for online stores)
 */
export function getEcommerceCSP(): CSPDirectives {
  return getDefaultCSPDirectives();
}

/**
 * Development CSP preset (relaxed for local development)
 */
export function getDevelopmentCSP(): CSPDirectives {
  return {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:", "http:"],
    "font-src": ["'self'", "data:", "https:"],
    "connect-src": [
      "'self'",
      "http://localhost:*",
      "ws://localhost:*",
      "https:",
    ],
    "frame-src": ["'self'", "https:"],
    "frame-ancestors": ["'self'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
  };
}

// ============================================
// Statistics
// ============================================

let headerStats = {
  generated: 0,
  validated: 0,
  cspBuilds: 0,
};

export function recordHeaderGeneration(): void {
  headerStats.generated++;
}

export function recordHeaderValidation(): void {
  headerStats.validated++;
}

export function recordCSPBuild(): void {
  headerStats.cspBuilds++;
}

export function getHeaderStats(): typeof headerStats {
  return { ...headerStats };
}

export function resetHeaderStats(): void {
  headerStats = {
    generated: 0,
    validated: 0,
    cspBuilds: 0,
  };
}
