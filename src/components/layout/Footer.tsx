import Image from "next/image";
import Link from "next/link";
import type { StoreConfig } from "~/lib/store-config";

interface FooterProps {
  siteName?: string;
  logoUrl?: string;
  storeConfig?: StoreConfig;
}

export default function Footer({
  siteName = "TNT First Aid",
  logoUrl = "/apple-touch-icon.png",
  storeConfig,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-950 text-secondary-300 mt-auto">
      {/* Top gold line */}
      <div className="via-primary-500/40 h-[1px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Logo area — centered */}
        <div className="mb-10 text-center">
          <Link href="/" className="mb-3 inline-block">
            <Image
              src={logoUrl}
              alt={siteName}
              width={200}
              height={60}
              className="mx-auto h-12 w-auto"
            />
          </Link>
        </div>

        {/* Centered gold divider */}
        <div className="via-primary-500/30 mx-auto mb-10 h-[1px] w-[120px] bg-gradient-to-r from-transparent to-transparent" />

        {/* Columns */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 sm:grid-cols-3 lg:gap-16">
          {/* Column 1: Shop */}
          <div className="text-center sm:text-left">
            <h3 className="text-primary-500/60 mb-4 font-mono text-[0.65rem] tracking-[0.25em] uppercase">
              Shop
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/shop"
                  className="text-secondary-400 hover:text-primary-500 text-sm transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-secondary-400 hover:text-primary-500 text-sm transition-colors"
                >
                  Brass
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-secondary-400 hover:text-primary-500 text-sm transition-colors"
                >
                  Reamers &amp; Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="text-center sm:text-left">
            <h3 className="text-primary-500/60 mb-4 font-mono text-[0.65rem] tracking-[0.25em] uppercase">
              Company
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-secondary-400 hover:text-primary-500 text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-secondary-400 hover:text-primary-500 text-sm transition-colors"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-secondary-400 hover:text-primary-500 text-sm transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-returns"
                  className="text-secondary-400 hover:text-primary-500 text-sm transition-colors"
                >
                  Shipping &amp; Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-secondary-400 hover:text-primary-500 text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-secondary-400 hover:text-primary-500 text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="text-center sm:text-left">
            <h3 className="text-primary-500/60 mb-4 font-mono text-[0.65rem] tracking-[0.25em] uppercase">
              Contact &amp; Support
            </h3>
            <ul className="text-secondary-400 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary-500 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-primary-500/10 border-t">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Social icons */}
            <div className="order-2 flex items-center gap-4 sm:order-1">
              <a
                href="https://www.facebook.com/alphamunitions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-500 hover:text-primary-500 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/alpha_munitions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-500 hover:text-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <p className="text-secondary-500 order-1 font-mono text-[0.6rem] tracking-[0.15em] sm:order-2">
              &copy; {currentYear} {siteName}. All Rights Reserved.
            </p>

            {/* Made in USA badge */}
            <p className="text-primary-500/40 order-3 font-mono text-[0.6rem] tracking-[0.15em] uppercase">
              Made in USA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
