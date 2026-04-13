const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://alphamunitions.com";

export const storeConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Alpha Munitions",
  siteUrl,
  siteDomain: siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  address:
    process.env.NEXT_PUBLIC_STORE_ADDRESS ||
    "268 W Paramount Ave, Salt Lake City, UT 84115",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "support@alphamunitions.com",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@alphamunitions.com",
  hours: process.env.NEXT_PUBLIC_STORE_HOURS || "Mon-Fri 9AM-5PM MST",
  mapsQuery:
    process.env.NEXT_PUBLIC_MAPS_QUERY || "Alpha+Munitions+American+Fork+UT",
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "/images/alpha-logo-wide.png",
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#e9c360",
  secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#1A1A1A",
};

export type StoreConfig = typeof storeConfig;
