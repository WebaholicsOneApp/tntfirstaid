/**
 * ID Obfuscation Utility
 * Security implementation for #7: Exposed Database Structure
 *
 * This module provides secure encoding/decoding of database IDs to prevent:
 * - Sequential ID enumeration attacks
 * - Database structure exposure
 * - Information leakage about record counts
 */

import crypto from 'crypto';

// ============================================
// Configuration
// ============================================

// Secret key for ID obfuscation - should be set in environment
const OBFUSCATION_SECRET = process.env.ID_OBFUSCATION_SECRET || 'default-secret-change-in-production-32chars';

// Minimum secret length for security
const MIN_SECRET_LENGTH = 16;

// ID prefixes for different entity types (makes IDs self-documenting for debugging)
export const ID_PREFIXES = {
  ORDER: 'ord',
  ORDER_ITEM: 'oit',
  PRODUCT: 'prd',
  VARIATION: 'var',
  CATEGORY: 'cat',
  BRAND: 'brd',
  USER: 'usr',
  GENERIC: 'id',
} as const;

export type IdPrefix = typeof ID_PREFIXES[keyof typeof ID_PREFIXES];

// ============================================
// Validation
// ============================================

/**
 * Validates that the obfuscation secret meets security requirements
 */
export function validateSecret(): { valid: boolean; error?: string } {
  if (!OBFUSCATION_SECRET || OBFUSCATION_SECRET === 'default-secret-change-in-production-32chars') {
    if (process.env.NODE_ENV === 'production') {
      return { valid: false, error: 'ID_OBFUSCATION_SECRET must be set in production' };
    }
  }

  if (OBFUSCATION_SECRET.length < MIN_SECRET_LENGTH) {
    return { valid: false, error: `ID_OBFUSCATION_SECRET must be at least ${MIN_SECRET_LENGTH} characters` };
  }

  return { valid: true };
}

// ============================================
// Core Obfuscation Functions
// ============================================

/**
 * Encodes a numeric database ID into an opaque public ID
 *
 * Algorithm:
 * 1. Convert ID to string
 * 2. Create HMAC signature using secret
 * 3. Combine ID with truncated signature
 * 4. Base64url encode the result
 * 5. Prepend entity prefix
 *
 * @param id - The numeric database ID
 * @param prefix - Entity type prefix
 * @returns Opaque public ID string
 */
export function encodeId(id: number, prefix: IdPrefix = ID_PREFIXES.GENERIC): string {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID must be a positive integer');
  }

  // Create signature to prevent tampering
  const idStr = id.toString();
  const hmac = crypto.createHmac('sha256', OBFUSCATION_SECRET);
  hmac.update(`${prefix}:${idStr}`);
  const signature = hmac.digest();

  // Take first 8 bytes of signature for compactness
  const shortSig = signature.subarray(0, 8);

  // Combine ID bytes with signature
  const idBuffer = Buffer.from(idStr, 'utf8');
  const combined = Buffer.concat([
    Buffer.from([idBuffer.length]), // Length prefix (1 byte)
    idBuffer,
    shortSig,
  ]);

  // Base64url encode (URL-safe, no padding)
  const encoded = combined.toString('base64url');

  return `${prefix}_${encoded}`;
}

/**
 * Decodes an opaque public ID back to the numeric database ID
 *
 * @param publicId - The opaque public ID string
 * @param expectedPrefix - Expected entity type prefix (for validation)
 * @returns The original numeric ID, or null if invalid/tampered
 */
