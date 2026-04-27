"use client";

import { useMemo, useState } from "react";
import { LiteYouTube } from "~/components/ui/LiteYouTube";

export interface BrowserVideo {
  title: string;
  category: string;
  youtubeId: string;
}

interface VideoBrowserProps {
  videos: BrowserVideo[];
  searchPlaceholder?: string;
  idPrefix?: string;
}

export function VideoBrowser({
  videos,
  searchPlaceholder = "Search videos by title or category…",
  idPrefix = "videos",
}: VideoBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of videos) {
      counts.set(v.category, (counts.get(v.category) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [videos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      if (selectedCategory !== "All" && v.category !== selectedCategory) {
        return false;
      }
      if (
        q &&
        !v.title.toLowerCase().includes(q) &&
        !v.category.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [videos, selectedCategory, query]);

  const searchId = `${idPrefix}-search`;

  return (
    <div>
      <div className="mb-8 space-y-5">
        <div className="relative">
          <svg
            className="text-secondary-400 pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search videos"
            className="border-secondary-200 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-full border bg-white py-3 pr-10 pl-11 text-sm transition-colors focus:ring-2 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-secondary-400 hover:text-secondary-700 absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          <CategoryPill
            label="All"
            count={videos.length}
            active={selectedCategory === "All"}
            onClick={() => setSelectedCategory("All")}
          />
          {categoryCounts.map(([cat, count]) => (
            <CategoryPill
              key={cat}
              label={cat}
              count={count}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        <p
          className="text-secondary-500 font-mono text-[0.65rem] tracking-[0.2em] uppercase"
          aria-live="polite"
        >
          Showing {filtered.length} of {videos.length}
          {selectedCategory !== "All" ? ` · ${selectedCategory}` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="border-secondary-200 rounded-2xl border border-dashed py-16 text-center">
          <p className="text-secondary-700 mb-2 text-base font-semibold">
            No videos match your filters
          </p>
          <p className="text-secondary-500 mb-6 text-sm">
            Try a different search term or category.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCategory("All");
            }}
            className="text-primary-600 hover:text-primary-700 font-mono text-[0.65rem] tracking-[0.2em] uppercase transition-colors"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <VideoCard
              key={video.youtubeId}
              title={video.title}
              category={video.category}
              youtubeId={video.youtubeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={
        active
          ? "bg-primary-500 border-primary-500 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[0.65rem] tracking-[0.15em] text-white uppercase transition-colors"
          : "border-secondary-200 bg-white text-secondary-700 hover:border-primary-500 hover:text-primary-600 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-colors"
      }
    >
      <span>{label}</span>
      <span
        className={
          active
            ? "text-white/70 tabular-nums"
            : "text-secondary-400 tabular-nums"
        }
      >
        {count}
      </span>
    </button>
  );
}

function VideoCard({
  title,
  category,
  youtubeId,
}: {
  title: string;
  category: string;
  youtubeId: string;
}) {
  return (
    <article className="border-secondary-100 group overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg">
      <div className="bg-secondary-950 relative aspect-video overflow-hidden">
        <LiteYouTube youtubeId={youtubeId} title={title} />
      </div>
      <div className="p-6">
        <div className="mb-3">
          <span className="text-primary-600 bg-primary-500/10 rounded-full px-3 py-1 text-[0.55rem] font-bold tracking-[0.2em] uppercase">
            {category}
          </span>
        </div>
        <h3 className="font-display text-secondary-900 group-hover:text-primary-600 text-lg font-bold transition-colors">
          {title}
        </h3>
      </div>
    </article>
  );
}
