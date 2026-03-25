'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import type { CategoryWithChildren } from '~/types';
import { useAuth } from '~/lib/auth';

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
  const { isAuthenticated, customerAuthEnabled, logout } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Reset expanded category when menu closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedCategory(null);
    }
  }, [isOpen]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={onClose}
        />
      )}

      {/* Slide-out menu */}
      <div className={`fixed inset-y-0 left-0 z-[70] w-72 bg-secondary-800 shadow-2xl flex flex-col transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Menu header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-700">
          <Image
            src="https://alphamunitions.com/wp-content/uploads/2019/03/Alpha-Muntions-Gold.png"
            alt={siteName}
            width={300}
            height={50}
            className="w-[140px] h-auto"
          />
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
        <nav className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-4">
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

          {/* Account link — hidden when auth is disabled */}
          {customerAuthEnabled && !isAuthenticated && (
            <div className="border-t border-secondary-700 mt-4 pt-4">
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-3 py-3 px-5 text-secondary-100 hover:text-primary-500 hover:bg-secondary-700 transition-colors font-medium uppercase tracking-wider text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sign In
              </Link>
            </div>
          )}
          {customerAuthEnabled && isAuthenticated && (
            <div className="border-t border-secondary-700 mt-4 pt-4">
              <Link
                href="/account/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 py-3 px-5 text-secondary-100 hover:text-primary-500 hover:bg-secondary-700 transition-colors font-medium uppercase tracking-wider text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Account
              </Link>
              <Link
                href="/account/profile"
                onClick={onClose}
                className="block py-2.5 px-8 text-secondary-300 hover:text-primary-500 hover:bg-secondary-700 transition-colors text-sm"
              >
                Profile
              </Link>
              <Link
                href="/account/orders"
                onClick={onClose}
                className="block py-2.5 px-8 text-secondary-300 hover:text-primary-500 hover:bg-secondary-700 transition-colors text-sm"
              >
                Orders
              </Link>
              <Link
                href="/account/security"
                onClick={onClose}
                className="block py-2.5 px-8 text-secondary-300 hover:text-primary-500 hover:bg-secondary-700 transition-colors text-sm"
              >
                Security
              </Link>
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="block py-2.5 px-8 text-red-400 hover:text-red-300 hover:bg-secondary-700 transition-colors text-sm w-full text-left"
              >
                Sign Out
              </button>
            </div>
          )}

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
          <div className="border-t border-secondary-700 mt-4 pt-4 px-5 pb-4">
            <Link
              href="/faq"
              onClick={onClose}
              className="block py-2.5 px-5 rounded-full border border-primary-500/40 text-[0.7rem] font-mono tracking-[0.15em] text-primary-400/80 uppercase text-center hover:border-primary-500 transition-all duration-300"
            >
              Help Center
            </Link>
          </div>
        </nav>
      </div>
    </>,
    document.body
  );
}
