/**
 * schema.org JSON-LD builders for SEO + rich-result eligibility.
 *
 * Use through the <JsonLd /> component:
 *   <JsonLd data={buildOrganization(storeConfig)} />
 */
import type { StoreConfig } from "./store-config";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export interface FaqEntry {
  q: string;
  a: string;
}

export function buildOrganization(
  config: Pick<StoreConfig, "siteName" | "siteUrl" | "logoUrl" | "phone" | "email" | "supportEmail">,
): Record<string, unknown> {
  const logoAbsolute = config.logoUrl.startsWith("http")
    ? config.logoUrl
    : `${config.siteUrl.replace(/\/$/, "")}${config.logoUrl}`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.siteName,
    url: config.siteUrl,
    logo: logoAbsolute,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: config.phone,
        contactType: "customer service",
        email: config.email,
        areaServed: "US",
        availableLanguage: "English",
      },
    ],
  };
}

export function buildBreadcrumbList(
  items: BreadcrumbEntry[],
  siteUrl: string,
): Record<string, unknown> {
  const base = siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: item.href.startsWith("http") ? item.href : `${base}${item.href}` }
        : {}),
    })),
  };
}

export function buildFaqPage(entries: FaqEntry[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.a,
      },
    })),
  };
}

export interface LocalBusinessInput {
  config: StoreConfig;
  streetAddress?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  openingHoursSpec?: Array<{
    days: string[];
    opens: string;
    closes: string;
  }>;
}

export function buildLocalBusiness(
  input: LocalBusinessInput,
): Record<string, unknown> {
  const { config } = input;
  const logoAbsolute = config.logoUrl.startsWith("http")
    ? config.logoUrl
    : `${config.siteUrl.replace(/\/$/, "")}${config.logoUrl}`;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: config.siteName,
    url: config.siteUrl,
    image: logoAbsolute,
    telephone: config.phone,
    email: config.email,
  };

  if (input.streetAddress || input.city || input.region || input.postalCode) {
    data.address = {
      "@type": "PostalAddress",
      ...(input.streetAddress && { streetAddress: input.streetAddress }),
      ...(input.city && { addressLocality: input.city }),
      ...(input.region && { addressRegion: input.region }),
      ...(input.postalCode && { postalCode: input.postalCode }),
      addressCountry: input.country || "US",
    };
  }

  if (input.latitude != null && input.longitude != null) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: input.latitude,
      longitude: input.longitude,
    };
  }

  if (input.openingHoursSpec?.length) {
    data.openingHoursSpecification = input.openingHoursSpec.map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: s.days,
      opens: s.opens,
      closes: s.closes,
    }));
  }

  return data;
}
