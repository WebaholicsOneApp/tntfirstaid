import type { Metadata } from "next";
import { getStoreConfig } from "~/lib/store-config.server";
import NewsGrid from "./NewsGrid";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: "News",
    description: `The latest news, training updates, and preparedness tips from ${config.siteName}.`,
  };
}

export default async function NewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary-950 relative min-h-[300px] overflow-hidden md:min-h-[400px]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 40%, rgba(227,24,55,0.28) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(227,24,55,0.15) 0%, transparent 55%)",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary-500 h-px w-6" />
              <span className="text-primary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                Stay Informed
              </span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold text-white md:text-5xl">
              News
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/70">
              Training announcements, first aid tips, and preparedness
              resources from the TNT First Aid team.
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
