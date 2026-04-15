import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug } from "../articles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description:
      article.content?.[0]?.slice(0, 160) ??
      `${article.title} — TNT First Aid News & Data`,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Dark bar behind fixed header */}
      <div className="bg-secondary-900 h-20" />

      <main className="container mx-auto px-4 pt-10 pb-20">
        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            href="/news"
            className="hover:text-primary-600 mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to News & Data
          </Link>

          {/* Title */}
          <h1 className="font-display text-secondary-900 mb-6 text-3xl leading-tight font-bold md:text-5xl">
            {article.title}
          </h1>

          {/* Meta: author, date, category */}
          <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-gray-500">
              By{" "}
              <span className="text-secondary-700 font-medium">
                {article.author}
              </span>
            </span>
            <span className="text-gray-300">|</span>
            <time className="text-gray-500">{article.date}</time>
            <span className="text-gray-300">|</span>
            <span className="text-primary-600 bg-primary-500/10 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              {article.category}
            </span>
          </div>

          {/* Featured image */}
          <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-xl">
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
                <p key={i} className="text-lg leading-relaxed text-gray-600">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* Magazine page scans */}
          {article.pages && (
            <div className="space-y-6">
              {article.pages.map((pageUrl, i) => (
                <div
                  key={i}
                  className="border-secondary-100 overflow-hidden rounded-xl border shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pageUrl}
                    alt={`${article.title} — Page ${i + 1}`}
                    className="h-auto w-full"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Purchase link for magazine articles */}
          {article.purchaseUrl && (
            <div className="bg-secondary-50 border-secondary-100 mt-10 rounded-xl border p-6 text-center">
              <p className="mb-3 text-gray-600">
                This article was originally published in print.
              </p>
              <a
                href={article.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 inline-flex items-center gap-2 font-medium transition-colors"
              >
                Purchase at osgnewsstand.com
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
