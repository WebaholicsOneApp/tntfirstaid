"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "~/lib/cart";
import { useAuth } from "~/lib/auth";
import type { CategoryWithChildren } from "~/types";
import MobileMenu from "./MobileMenu";
import MegaMenu from "~/components/navigation/MegaMenu";
import { SearchOverlay } from "~/components/search/SearchOverlay";

interface HeaderProps {
  siteName?: string;
  logoUrl?: string;
  categories?: CategoryWithChildren[];
}

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/team-alpha", label: "Team Alpha" },
  { href: "/about", label: "About Us" },
  { href: "/distributors", label: "Distributors" },
  { href: "/news", label: "News and Data" },
  { href: "/calculator", label: "Kauber's Wind Constant Calculator" },
  {
    href: "/contact",
    label: "Contact",
    children: [
      { href: "/contact", label: "Contact Us" },
      { href: "/dealer-sign-up", label: "Dealer Sign Up" },
    ],
  },
];

export default function Header({
  siteName = "Alpha Munitions",
  logoUrl = "/images/alpha-logo-wide.png",
  categories,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contactDropdownTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const accountDropdownTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const { cart, openCart } = useCart();
  const { isAuthenticated, customerAuthEnabled, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
    <header
      className={`transition-all duration-500 ${scrolled ? "bg-secondary-800/95 border-primary-500/[0.08] border-b shadow-lg backdrop-blur-sm" : "bg-secondary-800 border-secondary-800 border-b"}`}
    >
      <div className="w-full px-4 py-5 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Left: Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-primary-400 p-2 transition-colors hover:text-white lg:hidden"
              aria-label="Open navigation menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link href="/" className="flex items-center">
              <Image
                src={logoUrl}
                alt={siteName}
                width={300}
                height={50}
                className="h-auto w-[160px] sm:w-[220px] lg:w-[240px] xl:w-[280px]"
                priority
              />
            </Link>
          </div>

          {/* Center: Desktop navigation */}
          <nav className="hidden items-center gap-0 lg:flex">
            {navLinks.map((link) => {
              if (link.href === "/shop") {
                return (
                  <div
                    key={link.href}
                    className="group relative"
                    onMouseEnter={handleShopEnter}
                    onMouseLeave={handleShopLeave}
                  >
                    <Link
                      href={link.href}
                      className={`relative px-1.5 py-2 text-[9px] font-medium tracking-[0.08em] whitespace-nowrap uppercase transition-colors xl:px-2.5 xl:text-[11px] xl:tracking-[0.12em] ${
                        megaMenuOpen
                          ? "text-white"
                          : "text-primary-400 hover:text-white"
                      }`}
                    >
                      {link.label}
                      <span
                        className={`bg-primary-500 absolute bottom-0 left-0 h-[2px] transition-[width] duration-300 ${
                          megaMenuOpen ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                  </div>
                );
              }
              if (link.children) {
                return (
                  <div
                    key={link.href}
                    className="group relative"
                    onMouseEnter={() => {
                      if (contactDropdownTimeoutRef.current)
                        clearTimeout(contactDropdownTimeoutRef.current);
                      setContactDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      contactDropdownTimeoutRef.current = setTimeout(
                        () => setContactDropdownOpen(false),
                        150,
                      );
                    }}
                  >
                    <Link
                      href={link.href}
                      className={`relative px-1.5 py-2 text-[9px] font-medium tracking-[0.08em] whitespace-nowrap uppercase transition-colors xl:px-2.5 xl:text-[11px] xl:tracking-[0.12em] ${
                        contactDropdownOpen
                          ? "text-white"
                          : "text-primary-400 hover:text-white"
                      }`}
                    >
                      {link.label}
                      <span
                        className={`bg-primary-500 absolute bottom-0 left-0 h-[2px] transition-[width] duration-300 ${
                          contactDropdownOpen
                            ? "w-full"
                            : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                    {contactDropdownOpen && (
                      <div className="bg-secondary-800 border-secondary-700 absolute top-full right-0 z-50 mt-1 min-w-[160px] rounded-md border py-1 shadow-xl">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="text-primary-400 hover:bg-secondary-700 block px-4 py-2.5 text-[11px] font-medium tracking-[0.08em] whitespace-nowrap uppercase transition-colors hover:text-white"
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
                <div key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    className="text-primary-400 relative px-1.5 py-2 text-[9px] font-medium tracking-[0.08em] whitespace-nowrap uppercase transition-colors hover:text-white xl:px-2.5 xl:text-[11px] xl:tracking-[0.12em]"
                  >
                    {link.label}
                    <span className="bg-primary-500 absolute bottom-0 left-0 h-[2px] w-0 transition-[width] duration-300 group-hover:w-full" />
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right: Search + Account + Cart */}
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <button
              onClick={() => setSearchOverlayOpen(!searchOverlayOpen)}
              className="text-primary-400 p-2 transition-colors hover:text-white"
              aria-label="Open search"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Account icon — hidden when auth is disabled */}
            {customerAuthEnabled && !isAuthenticated && (
              <Link
                href="/account"
                className="text-primary-400 p-2 transition-colors hover:text-white"
                aria-label="Sign in"
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
              </Link>
            )}
            {customerAuthEnabled && isAuthenticated && (
              <div
                className="relative"
                onMouseEnter={() => {
                  if (accountDropdownTimeoutRef.current)
                    clearTimeout(accountDropdownTimeoutRef.current);
                  setAccountDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  accountDropdownTimeoutRef.current = setTimeout(
                    () => setAccountDropdownOpen(false),
                    200,
                  );
                }}
              >
                <Link
                  href="/account/dashboard"
                  className="text-primary-400 block p-2 transition-colors hover:text-white"
                  aria-label="My account"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </Link>
                {accountDropdownOpen && (
                  <div className="bg-secondary-800 border-secondary-700 absolute top-full right-0 z-50 mt-1 min-w-[160px] rounded-md border py-1 shadow-xl">
                    <Link
                      href="/account/dashboard"
                      className="text-primary-400 hover:bg-secondary-700 block px-4 py-2 text-sm transition-colors hover:text-white"
                      onClick={() => setAccountDropdownOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/account/profile"
                      className="text-primary-400 hover:bg-secondary-700 block px-4 py-2 text-sm transition-colors hover:text-white"
                      onClick={() => setAccountDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/account/orders"
                      className="text-primary-400 hover:bg-secondary-700 block px-4 py-2 text-sm transition-colors hover:text-white"
                      onClick={() => setAccountDropdownOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      href="/account/security"
                      className="text-primary-400 hover:bg-secondary-700 block px-4 py-2 text-sm transition-colors hover:text-white"
                      onClick={() => setAccountDropdownOpen(false)}
                    >
                      Security
                    </Link>
                    <div className="border-secondary-700 my-1 border-t" />
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        logout();
                      }}
                      className="hover:bg-secondary-700 w-full px-4 py-2 text-left text-sm text-red-400 transition-colors hover:text-red-300"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart icon */}
            <button
              onClick={openCart}
              className="text-primary-400 relative p-2 transition-colors hover:text-white"
              aria-label="Open cart"
              suppressHydrationWarning
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cart.itemCount > 0 && (
                <span
                  className="bg-primary-500 text-secondary-800 absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  suppressHydrationWarning
                >
                  {cart.itemCount > 99 ? "99+" : cart.itemCount}
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
          className="animate-slide-up"
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
