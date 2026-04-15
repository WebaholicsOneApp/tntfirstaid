"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "~/components/ui/ProductImage";
import { useDebounce, useSearchSuggestions, useRecentSearches } from "~/hooks";
import { formatCentsToDollars } from "~/lib/utils";
import type { SearchSuggestionsResponse } from "~/types";
import { POPULAR_SEARCHES } from "~/lib/popular-searches";

// ── Inline suggestions (typing state) ────────────────────────────────────────
function InlineSuggestions({
  query,
  isLoading,
  suggestions,
  onSelect,
}: {
  query: string;
  isLoading: boolean;
  suggestions: SearchSuggestionsResponse | null;
  onSelect: () => void;
}) {
  if (isLoading) {
    return (
      <div className="text-secondary-500 flex items-center justify-center py-8 text-sm">
        <div className="border-secondary-200 border-t-primary-500 mr-2 h-5 w-5 animate-spin rounded-full border-2" />
        Searching...
      </div>
    );
  }

  if (!suggestions) return null;

  const total = suggestions.products.length + suggestions.categories.length;

  if (total === 0) {
    return (
      <div className="text-secondary-500 py-8 text-center text-sm">
        No results found for &ldquo;{query}&rdquo;
      </div>
    );
  }

  return (
    <div
      className="max-h-[60vh] flex-1 overflow-y-auto"
      role="listbox"
      aria-label="Search suggestions"
    >
      {/* Product suggestions */}
      {suggestions.products.length > 0 && (
        <div>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Products
            </span>
          </div>
          {suggestions.products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              onClick={onSelect}
              className="hover:bg-primary-50 flex items-center gap-3 rounded-md px-2 py-2 transition-colors"
            >
              <div className="bg-secondary-100 h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                {product.primaryImage ? (
                  <ProductImage
                    src={product.primaryImage}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-secondary-300 flex h-full w-full items-center justify-center">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-secondary-900 truncate text-sm font-medium">
                  {product.name}
                </p>
                {product.price != null && (
                  <p className="text-primary-600 font-mono text-sm">
                    {product.maxPrice != null
                      ? `${formatCentsToDollars(product.price)} – ${formatCentsToDollars(product.maxPrice)}`
                      : formatCentsToDollars(product.price)}
                  </p>
                )}
              </div>
              {!product.inStock && (
                <span className="text-secondary-400 flex-shrink-0 font-mono text-[0.6rem] tracking-[0.1em] uppercase">
                  Out of Stock
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Category suggestions */}
      {suggestions.categories.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Categories
            </span>
          </div>
          {suggestions.categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              onClick={onSelect}
              className="hover:bg-primary-50 flex items-center gap-3 rounded-md px-2 py-2 transition-colors"
            >
              <div className="bg-primary-50 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded">
                <svg
                  className="text-primary-600 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-secondary-900 text-sm font-medium">
                  {category.name}
                </p>
                {category.parentName && (
                  <p className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.1em] uppercase">
                    in {category.parentName}
                  </p>
                )}
              </div>
              <span className="text-secondary-400 flex-shrink-0 font-mono text-[0.6rem] tracking-[0.1em] uppercase">
                {category.productCount} products
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main overlay ─────────────────────────────────────────────────────────────
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: () => void;
}

export function SearchOverlay({
  isOpen,
  onClose,
  onNavigate,
}: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const isTyping = debouncedQuery.trim().length >= 2;
  const { suggestions, isLoading, reset } =
    useSearchSuggestions(debouncedQuery);
  const { recentSearches, addSearch, removeSearch } = useRecentSearches();

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const { style: bodyStyle } = document.body;
    const { style: htmlStyle } = document.documentElement;
    const prevBodyPosition = bodyStyle.position;
    const prevBodyTop = bodyStyle.top;
    const prevBodyWidth = bodyStyle.width;
    const prevBodyOverflow = bodyStyle.overflow;
    const prevHtmlOverflow = htmlStyle.overflow;

    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.width = "100%";
    bodyStyle.overflow = "hidden";
    htmlStyle.overflow = "hidden";

    return () => {
      bodyStyle.position = prevBodyPosition;
      bodyStyle.top = prevBodyTop;
      bodyStyle.width = prevBodyWidth;
      bodyStyle.overflow = prevBodyOverflow;
      htmlStyle.overflow = prevHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Auto-focus
  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery("");
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSelect = useCallback(() => {
    setQuery("");
    reset();
    onClose();
    onNavigate?.();
  }, [onClose, onNavigate, reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = query.trim();
    if (!t) return;
    addSearch(t);
    router.push(`/search?q=${encodeURIComponent(t)}`);
    handleSelect();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="animate-fade-in fixed inset-0 z-[100] bg-black/40">
      {/* Click-away backdrop */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Floating panel */}
      <div className="relative rounded-b-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.22)]">
        <div className="container mx-auto px-4 pb-6">
          {/* Header — stacked on mobile, inline on desktop */}
          <div className="py-4">
            {/* Row 1: Logo (centered on mobile, inline on desktop) */}
            <div className="mb-3 flex items-center justify-center sm:hidden">
              <Link
                href="/"
                onClick={handleClose}
                className="flex items-center"
              >
                <Image
                  src="https://alphamunitions.com/wp-content/uploads/2019/03/Alpha-Muntions-Gold.png"
                  alt="TNT First Aid"
                  width={300}
                  height={50}
                  className="h-auto w-[140px]"
                />
              </Link>
            </div>

            {/* Row 2 (mobile) / Single row (desktop): Search + Close */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Logo — desktop only */}
              <Link
                href="/"
                onClick={handleClose}
                className="hidden flex-shrink-0 items-center sm:flex"
              >
                <Image
                  src="https://alphamunitions.com/wp-content/uploads/2019/03/Alpha-Muntions-Gold.png"
                  alt="TNT First Aid"
                  width={300}
                  height={50}
                  className="h-auto w-[160px]"
                />
              </Link>

              {/* Search input */}
              <form
                onSubmit={handleSubmit}
                role="search"
                className="min-w-0 flex-1 sm:mx-auto sm:max-w-xl"
              >
                <div className="border-secondary-300 bg-secondary-50 focus-within:border-primary-500 relative flex items-center rounded-full border px-4 py-2.5 transition-colors focus-within:bg-white sm:px-5 sm:py-3">
                  <svg
                    className="text-secondary-400 mr-3 h-5 w-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="text-secondary-900 placeholder-secondary-400 min-w-0 flex-1 appearance-none border-0 bg-transparent text-base outline-none focus:outline-none sm:text-lg [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        reset();
                        inputRef.current?.focus();
                      }}
                      className="text-secondary-400 hover:text-secondary-600 flex-shrink-0 p-1.5 transition-colors"
                      aria-label="Clear search"
                    >
                      <svg
                        className="h-5 w-5"
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
              </form>

              <button
                onClick={handleClose}
                className="text-secondary-500 hover:text-primary-600 hover:bg-secondary-100 flex-shrink-0 rounded-full p-2 transition-colors"
                aria-label="Close search"
              >
                <svg
                  className="h-6 w-6"
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
            </div>
          </div>

          {/* Body */}
          {isTyping ? (
            <div className="mx-auto max-w-2xl">
              <InlineSuggestions
                query={debouncedQuery}
                isLoading={isLoading}
                suggestions={suggestions}
                onSelect={handleSelect}
              />
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-primary-500 h-px w-6" />
                    <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                      Recent Searches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <span
                        key={term}
                        className="border-secondary-200 text-secondary-600 hover:border-primary-500/60 hover:text-primary-600 group inline-flex items-center gap-1 rounded-full border px-4 py-1.5 font-mono text-[0.7rem] tracking-[0.1em] transition-all duration-200"
                      >
                        <Link
                          href={`/search?q=${encodeURIComponent(term)}`}
                          onClick={() => {
                            addSearch(term);
                            handleSelect();
                          }}
                        >
                          {term}
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSearch(term);
                          }}
                          className="text-secondary-400 p-0.5 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
                          aria-label={`Remove ${term}`}
                        >
                          <svg
                            className="h-3 w-3"
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
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Popular Searches */}
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary-500 h-px w-6" />
                  <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                    Popular Searches
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      onClick={() => {
                        addSearch(term);
                        handleSelect();
                      }}
                      className="border-secondary-200 text-secondary-600 hover:border-primary-500/60 hover:text-primary-600 rounded-full border px-4 py-1.5 font-mono text-[0.7rem] tracking-[0.1em] transition-all duration-200"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
