"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWishlist } from "~/lib/wishlist";
import { useCart } from "~/lib/cart";
import { ProductImage } from "~/components/ui/ProductImage";
import { formatCentsToDollars } from "~/lib/utils";

export default function WishlistClient() {
  const { items, remove, clear } = useWishlist();
  const { addItem } = useCart();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Avoid hydration mismatch — items live in localStorage so the first
  // server-rendered HTML can't know them.
  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="bg-primary-50 mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <svg
            className="text-primary-400 h-12 w-12"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </div>
        <h1 className="font-display text-secondary-900 mb-2 text-3xl font-bold">
          Your wishlist is empty
        </h1>
        <p className="text-secondary-500 mx-auto mb-8 max-w-md text-sm">
          Tap the heart on any product to save it here. We&apos;ll keep your
          list across visits on this device.
        </p>
        <Link
          href="/shop"
          className="bg-primary-500 hover:bg-primary-600 rounded-xl px-6 py-3 font-semibold text-white transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-8" />
            <span className="text-primary-600 text-sm font-semibold tracking-wide uppercase">
              Wishlist
            </span>
          </div>
          <h1 className="font-display text-secondary-900 text-3xl font-bold tracking-tight sm:text-4xl">
            Saved for Later
          </h1>
          <p className="text-secondary-500 mt-2 text-sm">
            {items.length} {items.length === 1 ? "item" : "items"} saved on
            this device.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear your wishlist?")) clear();
          }}
          className="text-secondary-500 hover:text-primary-600 cursor-pointer text-sm transition-colors"
        >
          Clear all
        </button>
      </div>

      <ul className="divide-secondary-100 ring-secondary-100 divide-y rounded-2xl bg-white shadow-sm ring-1">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
          >
            <Link
              href={`/product/${item.productSlug}`}
              className="bg-secondary-50 ring-secondary-100 relative block h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-1 sm:h-28 sm:w-28"
            >
              {item.image ? (
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              ) : (
                <div className="text-secondary-300 flex h-full w-full items-center justify-center">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              {item.brandName && (
                <p className="text-secondary-400 mb-1 font-mono text-[0.65rem] tracking-[0.2em] uppercase">
                  {item.brandName}
                </p>
              )}
              <Link
                href={`/product/${item.productSlug}`}
                className="hover:text-primary-600 text-secondary-900 line-clamp-2 text-base font-semibold transition-colors"
              >
                {item.name}
              </Link>
              {typeof item.price === "number" && item.price > 0 && (
                <p className="text-secondary-900 mt-1 font-semibold">
                  {formatCentsToDollars(item.price)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  if (typeof item.price !== "number") {
                    // No price snapshot — bounce to PDP where variation can be picked.
                    window.location.href = `/product/${item.productSlug}`;
                    return;
                  }
                  addItem({
                    id: item.productId,
                    productId: item.productId,
                    productSlug: item.productSlug,
                    name: item.name,
                    price: item.price,
                    image: item.image ?? undefined,
                  });
                }}
                className="bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => remove(item.productId)}
                aria-label={`Remove ${item.name} from wishlist`}
                className="text-secondary-400 hover:text-red-600 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-secondary-400 mt-6 text-center text-xs">
        Wishlist is saved on this device only. Sign in to sync across devices
        (coming soon).
      </p>
    </div>
  );
}
