'use client';

import { useEffect } from 'react';
import type { CategoryWithChildren } from '~/types';
import ProductFilters from './ProductFilters';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryWithChildren[];
  currentCategorySlug?: string;
  resultCount?: number;
  priceRange?: { min: number; max: number };
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  currentCategorySlug,
  resultCount,
  priceRange,
}: MobileFilterDrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="absolute inset-x-0 bottom-0 max-h-[88vh] bg-white rounded-t-xl shadow-2xl animate-slide-up overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-100">
          <div className="flex items-center gap-2">
            <span className="w-4 h-px bg-primary-500" />
            <h2 className="text-[11px] font-mono font-semibold text-secondary-600 uppercase tracking-widest">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 text-secondary-400 hover:text-secondary-700 transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <ProductFilters
            categories={categories}
            currentCategorySlug={currentCategorySlug}
            priceRange={priceRange}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-secondary-100 bg-secondary-50">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-primary-500 text-secondary-900 font-mono font-semibold text-xs uppercase tracking-widest rounded-full hover:bg-primary-400 transition-colors active:scale-[0.98]"
          >
            {resultCount !== undefined
              ? `Show ${resultCount} Result${resultCount !== 1 ? 's' : ''}`
              : 'Show Results'}
          </button>
        </div>
      </div>
    </div>
  );
}