export function decodeId(publicId: string, expectedPrefix?: IdPrefix): number | null {
  try {
    // Parse prefix and encoded part
    const underscoreIndex = publicId.indexOf('_');
    if (underscoreIndex === -1) {
      return null;
    }

    const prefix = publicId.substring(0, underscoreIndex) as IdPrefix;
    const encoded = publicId.substring(underscoreIndex + 1);

    // Validate prefix if expected
    if (expectedPrefix && prefix !== expectedPrefix) {
      return null;
    }

    // Validate base64url string - should only contain valid characters
    // and have length that corresponds to complete encoded bytes
    if (!/^[A-Za-z0-9_-]+$/.test(encoded)) {
      return null;
    }

    // Base64url: 4 characters encode 3 bytes
    // Valid lengths: 4n, 4n+2, 4n+3 (not 4n+1)
    const mod4 = encoded.length % 4;
    if (mod4 === 1) {
      return null;
    }

    // Decode base64url
    const combined = Buffer.from(encoded, 'base64url');

    // Verify the encoded length matches expected decoded length
    // This catches cases where extra characters were appended
    const expectedEncodedLength = Math.ceil(combined.length * 4 / 3);
    // Account for base64url not using padding, so length can vary by 0-2
    if (Math.abs(encoded.length - expectedEncodedLength) > 2) {
      return null;
    }

    if (combined.length < 10) { // Minimum: 1 (length) + 1 (id) + 8 (sig)
      return null;
    }

    // Extract ID length and ID
    const idLength = combined[0]!;
    if (idLength < 1 || idLength > 20) { // Reasonable bounds for ID string length
      return null;
    }

    // Strict length check - must be exactly the expected size
    const expectedLength = 1 + idLength + 8;
    if (combined.length !== expectedLength) {
      return null;
    }

    const idBuffer = combined.subarray(1, 1 + idLength);
    const providedSig = combined.subarray(1 + idLength, 1 + idLength + 8);

    const idStr = idBuffer.toString('utf8');
    const id = parseInt(idStr, 10);

    if (isNaN(id) || id <= 0) {
      return null;
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', OBFUSCATION_SECRET);
    hmac.update(`${prefix}:${idStr}`);
    const expectedSig = hmac.digest().subarray(0, 8);

    if (!crypto.timingSafeEqual(providedSig, expectedSig)) {
      return null; // Signature mismatch - tampered or wrong secret
    }

    return id;
  } catch {
    return null;
  }
}

// ============================================
// Batch Operations
// ============================================

/**
 * Encodes multiple IDs at once
 */
export function encodeIds(ids: number[], prefix: IdPrefix = ID_PREFIXES.GENERIC): string[] {
  return ids.map(id => encodeId(id, prefix));
}

/**
 * Decodes multiple public IDs at once
 * Returns null for any invalid IDs
 */
export function decodeIds(publicIds: string[], expectedPrefix?: IdPrefix): (number | null)[] {
  return publicIds.map(id => decodeId(id, expectedPrefix));
}

// ============================================
// Entity-Specific Helpers
// ============================================

export const encodeOrderId = (id: number) => encodeId(id, ID_PREFIXES.ORDER);
export const decodeOrderId = (publicId: string) => decodeId(publicId, ID_PREFIXES.ORDER);

export const encodeOrderItemId = (id: number) => encodeId(id, ID_PREFIXES.ORDER_ITEM);
export const decodeOrderItemId = (publicId: string) => decodeId(publicId, ID_PREFIXES.ORDER_ITEM);

export const encodeProductId = (id: number) => encodeId(id, ID_PREFIXES.PRODUCT);
export const decodeProductId = (publicId: string) => decodeId(publicId, ID_PREFIXES.PRODUCT);

export const encodeVariationId = (id: number) => encodeId(id, ID_PREFIXES.VARIATION);
export const decodeVariationId = (publicId: string) => decodeId(publicId, ID_PREFIXES.VARIATION);

export const encodeCategoryId = (id: number) => encodeId(id, ID_PREFIXES.CATEGORY);
export const decodeCategoryId = (publicId: string) => decodeId(publicId, ID_PREFIXES.CATEGORY);

export const encodeBrandId = (id: number) => encodeId(id, ID_PREFIXES.BRAND);
export const decodeBrandId = (publicId: string) => decodeId(publicId, ID_PREFIXES.BRAND);

// ============================================
// Object Transformation Helpers
// ============================================

/**
 * Transforms an object by encoding specified ID fields
 *
 * @param obj - The object to transform
 * @param idFields - Map of field names to their prefixes
 * @returns New object with encoded IDs
 */
export function encodeObjectIds<T extends Record<string, any>>(
  obj: T,
  idFields: Record<string, IdPrefix>
): T {
  const result = { ...obj };

  for (const [field, prefix] of Object.entries(idFields)) {
    if (field in result && typeof result[field] === 'number' && result[field] > 0) {
      (result as any)[field] = encodeId(result[field], prefix);
    }
  }

  return result;
}

/**
 * Transforms an array of objects by encoding specified ID fields
 */
export function encodeArrayIds<T extends Record<string, any>>(
  arr: T[],
  idFields: Record<string, IdPrefix>
): T[] {
  return arr.map(obj => encodeObjectIds(obj, idFields));
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Checks if a string looks like an obfuscated ID
 */
export function isObfuscatedId(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const prefixes = Object.values(ID_PREFIXES);
  return prefixes.some(prefix => value.startsWith(`${prefix}_`));
}

/**
 * Extracts the prefix from an obfuscated ID
 */
export function getIdPrefix(publicId: string): IdPrefix | null {
  if (!publicId || typeof publicId !== 'string') {
    return null;
  }

  const underscoreIndex = publicId.indexOf('_');
  if (underscoreIndex === -1) {
    return null;
  }

  const prefix = publicId.substring(0, underscoreIndex);
  const prefixes = Object.values(ID_PREFIXES);

  if (prefixes.includes(prefix as IdPrefix)) {
    return prefix as IdPrefix;
  }

  return null;
}
