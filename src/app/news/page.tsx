import type { Metadata } from "next";
import Image from "next/image";
import { getStoreConfig } from "~/lib/store-config.server";
import NewsGrid from "./NewsGrid";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "News & Data",
    description: `The latest news, technical articles, and data-driven insights from ${config.siteName}.`,
  };
}

export default async function NewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-900 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <Image
          src="/images/heroes/distributors.jpg"
          alt="TNT First Aid products"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="from-secondary-900/85 via-secondary-900/40 absolute inset-0 bg-gradient-to-r to-black/10" />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Stay Informed
              </span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
              News &amp; Data
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/60">
              Technical articles, data-driven insights, and everything happening
              at TNT First Aid.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <NewsGrid />
        </div>
      </main>
    </div>
  );
}
