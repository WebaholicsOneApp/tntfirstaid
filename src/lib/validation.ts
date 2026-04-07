/**
 * Input Validation Utilities
 * Security implementation for #6: Insufficient Input Validation
 */

// ============================================
// Constants
// ============================================

export const VALIDATION_LIMITS = {
  // String length constraints
  MAX_PRODUCT_NAME_LENGTH: 200,
  MAX_VARIATION_LENGTH: 200,
  MAX_EMAIL_LENGTH: 254, // RFC 5321
  MAX_URL_LENGTH: 2048,

  // Quantity constraints
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,

  // Price constraints (in cents)
  MIN_PRICE: 1, // At least 1 cent
  MAX_PRICE: 10000000, // $100,000 max per item

  // Cart constraints
  MAX_CART_ITEMS: 50,
} as const;

// ============================================
// Validation Result Type
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================
// Product ID Validation
// ============================================

export function validateProductId(productId: number): ValidationResult {
  if (!Number.isInteger(productId)) {
    return { valid: false, error: "Product ID must be an integer" };
  }

  if (productId <= 0) {
    return { valid: false, error: "Product ID must be positive" };
  }

  // Reasonable upper bound to prevent overflow attacks
  if (productId > Number.MAX_SAFE_INTEGER) {
    return { valid: false, error: "Product ID is too large" };
  }

  return { valid: true };
}

// ============================================
// Email Validation
// ============================================

// RFC 5322 compliant email regex (simplified but effective)
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Email cannot be empty" };
  }

  if (trimmed.length > VALIDATION_LIMITS.MAX_EMAIL_LENGTH) {
    return {
      valid: false,
      error: `Email cannot exceed ${VALIDATION_LIMITS.MAX_EMAIL_LENGTH} characters`,
    };
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

// ============================================
// URL Validation (for redirect URLs)
// ============================================

/**
 * Validates a redirect URL to prevent open redirect attacks.
 * Only allows URLs that match the site's origin or relative paths.
 */
export function validateRedirectUrl(
  url: string,
  allowedOrigin: string,
): ValidationResult {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "URL cannot be empty" };
  }

  if (trimmed.length > VALIDATION_LIMITS.MAX_URL_LENGTH) {
    return {
      valid: false,
      error: `URL cannot exceed ${VALIDATION_LIMITS.MAX_URL_LENGTH} characters`,
    };
  }

  // Block javascript: and data: URLs
  const lowerUrl = trimmed.toLowerCase();
  if (lowerUrl.startsWith("javascript:") || lowerUrl.startsWith("data:")) {
    return { valid: false, error: "Invalid URL scheme" };
  }

  // Allow relative URLs starting with /
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return { valid: true };
  }

  // For absolute URLs, verify they match the allowed origin
  try {
    const parsedUrl = new URL(trimmed);
    const parsedOrigin = new URL(allowedOrigin);

    // Normalize hostnames to handle www vs non-www
    const normalizeHost = (host: string) => host.replace(/^www\./, "");
    const urlHost = normalizeHost(parsedUrl.hostname);
    const originHost = normalizeHost(parsedOrigin.hostname);

    // Check protocol and normalized hostname match
    if (
      parsedUrl.protocol !== parsedOrigin.protocol ||
      urlHost !== originHost
    ) {
      return { valid: false, error: "URL must be on the same domain" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

// ============================================
// Checkout Item Validation
// ============================================

export interface CheckoutItem {
  productId: number;
  variationId?: number;
  name: string;
  variation?: string;
  price: number;
  quantity: number;
  manufacturerNo?: string;
  imageUrl?: string;
}

export function validateCheckoutItem(
  item: unknown,
  index: number,
): ValidationResult {
  if (!item || typeof item !== "object") {
    return { valid: false, error: `Item ${index + 1}: Invalid item format` };
  }

  const itemObj = item as Record<string, unknown>;

  // Validate productId
  if (
    typeof itemObj.productId !== "number" ||
    !Number.isInteger(itemObj.productId) ||
    itemObj.productId <= 0
  ) {
    return { valid: false, error: `Item ${index + 1}: Invalid product ID` };
  }

  // Validate variationId (optional)
  if (itemObj.variationId !== undefined && itemObj.variationId !== null) {
    if (
      typeof itemObj.variationId !== "number" ||
      !Number.isInteger(itemObj.variationId) ||
      itemObj.variationId <= 0
    ) {
      return { valid: false, error: `Item ${index + 1}: Invalid variation ID` };
    }
  }

  // Validate name
  if (typeof itemObj.name !== "string" || itemObj.name.trim().length === 0) {
    return {
      valid: false,
      error: `Item ${index + 1}: Product name is required`,
    };
  }
  if (itemObj.name.length > VALIDATION_LIMITS.MAX_PRODUCT_NAME_LENGTH) {
    return { valid: false, error: `Item ${index + 1}: Product name too long` };
  }

  // Validate variation (optional)
  if (
    itemObj.variation !== undefined &&
    itemObj.variation !== null &&
    itemObj.variation !== ""
  ) {
    if (typeof itemObj.variation !== "string") {
      return {
        valid: false,
        error: `Item ${index + 1}: Invalid variation format`,
      };
    }
    if (itemObj.variation.length > VALIDATION_LIMITS.MAX_VARIATION_LENGTH) {
      return {
        valid: false,
        error: `Item ${index + 1}: Variation text too long`,
      };
    }
  }

  // Validate price (must be positive integer in cents)
  if (typeof itemObj.price !== "number" || !Number.isInteger(itemObj.price)) {
    return { valid: false, error: `Item ${index + 1}: Invalid price format` };
  }
  if (
    itemObj.price < VALIDATION_LIMITS.MIN_PRICE ||
    itemObj.price > VALIDATION_LIMITS.MAX_PRICE
  ) {
    return {
      valid: false,
      error: `Item ${index + 1}: Price out of valid range`,
    };
  }

  // Validate quantity
  if (
    typeof itemObj.quantity !== "number" ||
    !Number.isInteger(itemObj.quantity)
  ) {
    return {
      valid: false,
      error: `Item ${index + 1}: Invalid quantity format`,
    };
  }
  if (
    itemObj.quantity < VALIDATION_LIMITS.MIN_QUANTITY ||
    itemObj.quantity > VALIDATION_LIMITS.MAX_QUANTITY
  ) {
    return {
      valid: false,
      error: `Item ${index + 1}: Quantity must be between ${VALIDATION_LIMITS.MIN_QUANTITY} and ${VALIDATION_LIMITS.MAX_QUANTITY}`,
    };
  }

  return { valid: true };
}

export function validateCheckoutItems(items: unknown): ValidationResult {
  if (!Array.isArray(items)) {
    return { valid: false, error: "Items must be an array" };
  }

  if (items.length === 0) {
    return { valid: false, error: "Cart is empty" };
  }

  if (items.length > VALIDATION_LIMITS.MAX_CART_ITEMS) {
    return {
      valid: false,
      error: `Cart cannot contain more than ${VALIDATION_LIMITS.MAX_CART_ITEMS} items`,
    };
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const result = validateCheckoutItem(items[i], i);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

// ============================================
// Sanitization Functions
// ============================================

/**
 * Sanitizes a string by trimming and removing control characters.
 * Does NOT escape HTML - use framework's built-in escaping for display.
 */
export function sanitizeString(str: string): string {
  if (typeof str !== "string") return "";

  // Remove control characters except common whitespace
  return str.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
