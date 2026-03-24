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
      <header className="relative bg-secondary-900 overflow-hidden min-h-[300px] md:min-h-[400px]">
        <Image
          src="/images/heroes/distributors.jpg"
          alt="Alpha Munitions products"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/85 via-secondary-900/40 to-black/10" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary-500" />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] text-primary-400 uppercase">Stay Informed</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">News &amp; Data</h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-lg">Technical articles, data-driven insights, and everything happening at Alpha Munitions.</p>
          </div>
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
