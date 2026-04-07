/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks by sanitizing untrusted HTML content
 *
 * This module uses DOMPurify in the browser and a text-only fallback on the server.
 * This avoids SSR runtime dependency issues while keeping output safe.
 */
import createDOMPurify from "dompurify";

// ============================================
// Sanitization Configurations
// ============================================

/**
 * Allowed tags for product descriptions
 * Permits basic formatting but blocks dangerous elements
 */
const PRODUCT_DESCRIPTION_CONFIG = {
  ALLOWED_TAGS: [
    // Text formatting
    "p",
    "br",
    "b",
    "i",
    "strong",
    "em",
    "u",
    "s",
    "sub",
    "sup",
    // Headings (limited)
    "h3",
    "h4",
    "h5",
    "h6",
    // Lists
    "ul",
    "ol",
    "li",
    // Links
    "a",
    // Tables (for spec sheets)
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    // Other safe elements
    "span",
    "div",
    "blockquote",
    "hr",
  ],
  ALLOWED_ATTR: [
    "href",
    "target",
    "rel",
    "title",
    "class",
    // Table attributes
    "colspan",
    "rowspan",
  ],
  // Force all links to open in new tab with security attributes
  ADD_ATTR: ["target", "rel"],
  // Block dangerous URL schemes
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  // Don't allow data: URIs
  ALLOW_DATA_ATTR: false,
};

/**
 * Strict configuration for user-generated content
 * Only allows basic text formatting
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: ["p", "br", "b", "i", "strong", "em"],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
};

/**
 * Configuration that strips ALL HTML, leaving only text
 */
const TEXT_ONLY_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

const browserDOMPurify =
  typeof window !== "undefined" ? createDOMPurify(window) : null;

function stripTagsToText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeHtml(
  html: string,
  config:
    | typeof PRODUCT_DESCRIPTION_CONFIG
    | typeof STRICT_CONFIG
    | typeof TEXT_ONLY_CONFIG,
): string {
  if (browserDOMPurify) {
    return browserDOMPurify.sanitize(html, config);
  }

  // Server fallback during SSR: output plain text only to avoid jsdom dependency.
  return stripTagsToText(html);
}

// ============================================
// Sanitization Functions
// ============================================

/**
 * Sanitizes HTML content for product descriptions
 * Allows formatting tags but removes scripts, event handlers, etc.
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeProductDescription(
  html: string | null | undefined,
): string {
  if (!html) return "";

  // Run sanitization (DOMPurify in browser, text-only fallback on server)
  const clean = sanitizeHtml(html, PRODUCT_DESCRIPTION_CONFIG);

  // Post-process: ensure all links have security attributes
  return clean.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
    // Add target="_blank" and rel="noopener noreferrer" if not present
    let newAttrs = attrs;
    if (!attrs.includes("target=")) {
      newAttrs += ' target="_blank"';
    }
    if (!attrs.includes("rel=")) {
      newAttrs += ' rel="noopener noreferrer"';
    } else if (!attrs.includes("noopener")) {
      // Ensure noopener is in rel attribute
      newAttrs = newAttrs.replace(
        /rel="([^"]*)"/,
        'rel="$1 noopener noreferrer"',
      );
    }
    return `<a ${newAttrs.trim()}>`;
  });
}

/**
 * Sanitizes user-generated content with strict rules
 * Only allows basic text formatting (bold, italic, paragraphs)
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeUserContent(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, STRICT_CONFIG);
}

/**
 * Strips ALL HTML tags, returning only plain text
 * Use this when you need text content only
 *
 * @param html - The HTML string to strip
 * @returns Plain text with all HTML removed
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, TEXT_ONLY_CONFIG);
}

/**
 * Sanitizes a string for use in HTML attributes
 * Escapes quotes and angle brackets
 *
 * @param value - The string to escape
 * @returns Escaped string safe for HTML attributes
 */
export function escapeHtmlAttribute(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Checks if a string contains potentially dangerous HTML
 * Useful for logging/monitoring suspicious content
 *
 * @param html - The HTML string to check
 * @returns Object with analysis results
 */
export function analyzeHtmlSafety(html: string | null | undefined): {
  safe: boolean;
  issues: string[];
  sanitizedOutput: string;
} {
  if (!html) {
    return { safe: true, issues: [], sanitizedOutput: "" };
  }

  const issues: string[] = [];
  const lowerHtml = html.toLowerCase();

  // Check for common XSS patterns
  if (/<script/i.test(html)) {
    issues.push("Contains <script> tag");
  }
  if (/on\w+\s*=/i.test(html)) {
    issues.push("Contains event handler attribute (onclick, onerror, etc.)");
  }
  if (/javascript:/i.test(html)) {
    issues.push("Contains javascript: URL scheme");
  }
  if (/data:/i.test(html) && /<img|<iframe|<object|<embed/i.test(html)) {
    issues.push("Contains data: URI in media element");
  }
  if (/<iframe/i.test(html)) {
    issues.push("Contains <iframe> tag");
  }
  if (/<object|<embed|<applet/i.test(html)) {
    issues.push("Contains plugin element (object/embed/applet)");
  }
  if (/expression\s*\(/i.test(lowerHtml)) {
    issues.push("Contains CSS expression (IE)");
  }
  if (/<svg.*?on/i.test(html)) {
    issues.push("Contains SVG with event handler");
  }
  if (/<math/i.test(html)) {
    issues.push("Contains MathML (potential XSS vector)");
  }

  const sanitizedOutput = sanitizeProductDescription(html);

  return {
    safe: issues.length === 0,
    issues,
    sanitizedOutput,
  };
}
