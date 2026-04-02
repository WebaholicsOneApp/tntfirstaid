'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { articles, categories } from './articles';
import AnimateIn from '~/components/ui/AnimateIn';

export default function NewsGrid() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All'
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <>
      {/* Category Filter Tabs */}
      <AnimateIn animation="fade-up">
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-500 text-secondary-900'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </AnimateIn>

      {/* Article Grid */}
      <div className="grid sm:grid-cols-2 gap-8">
        {filtered.map((article, i) => (
          <AnimateIn
            key={article.slug}
            animation="fade-up"
            delay={i % 2 === 0 ? 0 : 120}
          >
            <Link
              href={`/news/${article.slug}`}
              className="group bg-white border border-secondary-100 overflow-hidden rounded-2xl hover:shadow-lg transition-shadow block"
            >
              {/* Thumbnail */}
              <div className="aspect-[16/10] relative bg-secondary-100 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-500/10 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <time className="text-xs text-secondary-400">{article.date}</time>
                </div>
                <h2 className="text-lg font-display font-bold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-secondary-500">By {article.author}</p>
              </div>
            </Link>
          </AnimateIn>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">
            No articles found in this category.
          </p>
        </div>
      )}
    </>
  );
}
