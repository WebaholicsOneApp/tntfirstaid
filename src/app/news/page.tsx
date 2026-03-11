import type { Metadata } from 'next';
import Image from 'next/image';
import { getStoreConfig } from '~/lib/store-config.server';
import NewsGrid from './NewsGrid';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'News & Data',
    description: `The latest news, technical articles, and data-driven insights from ${config.siteName}.`,
  };
}

export default async function NewsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative py-24 md:py-36 overflow-hidden">
        <Image
          src="/images/heroes/distributors.jpg"
          alt="Alpha Munitions products"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            Stay Informed
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            News & Data
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            Technical articles, data-driven insights, and everything happening
            at Alpha Munitions.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <NewsGrid />
        </div>
      </main>
    </div>
  );
}
