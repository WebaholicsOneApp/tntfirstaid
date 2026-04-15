"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import type { CategoryWithChildren } from "~/types";
import { useAuth } from "~/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  categories?: CategoryWithChildren[];
}

export default function MobileMenu({
  isOpen,
  onClose,
  siteName,
  categories,
}: MobileMenuProps) {
  const { isAuthenticated, customerAuthEnabled, logout } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset expanded category when menu closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedCategory(null);
    }
  }, [isOpen]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />
      )}

      {/* Slide-out menu */}
      <div
        className={`bg-secondary-800 fixed inset-y-0 left-0 z-[70] flex w-72 transform flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Menu header */}
        <div className="border-secondary-700 flex items-center justify-between border-b px-5 py-4">
          <Image
            src="/images/tnt-logo.png"
            alt={siteName}
            width={300}
            height={50}
            className="h-auto w-[140px]"
          />
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-primary-500 p-1 transition-colors"
            aria-label="Close menu"
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
        </div>

        {/* Scrollable nav links */}
        <nav className="flex-1 overflow-y-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Main navigation links */}
          {[
            { href: "/shop", label: "Shop" },
            { href: "/services", label: "Services" },
            { href: "/training-videos", label: "Training Videos" },
            { href: "/about", label: "About Us" },
            { href: "/news", label: "News" },
            { href: "/faq", label: "FAQ" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-secondary-100 hover:text-primary-500 hover:bg-secondary-700 block px-5 py-3 text-sm font-medium tracking-wider uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Account link — hidden when auth is disabled */}
          {customerAuthEnabled && !isAuthenticated && (
            <div className="border-secondary-700 mt-4 border-t pt-4">
              <Link
                href="/account"
                onClick={onClose}
                className="text-secondary-100 hover:text-primary-500 hover:bg-secondary-700 flex items-center gap-3 px-5 py-3 text-sm font-medium tracking-wider uppercase transition-colors"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Sign In
              </Link>
            </div>
          )}
          {customerAuthEnabled && isAuthenticated && (
            <div className="border-secondary-700 mt-4 border-t pt-4">
              <Link
                href="/account/dashboard"
                onClick={onClose}
                className="text-secondary-100 hover:text-primary-500 hover:bg-secondary-700 flex items-center gap-3 px-5 py-3 text-sm font-medium tracking-wider uppercase transition-colors"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                My Account
              </Link>
              <Link
                href="/account/profile"
                onClick={onClose}
                className="text-secondary-300 hover:text-primary-500 hover:bg-secondary-700 block px-8 py-2.5 text-sm transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/account/orders"
                onClick={onClose}
                className="text-secondary-300 hover:text-primary-500 hover:bg-secondary-700 block px-8 py-2.5 text-sm transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/account/security"
                onClick={onClose}
                className="text-secondary-300 hover:text-primary-500 hover:bg-secondary-700 block px-8 py-2.5 text-sm transition-colors"
              >
                Security
              </Link>
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="hover:bg-secondary-700 block w-full px-8 py-2.5 text-left text-sm text-red-400 transition-colors hover:text-red-300"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Category links */}
          {categories && categories.length > 0 && (
            <div className="border-secondary-700 mt-4 border-t pt-4">
              <p className="text-secondary-400 px-5 pb-2 text-xs font-medium tracking-wider uppercase">
                Categories
              </p>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center">
                    <Link
                      href={`/shop?category=${slugify(cat.categoryName)}`}
                      onClick={onClose}
                      className="text-secondary-200 hover:text-primary-500 hover:bg-secondary-700 flex-1 px-5 py-2.5 text-sm transition-colors"
                    >
                      {cat.categoryName}
                    </Link>
                    {cat.children.length > 0 && (
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="text-secondary-400 hover:text-primary-500 p-2.5 transition-colors"
                        aria-label={`Expand ${cat.categoryName}`}
                      >
                        <svg
                          className={`h-4 w-4 transition-transform ${expandedCategory === cat.id ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {/* Subcategories */}
                  {expandedCategory === cat.id && cat.children.length > 0 && (
                    <div className="bg-secondary-900/50 py-1">
                      {cat.children.map((subcat) => (
                        <Link
                          key={subcat.id}
                          href={`/shop?category=${slugify(subcat.categoryName)}`}
                          onClick={onClose}
                          className="text-secondary-300 hover:text-primary-500 hover:bg-secondary-700 block px-8 py-2 text-sm transition-colors"
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
          <div className="border-secondary-700 mt-4 border-t px-5 pt-4 pb-4">
            <Link
              href="/faq"
              onClick={onClose}
              className="border-primary-500/40 text-primary-400/80 hover:border-primary-500 block rounded-full border px-5 py-2.5 text-center font-mono text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-300"
            >
              Help Center
            </Link>
          </div>
        </nav>
      </div>
    </>,
    document.body,
  );
}
