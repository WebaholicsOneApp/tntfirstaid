'use client';

import { useState, useEffect } from 'react';
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

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  categories?: CategoryWithChildren[];
}

export default function MobileMenu({ isOpen, onClose, siteName, categories }: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  // Reset expanded category when menu closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedCategory(null);
    }
  }, [isOpen]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Slide-out menu */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-secondary-800 shadow-2xl flex flex-col transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Menu header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-700">
          <span className="font-display font-bold text-primary-500 tracking-wider uppercase">
            {siteName}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-secondary-400 hover:text-primary-500 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable nav links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Main navigation links */}
          {[
            { href: '/shop', label: 'Shop' },
            { href: '/team-alpha', label: 'Team Alpha' },
            { href: '/about', label: 'About Us' },
            { href: '/distributors', label: 'Distributors' },
            { href: '/news', label: 'News and Data' },
            { href: '/calculator', label: "Kauber's Wind Constant Calculator" },
            { href: '/contact', label: 'Contact' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block py-3 px-5 text-secondary-100 hover:text-primary-500 hover:bg-secondary-700 transition-colors font-medium uppercase tracking-wider text-sm"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dealer-sign-up"
            onClick={onClose}
            className="block py-2.5 px-8 text-secondary-300 hover:text-primary-500 hover:bg-secondary-700 transition-colors text-sm"
          >
            Dealer Sign Up
          </Link>

          {/* Category links */}
          {categories && categories.length > 0 && (
            <div className="border-t border-secondary-700 mt-4 pt-4">
              <p className="px-5 pb-2 text-xs text-secondary-400 uppercase tracking-wider font-medium">
                Categories
              </p>
              {categories.map(cat => (
                <div key={cat.id}>
                  <div className="flex items-center">
                    <Link
                      href={`/shop?category=${slugify(cat.categoryName)}`}
                      onClick={onClose}
                      className="flex-1 py-2.5 px-5 text-secondary-200 hover:text-primary-500 hover:bg-secondary-700 transition-colors text-sm"
                    >
                      {cat.categoryName}
                    </Link>
                    {cat.children.length > 0 && (
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="p-2.5 text-secondary-400 hover:text-primary-500 transition-colors"
                        aria-label={`Expand ${cat.categoryName}`}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedCategory === cat.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {/* Subcategories */}
                  {expandedCategory === cat.id && cat.children.length > 0 && (
                    <div className="bg-secondary-900/50 py-1">
                      {cat.children.map(subcat => (
                        <Link
                          key={subcat.id}
                          href={`/shop?category=${slugify(subcat.categoryName)}`}
                          onClick={onClose}
                          className="block py-2 px-8 text-secondary-300 hover:text-primary-500 hover:bg-secondary-700 transition-colors text-sm"
                        >
                          {subcat.categoryName}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Help */}
          <div className="border-t border-secondary-700 mt-4 pt-4">
            <Link
              href="/faq"
              onClick={onClose}
              className="block py-3 px-5 text-secondary-100 hover:text-primary-500 hover:bg-secondary-700 transition-colors font-medium text-sm"
            >
              Help Center
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
