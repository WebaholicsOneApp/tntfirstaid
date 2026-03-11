import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreConfig } from '~/lib/store-config.server';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: 'News & Updates',
    description: `The latest news, product launches, and updates from ${config.siteName}.`,
  };
}

const articles = [
  {
    title: 'Introducing the New 6mm Dasher OCD Brass',
    excerpt:
      'Our latest addition to the OCD brass lineup delivers sub-half-MOA consistency out of the box. Weight-sorted and neck-turned to competition specifications.',
    date: 'March 5, 2026',
    category: 'Product Launch',
  },
  {
    title: '2026 PRS Season Sponsorship Announcement',
    excerpt:
      'Alpha Munitions is proud to sponsor a roster of elite competitive shooters for the 2026 Precision Rifle Series season. Meet the team members and their loadouts.',
    date: 'February 18, 2026',
    category: 'Sponsorship',
  },
  {
    title: 'Understanding Brass Annealing: A Technical Guide',
    excerpt:
      'A deep dive into the science of brass annealing, how it affects case life and consistency, and why our OCD process produces more uniform results.',
    date: 'January 30, 2026',
    category: 'Technical',
  },
  {
    title: 'Alpha Munitions at SHOT Show 2026',
    excerpt:
      'Recap of our SHOT Show booth, new product previews, and highlights from conversations with dealers and shooting sports professionals.',
    date: 'January 22, 2026',
    category: 'Events',
  },
];

export default async function NewsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="bg-secondary-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <p className="text-primary-500 font-display text-sm uppercase tracking-[0.25em] mb-4">
            Stay Informed
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            News & Updates
          </h1>
          <p className="text-secondary-300 text-lg leading-relaxed">
            Product launches, technical articles, event recaps, and everything
            happening at Alpha Munitions.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Article Cards */}
          <div className="space-y-8">
            {articles.map((article) => (
              <article
                key={article.title}
                className="bg-white rounded-2xl border border-secondary-100 p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-500/10 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <time className="text-sm text-gray-400">{article.date}</time>
                </div>
                <h2 className="text-xl font-display font-bold text-secondary-800 mb-3">
                  {article.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {article.excerpt}
                </p>
              </article>
            ))}
          </div>

          {/* Newsletter Signup Placeholder */}
          <div className="mt-16 bg-secondary-50 rounded-3xl p-10 md:p-14 text-center border border-secondary-100">
            <h2 className="text-2xl font-display font-bold text-secondary-800 mb-3">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-8">
              Be the first to hear about new product releases, technical
              content, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-5 py-3.5 bg-white border border-secondary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                disabled
              />
              <button
                type="button"
                disabled
                className="px-8 py-3.5 bg-primary-500 text-secondary-900 font-bold rounded-xl text-sm uppercase tracking-widest opacity-60 cursor-not-allowed"
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Newsletter signup coming soon.
            </p>
          </div>

          {/* Back to shop */}
          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="text-primary-600 font-medium hover:text-primary-700 transition-colors text-sm"
            >
              &larr; Back to Shop
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
