import '~/app/globals.css';

import { type Metadata } from 'next';
import { Playfair_Display, Inter, Cardo, JetBrains_Mono } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { getNonce } from '~/lib/get-nonce';
import { NonceProvider } from '~/lib/nonce-context';
import { CartProvider } from '~/lib/cart';
import { NavigationLoadingProvider } from '~/lib/navigation-loading-context';
import { getStoreConfig } from '~/lib/store-config.server';
import { generatePalette, SHADES } from '~/lib/color-utils';
import StickyHeader from '~/components/layout/StickyHeader';
import HeaderWrapper from '~/components/layout/HeaderWrapper';
import Footer from '~/components/layout/Footer';
import { CartDrawer } from '~/components/cart';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cardo = Cardo({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cardo',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const storeConfig = await getStoreConfig();
  return {
    title: {
      default: storeConfig.siteName,
      template: `%s | ${storeConfig.siteName}`,
    },
    description: `${storeConfig.siteName} - Premium ammunition and reloading supplies`,
    icons: [
      { rel: 'icon', url: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', url: '/favicon.png', type: 'image/png' },
      { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
    ],
    metadataBase: new URL(storeConfig.siteUrl),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = await getNonce();
  const storeConfig = await getStoreConfig();

  // Generate dynamic color palettes from branding
  const primaryPalette = generatePalette(storeConfig.primaryColor);
  const secondaryPalette = generatePalette(storeConfig.secondaryColor);

  // Build CSS variable style object for dynamic branding
  const paletteStyle: Record<string, string> = {};
  for (const shade of SHADES) {
    paletteStyle[`--primary-${shade}`] = primaryPalette[shade]!;
    paletteStyle[`--secondary-${shade}`] = secondaryPalette[shade]!;
  }

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${cardo.variable} ${jetbrainsMono.variable}`}>
      <body
        className="font-sans antialiased bg-white text-secondary-800 min-h-screen flex flex-col"
        style={paletteStyle as React.CSSProperties}
      >
        <NextTopLoader color={storeConfig.primaryColor} showSpinner={false} />
        <NonceProvider nonce={nonce}>
          <CartProvider>
            <NavigationLoadingProvider>
              <StickyHeader>
                <HeaderWrapper
                  siteName={storeConfig.siteName}
                />
              </StickyHeader>

              <main className="flex-1">
                {children}
              </main>

              <Footer
                siteName={storeConfig.siteName}
                storeConfig={storeConfig}
              />

              <CartDrawer />
            </NavigationLoadingProvider>
          </CartProvider>
        </NonceProvider>
      </body>
    </html>
  );
}
