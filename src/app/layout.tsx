import "~/app/globals.css";

import { type Metadata, type Viewport } from "next";

export const revalidate = 300;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
import {
  Playfair_Display,
  Inter,
  Cardo,
  JetBrains_Mono,
} from "next/font/google";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { getNonce } from "~/lib/get-nonce";
import { NonceProvider } from "~/lib/nonce-context";
import { CartProvider } from "~/lib/cart";
import { AuthProvider } from "~/lib/auth";
import { NavigationLoadingProvider } from "~/lib/navigation-loading-context";
import { getStoreConfig } from "~/lib/store-config.server";
import { storeConfig } from "~/lib/store-config";
import { generatePalette, SHADES } from "~/lib/color-utils";
import StickyHeader from "~/components/layout/StickyHeader";
import HeaderWrapper from "~/components/layout/HeaderWrapper";
import Footer from "~/components/layout/Footer";
import { CartDrawer } from "~/components/cart";
import NewsletterPopup from "~/components/ui/NewsletterPopup";
import JsonLd from "~/components/common/JsonLd";
import { buildOrganization } from "~/lib/structured-data";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cardo = Cardo({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-cardo",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const avenir = localFont({
  src: [
    { path: "../fonts/AvenirLTProRoman.otf", weight: "400", style: "normal" },
    { path: "../fonts/AvenirLTProMedium.otf", weight: "500", style: "normal" },
    { path: "../fonts/AvenirLTProHeavy.otf", weight: "800", style: "normal" },
    { path: "../fonts/AvenirLTProBlack.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-avenir",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const storeConfig = await getStoreConfig();
  const description = `${storeConfig.siteName} — first aid kits, medical supplies, and CPR/first-aid training. ANSI-compliant kits, AEDs, and trauma supplies.`;
  // Used as the default share image when a page doesn't override it.
  const defaultOgImage = "/images/hero/hero-first-aid-group.jpg";
  return {
    title: {
      default: storeConfig.siteName,
      template: `%s | ${storeConfig.siteName}`,
    },
    description,
    icons: [
      { rel: "icon", url: "/favicon.ico", sizes: "any" },
      { rel: "icon", url: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    ],
    metadataBase: new URL(storeConfig.siteUrl),
    openGraph: {
      type: "website",
      siteName: storeConfig.siteName,
      title: storeConfig.siteName,
      description,
      url: storeConfig.siteUrl,
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: storeConfig.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: storeConfig.siteName,
      description,
      images: [defaultOgImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = await getNonce();

  // Use synchronous env-var defaults for instant layout render.
  // The API call (getStoreConfig) only adds admin branding overrides
  // which are toggle-gated and rarely changed. generateMetadata() still
  // calls the async version for accurate <title>/<meta> tags.
  const primaryPalette = generatePalette(storeConfig.primaryColor);
  const secondaryPalette = generatePalette(storeConfig.secondaryColor);

  const paletteStyle: Record<string, string> = {};
  for (const shade of SHADES) {
    paletteStyle[`--primary-${shade}`] = primaryPalette[shade]!;
    paletteStyle[`--secondary-${shade}`] = secondaryPalette[shade]!;
  }

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${cardo.variable} ${jetbrainsMono.variable} ${avenir.variable}`}
    >
      <body
        className="text-secondary-800 flex min-h-screen flex-col bg-white font-sans antialiased"
        style={paletteStyle as React.CSSProperties}
      >
        <JsonLd data={buildOrganization(storeConfig)} />
        <a
          href="#main-content"
          className="bg-primary-500 sr-only z-[100] rounded-br-lg px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-0 focus:left-0"
        >
          Skip to main content
        </a>
        <NextTopLoader color={storeConfig.primaryColor} showSpinner={false} />
        <NonceProvider nonce={nonce}>
          <AuthProvider initialCustomer={null} customerAuthEnabled={true}>
            <CartProvider>
              <NavigationLoadingProvider>
                <StickyHeader>
                  <HeaderWrapper
                    siteName={storeConfig.siteName}
                    logoUrl={storeConfig.logoUrl}
                  />
                </StickyHeader>

                <main id="main-content" tabIndex={-1} className="flex-1">
                  {children}
                </main>

                <Footer
                  siteName={storeConfig.siteName}
                  logoUrl="/apple-touch-icon.png"
                  storeConfig={storeConfig}
                />

                <CartDrawer />
                <NewsletterPopup />
              </NavigationLoadingProvider>
            </CartProvider>
          </AuthProvider>
        </NonceProvider>
      </body>
    </html>
  );
}
