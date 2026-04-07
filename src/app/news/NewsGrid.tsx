"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { articles, categories } from "./articles";
import AnimateIn from "~/components/ui/AnimateIn";

export default function NewsGrid() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <>
      {/* Category Filter Tabs */}
      <AnimateIn animation="fade-up">
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary-500 text-secondary-900"
                  : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </AnimateIn>

      {/* Article Grid */}
      <div className="grid gap-8 sm:grid-cols-2">
        {filtered.map((article, i) => (
          <AnimateIn
            key={article.slug}
            animation="fade-up"
            delay={i % 2 === 0 ? 0 : 120}
          >
            <Link
              href={`/news/${article.slug}`}
              className="group border-secondary-100 block overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg"
            >
              {/* Thumbnail */}
              <div className="bg-secondary-100 relative aspect-[16/10] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="text-primary-600 bg-primary-500/10 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                    {article.category}
                  </span>
                  <time className="text-secondary-400 text-xs">
                    {article.date}
                  </time>
                </div>
                <h2 className="font-display text-secondary-800 group-hover:text-primary-600 mb-2 text-lg font-bold transition-colors">
                  {article.title}
                </h2>
                <p className="text-secondary-500 text-sm">
                  By {article.author}
                </p>
              </div>
            </Link>
          </AnimateIn>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-400">
            No articles found in this category.
          </p>
        </div>
      )}
    </>
  );
}
