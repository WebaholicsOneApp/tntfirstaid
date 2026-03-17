'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '~/lib/cart';
import type { CategoryWithChildren } from '~/types';
import MobileMenu from './MobileMenu';
import MegaMenu from '~/components/navigation/MegaMenu';
import { SearchOverlay } from '~/components/search/SearchOverlay';

interface HeaderProps {
  siteName?: string;
  categories?: CategoryWithChildren[];
}

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/team-alpha', label: 'Team Alpha' },
  { href: '/about', label: 'About Us' },
  { href: '/distributors', label: 'Distributors' },
  { href: '/news', label: 'News and Data' },
  { href: '/calculator', label: "Kauber's Wind Constant Calculator" },
  {
    href: '/contact',
    label: 'Contact',
    children: [
      { href: '/contact', label: 'Contact Us' },
      { href: '/dealer-sign-up', label: 'Dealer Sign Up' },
    ],
  },
];

export default function Header({ siteName = 'Alpha Munitions', categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contactDropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { cart, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleShopEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleShopLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 150);
  };

  const closeMegaMenu = () => {
    setMegaMenuOpen(false);
  };

  return (
    <header className={`transition-all duration-500 ${scrolled ? 'bg-secondary-800/95 backdrop-blur-sm shadow-lg' : 'bg-secondary-800'}`}>
      <div className="w-full px-4 lg:px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Left: Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-primary-400 hover:text-white transition-colors"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="flex items-center">
              <Image
                src="https://alphamunitions.com/wp-content/uploads/2019/03/Alpha-Muntions-Gold.png"
                alt={siteName}
                width={300}
                height={50}
                className="w-[160px] sm:w-[220px] lg:w-[240px] xl:w-[280px] h-auto"
                priority
              />
            </Link>
          </div>

          {/* Center: Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-0">
            {navLinks.map((link) => {
              if (link.href === '/shop') {
                return (
                  <div
                    key={link.href}
                    className="relative flex items-center"
                    onMouseEnter={handleShopEnter}
                    onMouseLeave={handleShopLeave}
                  >
                    <Link
                      href={link.href}
                      className={`px-1.5 xl:px-2.5 py-2 text-[9px] xl:text-[11px] font-medium uppercase tracking-[0.08em] xl:tracking-[0.12em] transition-colors whitespace-nowrap ${
                        megaMenuOpen
                          ? 'text-white'
                          : 'text-primary-400 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </div>
                );
              }
              if (link.children) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => {
                      if (contactDropdownTimeoutRef.current) clearTimeout(contactDropdownTimeoutRef.current);
                      setContactDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      contactDropdownTimeoutRef.current = setTimeout(() => setContactDropdownOpen(false), 150);
                    }}
                  >
                    <Link
                      href={link.href}
                      className={`px-1.5 xl:px-2.5 py-2 text-[9px] xl:text-[11px] font-medium uppercase tracking-[0.08em] xl:tracking-[0.12em] transition-colors whitespace-nowrap ${
                        contactDropdownOpen ? 'text-white' : 'text-primary-400 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                    {contactDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 min-w-[160px] bg-secondary-800 border border-secondary-700 rounded-md shadow-xl py-1 z-50">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-primary-400 hover:text-white hover:bg-secondary-700 transition-colors whitespace-nowrap"
                            onClick={() => setContactDropdownOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-1.5 xl:px-2.5 py-2 text-[9px] xl:text-[11px] font-medium uppercase tracking-[0.08em] xl:tracking-[0.12em] text-primary-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Account + Cart */}
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <button
              onClick={() => setSearchOverlayOpen(!searchOverlayOpen)}
              className="p-2 text-primary-400 hover:text-white transition-colors"
              aria-label="Open search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Account icon */}
            <Link
              href="/account"
              className="p-2 text-primary-400 hover:text-white transition-colors"
              aria-label="My account"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Cart icon */}
            <button
              onClick={openCart}
              className="relative p-2 text-primary-400 hover:text-white transition-colors"
              aria-label="Open cart"
              suppressHydrationWarning
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary-500 text-secondary-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  suppressHydrationWarning
                >
                  {cart.itemCount > 99 ? '99+' : cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu dropdown */}
      {megaMenuOpen && categories && categories.length > 0 && (
        <div
          onMouseEnter={handleShopEnter}
          onMouseLeave={handleShopLeave}
        >
          <MegaMenu categories={categories} onClose={closeMegaMenu} />
        </div>
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        siteName={siteName}
        categories={categories}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
      />
    </header>
  );
}
