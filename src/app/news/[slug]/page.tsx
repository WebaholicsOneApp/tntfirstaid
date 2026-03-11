import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles, getArticleBySlug } from '../articles';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found' };
  return {
    title: article.title,
    description: article.content?.[0]?.slice(0, 160) ?? `${article.title} — Alpha Munitions News & Data`,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div className="bg-white min-h-screen">
      {/* Dark bar behind fixed header */}
      <div className="bg-secondary-900 h-20" />

      <main className="container mx-auto px-4 pt-10 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to News & Data
          </Link>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-display font-bold text-secondary-900 leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta: author, date, category */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-10">
            <span className="text-gray-500">
              By <span className="text-secondary-700 font-medium">{article.author}</span>
            </span>
            <span className="text-gray-300">|</span>
            <time className="text-gray-500">{article.date}</time>
            <span className="text-gray-300">|</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-500/10 px-3 py-1 rounded-full">
              {article.category}
            </span>
          </div>

          {/* Featured image */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-12">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Text content */}
          {article.content && (
            <div className="space-y-6">
              {article.content.map((paragraph, i) => (
                <p key={i} className="text-gray-600 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* Magazine page scans */}
          {article.pages && (
            <div className="space-y-6">
              {article.pages.map((pageUrl, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-secondary-100 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pageUrl}
                    alt={`${article.title} — Page ${i + 1}`}
                    className="w-full h-auto"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Purchase link for magazine articles */}
          {article.purchaseUrl && (
            <div className="mt-10 bg-secondary-50 rounded-xl p-6 border border-secondary-100 text-center">
              <p className="text-gray-600 mb-3">
                This article was originally published in print.
              </p>
              <a
                href={article.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-500 transition-colors"
              >
                Purchase at osgnewsstand.com
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
