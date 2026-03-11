import Image from 'next/image';
import Link from 'next/link';
import type { StoreConfig } from '~/lib/store-config';

interface FooterProps {
  siteName?: string;
  storeConfig?: StoreConfig;
}

export default function Footer({ siteName = 'Alpha Munitions' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-800 text-secondary-300 mt-auto">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* Column 1: Logo + Social */}
          <div className="text-center md:text-left">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="https://alphamunitions.com/wp-content/uploads/2019/06/Alpha-Logo-Gold1.png"
                alt={siteName}
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            {/* Social icons */}
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <a
                href="https://www.facebook.com/AlphaMunitions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-primary-500 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/alphamunitions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Archives */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Archives
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/news" className="hover:text-primary-500 transition-colors">April 2024</Link></li>
              <li><Link href="/news" className="hover:text-primary-500 transition-colors">July 2021</Link></li>
              <li><Link href="/news" className="hover:text-primary-500 transition-colors">June 2021</Link></li>
              <li><Link href="/news" className="hover:text-primary-500 transition-colors">May 2021</Link></li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-primary-500 transition-colors">Shop</Link></li>
              <li><Link href="/about" className="hover:text-primary-500 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary-500 transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary-500 transition-colors">FAQ</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-primary-500 transition-colors">Shipping &amp; Returns</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-secondary-700">
        <div className="container mx-auto px-4 py-5">
          <p className="text-secondary-400 text-sm text-center">
            &copy; {currentYear} {siteName}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
