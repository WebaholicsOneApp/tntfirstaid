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
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  currentCategorySlug,
  resultCount,
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
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl shadow-xl animate-slide-up overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-800">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ProductFilters
            categories={categories}
            currentCategorySlug={currentCategorySlug}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-secondary-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary-500 text-secondary-900 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-primary-400 transition-colors"
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
