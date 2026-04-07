"use client";

import Link from "next/link";
import type { CategoryWithChildren } from "~/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
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
    <div className="border-primary-500 absolute top-full right-0 left-0 z-50 border-t-2 bg-white shadow-2xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
          {displayCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <Link
                href={`/shop?category=${slugify(category.categoryName)}`}
                onClick={onClose}
                className="group block"
              >
                <h3 className="text-secondary-800 group-hover:text-primary-600 text-sm font-semibold tracking-wider uppercase transition-colors">
                  {category.categoryName}
                </h3>
                {(category.productCount ?? 0) > 0 && (
                  <p className="text-secondary-400 mt-0.5 text-xs">
                    {category.productCount} products
                  </p>
                )}
              </Link>

              {/* Subcategories */}
              {category.children.length > 0 && (
                <div className="border-secondary-100 space-y-1 border-t pt-1">
                  {category.children.slice(0, 5).map((subcat) => (
                    <Link
                      key={subcat.id}
                      href={`/shop?category=${slugify(subcat.categoryName)}`}
                      onClick={onClose}
                      className="text-secondary-500 hover:text-primary-600 block py-0.5 text-sm transition-colors"
                    >
                      {subcat.categoryName}
                    </Link>
                  ))}
                  {category.children.length > 5 && (
                    <Link
                      href={`/shop?category=${slugify(category.categoryName)}`}
                      onClick={onClose}
                      className="text-primary-600 hover:text-primary-700 block py-0.5 text-xs font-medium"
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
        <div className="border-secondary-100 mt-6 border-t pt-4 text-center">
          <Link
            href="/shop"
            onClick={onClose}
            className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            View All Products
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
