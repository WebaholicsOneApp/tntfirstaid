"use client";

import { useEffect } from "react";
import type { CategoryWithChildren } from "~/types";
import ProductFilters from "./ProductFilters";

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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
      <div className="animate-slide-up absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-secondary-100 flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary-500 h-px w-4" />
            <h2 className="text-secondary-600 font-mono text-[11px] font-semibold tracking-widest uppercase">
              Filters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-700 -mr-1 p-2 transition-colors"
            aria-label="Close filters"
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
        <div className="border-secondary-100 bg-secondary-50 border-t px-5 py-4">
          <button
            onClick={onClose}
            className="bg-primary-500 text-secondary-900 hover:bg-primary-400 w-full rounded-full py-3.5 font-mono text-xs font-semibold tracking-widest uppercase transition-colors active:scale-[0.98]"
          >
            {resultCount !== undefined
              ? `Show ${resultCount} Result${resultCount !== 1 ? "s" : ""}`
              : "Show Results"}
          </button>
        </div>
      </div>
    </div>
  );
}
