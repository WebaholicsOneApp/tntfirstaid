const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://tntfirstaid.com";

export const storeConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "TNT First Aid",
  siteUrl,
  siteDomain: siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "support@tntfirstaid.com",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@tntfirstaid.com",
  hours: process.env.NEXT_PUBLIC_STORE_HOURS || "Mon-Fri 9AM-5PM MST",
  mapsQuery:
    process.env.NEXT_PUBLIC_MAPS_QUERY || "TNT+First+Aid",
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "/images/tnt-logo-wide.png",
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#E31837",
  secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#1A1A1A",
};

export type StoreConfig = typeof storeConfig;
