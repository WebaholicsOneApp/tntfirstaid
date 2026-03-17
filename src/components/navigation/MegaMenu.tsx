'use client';

import Link from 'next/link';
import type { CategoryWithChildren } from '~/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

interface MegaMenuProps {
  categories: CategoryWithChildren[];
  onClose: () => void;
}

export default function MegaMenu({ categories, onClose }: MegaMenuProps) {
  // Show up to 6 top-level categories in the grid
  const displayCategories = categories.slice(0, 6);

  return (
    <div className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t-2 border-primary-500 z-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {displayCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <Link
                href={`/shop?category=${slugify(category.categoryName)}`}
                onClick={onClose}
                className="group block"
              >
                <h3 className="text-sm font-semibold text-secondary-800 group-hover:text-primary-600 transition-colors uppercase tracking-wider">
                  {category.categoryName}
                </h3>
                {(category.productCount ?? 0) > 0 && (
                  <p className="text-xs text-secondary-400 mt-0.5">
                    {category.productCount} products
                  </p>
                )}
              </Link>

              {/* Subcategories */}
              {category.children.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-secondary-100">
                  {category.children.slice(0, 5).map((subcat) => (
                    <Link
                      key={subcat.id}
                      href={`/shop?category=${slugify(subcat.categoryName)}`}
                      onClick={onClose}
                      className="block py-0.5 text-sm text-secondary-500 hover:text-primary-600 transition-colors"
                    >
                      {subcat.categoryName}
                    </Link>
                  ))}
                  {category.children.length > 5 && (
                    <Link
                      href={`/shop?category=${slugify(category.categoryName)}`}
                      onClick={onClose}
                      className="block py-0.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      +{category.children.length - 5} more
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All link */}
        <div className="mt-6 pt-4 border-t border-secondary-100 text-center">
          <Link
            href="/shop"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
          >
            View All Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
