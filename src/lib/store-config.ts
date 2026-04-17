const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://tntfirstaid.com";

export const storeConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "TNT First Aid",
  siteUrl,
  siteDomain: siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "Kaysville, Utah",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || "1-800-TNT-4003",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "jeffm@tntfirstaid.com",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "jeffm@tntfirstaid.com",
  hours: process.env.NEXT_PUBLIC_STORE_HOURS || "Mon - Fri / 9:00 AM - 6:00 PM",
  mapsQuery:
    process.env.NEXT_PUBLIC_MAPS_QUERY || "TNT+First+Aid",
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "/images/tnt-logo-wide.png",
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#E31837",
  secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#1A1A1A",
};

export type StoreConfig = typeof storeConfig;
