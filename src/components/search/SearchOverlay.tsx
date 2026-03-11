'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDebounce, useSearchSuggestions, useRecentSearches } from '~/hooks';
import { formatCentsToDollars } from '~/lib/utils';
import type { SearchSuggestionsResponse } from '~/types';
import { POPULAR_SEARCHES } from '~/lib/popular-searches';

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
      <div className="flex items-center justify-center py-8 text-secondary-500 text-sm">
        <div className="w-5 h-5 border-2 border-secondary-200 border-t-primary-500 rounded-full animate-spin mr-2" />
        Searching...
      </div>
    );
  }

  if (!suggestions) return null;

  const total = suggestions.products.length + suggestions.categories.length;

  if (total === 0) {
    return (
      <div className="py-8 text-center text-sm text-secondary-500">
        No results found for &ldquo;{query}&rdquo;
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 max-h-[60vh]" role="listbox" aria-label="Search suggestions">
      {/* Product suggestions */}
      {suggestions.products.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider px-2 py-2">
            Products
          </p>
          {suggestions.products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              onClick={onSelect}
              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary-50 transition-colors"
            >
              <div className="w-10 h-10 bg-secondary-100 rounded overflow-hidden flex-shrink-0">
                {product.primaryImage ? (
                  <Image
                    src={product.primaryImage}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-secondary-800 font-medium truncate">{product.name}</p>
                {product.price != null && (
                  <p className="text-xs font-semibold text-secondary-900">
                    {formatCentsToDollars(product.price)}
                  </p>
                )}
              </div>
              {!product.inStock && (
                <span className="text-xs text-red-500 flex-shrink-0">Out of Stock</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Category suggestions */}
      {suggestions.categories.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider px-2 py-2">
            Categories
          </p>
          {suggestions.categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              onClick={onSelect}
              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary-50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-50 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-secondary-800 font-medium">{category.name}</p>
                {category.parentName && (
                  <p className="text-xs text-secondary-400">in {category.parentName}</p>
                )}
              </div>
              <span className="text-xs text-secondary-300 flex-shrink-0">
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

export function SearchOverlay({ isOpen, onClose, onNavigate }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const isTyping = debouncedQuery.trim().length >= 2;
  const { suggestions, isLoading, reset } = useSearchSuggestions(debouncedQuery);
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

    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.width = '100%';
    bodyStyle.overflow = 'hidden';
    htmlStyle.overflow = 'hidden';

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
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery('');
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSelect = useCallback(() => {
    setQuery('');
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
    <div className="fixed inset-0 z-[100] animate-fade-in bg-black/40">
      {/* Click-away backdrop */}
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      {/* Floating panel */}
      <div className="relative bg-white rounded-b-2xl shadow-[0_8px_40px_rgba(0,0,0,0.22)]">
        <div className="container mx-auto px-4 pb-6">
          {/* Header row */}
          <div className="flex items-center gap-4 py-4">
            <Link href="/" onClick={handleClose} className="flex items-center flex-shrink-0">
              <span className="text-xl font-display font-bold text-primary-500 tracking-wider uppercase">
                Alpha Munitions
              </span>
            </Link>

            {/* Search input */}
            <form onSubmit={handleSubmit} role="search" className="flex-1 min-w-0 max-w-xl mx-auto">
              <div className="relative flex items-center rounded-full border border-secondary-300 bg-secondary-50 px-4 py-2 sm:px-5 sm:py-3 focus-within:border-primary-500 focus-within:bg-white transition-colors">
                <svg className="w-5 h-5 text-secondary-400 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ammunition, reloading supplies..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent text-base sm:text-lg text-secondary-900 placeholder-secondary-400 outline-none focus:outline-none border-0 appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden min-w-0"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); reset(); inputRef.current?.focus(); }}
                    className="p-1.5 text-secondary-400 hover:text-secondary-600 transition-colors flex-shrink-0"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            <button
              onClick={handleClose}
              className="p-2 text-secondary-500 hover:text-primary-600 transition-colors rounded-full hover:bg-secondary-100 flex-shrink-0"
              aria-label="Close search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {isTyping ? (
            <div className="max-w-2xl mx-auto">
              <InlineSuggestions
                query={debouncedQuery}
                isLoading={isLoading}
                suggestions={suggestions}
                onSelect={handleSelect}
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <section>
                  <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-3">
                    Recent Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <span key={term} className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary-100 hover:bg-secondary-200 rounded-full text-sm text-secondary-700 transition-colors group">
                        <Link
                          href={`/search?q=${encodeURIComponent(term)}`}
                          onClick={() => { addSearch(term); handleSelect(); }}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {term}
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeSearch(term); }}
                          className="p-0.5 text-secondary-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label={`Remove ${term}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Popular Searches */}
              <section>
                <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      onClick={() => { addSearch(term); handleSelect(); }}
                      className="px-3 py-1.5 bg-secondary-100 hover:bg-primary-50 hover:text-primary-700 rounded-full text-sm text-secondary-700 transition-colors"
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
    document.body
  );
}
