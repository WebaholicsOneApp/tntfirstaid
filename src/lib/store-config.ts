const phone = process.env.NEXT_PUBLIC_STORE_PHONE || '(801) 555-0123';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alphamunitions.com';

export const storeConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Alpha Munitions',
  siteUrl,
  siteDomain: siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  address:
    process.env.NEXT_PUBLIC_STORE_ADDRESS || '1234 Alpha Way\nAmerican Fork, UT 84003',
  phone,
  phoneHref: `tel:${phone.replace(/[\s()-]/g, '')}`,
  email:
    process.env.NEXT_PUBLIC_STORE_EMAIL || 'info@alphamunitions.com',
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
    'support@alphamunitions.com',
  hours: process.env.NEXT_PUBLIC_STORE_HOURS || 'Mon-Fri 9AM-5PM MST',
  mapsQuery:
    process.env.NEXT_PUBLIC_MAPS_QUERY ||
    'Alpha+Munitions+American+Fork+UT',
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || '/images/alpha-logo-wide.png',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#e9c360',
  secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#1A1A1A',
};

export type StoreConfig = typeof storeConfig;
