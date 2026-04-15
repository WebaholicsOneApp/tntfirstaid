"use client";

import { ProductImage } from "~/components/ui/ProductImage";
import Link from "next/link";
import { useState } from "react";
import type { ProductListItem } from "~/types";
import { formatCentsToDollars, cn } from "~/lib/utils";
import StockBadge from "./StockBadge";
import { useCart } from "~/lib/cart";
import { Spinner } from "~/components/ui/Spinner";
import { prefetchProduct } from "~/lib/product-prefetch";

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
  theme?: "light" | "dark";
  onQuickAdd?: () => void;
}

export default function ProductCard({
  product,
  className,
  theme = "light",
  onQuickAdd,
}: ProductCardProps) {
  const isDark = theme === "dark";
  const [imgError, setImgError] = useState(false);
  const [addPhase, setAddPhase] = useState<"idle" | "adding" | "added">("idle");
  const { addItem } = useCart();
  const imageSrc = imgError
    ? product.fallbackImage
    : (product.primaryImage ?? product.fallbackImage);

  const hasRange =
    product.maxPrice != null &&
    product.price != null &&
    product.maxPrice > product.price;

  const priceDisplay = hasRange
    ? `${formatCentsToDollars(product.price)} – ${formatCentsToDollars(product.maxPrice)}`
    : formatCentsToDollars(product.price);

  const isVariable = product.variationCount > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock || addPhase !== "idle") return;

    if (isVariable) {
      onQuickAdd?.();
      return;
    }

    // Simple product — add directly
    if (!product.variationId) {
      console.warn(
        `[ProductCard] Missing variationId for simple product "${product.name}" (id=${product.id}). Cart may use wrong ID.`,
      );
    }
    setAddPhase("adding");
    addItem({
      id: product.variationId ?? product.id,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: product.price ?? 0,
      image: product.primaryImage ?? product.fallbackImage,
      isDownloadable: product.isDownloadable || undefined,
    });
    setAddPhase("added");
    setTimeout(() => setAddPhase("idle"), 1200);
  };

  const handleSelectOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAdd?.();
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      onPointerEnter={() => prefetchProduct(product.slug)}
      className={cn(
        "group block border transition-all duration-300 ease-out",
        isDark
          ? "bg-secondary-900 border-primary-500/10 hover:border-primary-500/30 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(227,24,55,0.12)] active:translate-y-0 active:scale-[0.99]"
          : "border-secondary-100 hover:border-primary-300 rounded-lg bg-white hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(227,24,55,0.10)] active:translate-y-0 active:scale-[0.99]",
        className,
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative aspect-[3/4] overflow-hidden",
          isDark ? "bg-secondary-800" : "rounded-t-lg bg-white",
        )}
      >
        {/* Sale badge */}
        {product.msrp != null &&
          product.price != null &&
          product.msrp > product.price && (
            <div className="bg-primary-500 text-secondary-900 absolute top-2 left-2 z-10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase">
              Sale
            </div>
          )}
        {/* Digital download badge */}
        {product.isDownloadable && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-sky-700">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Digital
          </div>
        )}
        {imageSrc ? (
          <ProductImage
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-secondary-300 flex h-full w-full items-center justify-center">
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3.5">
        {/* Product name */}
        <h3
          className={cn(
            "line-clamp-2 text-xs leading-snug font-medium transition-colors sm:text-sm",
            isDark
              ? "text-secondary-100 group-hover:text-primary-400"
              : "text-secondary-800 group-hover:text-primary-600",
          )}
        >
          {product.name}
        </h3>

        {/* Star rating */}
        {product.totalReviews != null && product.totalReviews > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    fill="currentColor"
                    className={
                      star <= Math.round(product.averageRating ?? 0)
                        ? "text-amber-400"
                        : isDark
                          ? "text-secondary-600"
                          : "text-secondary-200"
                    }
                  />
                </svg>
              ))}
            </div>
            <span
              className={cn(
                "text-[10px]",
                isDark ? "text-secondary-500" : "text-secondary-400",
              )}
            >
              ({product.totalReviews})
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
          <p
            className={cn(
              "text-sm font-bold sm:text-base",
              isDark ? "text-primary-500" : "text-secondary-900",
            )}
          >
            {priceDisplay}
          </p>
          {product.msrp != null &&
            product.price != null &&
            product.msrp > product.price && (
              <p className="text-secondary-400 text-xs line-through">
                {formatCentsToDollars(product.msrp)}
              </p>
            )}
        </div>

        {/* Stock badge */}
        <div className="mt-1.5">
          <StockBadge inStock={product.inStock} />
        </div>

        {/* Desktop: full-width hover button */}
        <div className="mt-2.5 hidden max-h-0 overflow-hidden opacity-0 transition-all duration-200 ease-out group-hover:max-h-20 group-hover:opacity-100 md:block">
          {isVariable ? (
            <button
              onClick={handleSelectOptions}
              className="bg-primary-500 text-secondary-950 hover:bg-primary-400 w-full cursor-pointer rounded-full py-2 font-mono text-[11px] font-semibold tracking-wider uppercase transition-colors active:scale-[0.97]"
            >
              Select Options
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || addPhase !== "idle"}
              className={cn(
                "flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 font-mono text-[11px] font-semibold tracking-wider uppercase transition-colors active:scale-[0.97]",
                addPhase === "added"
                  ? "bg-green-600 text-white"
                  : product.inStock
                    ? "bg-primary-500 text-secondary-950 hover:bg-primary-400"
                    : "bg-secondary-100 text-secondary-400 cursor-not-allowed",
              )}
            >
              {addPhase === "adding" && <Spinner />}
              {addPhase === "added"
                ? "Added!"
                : addPhase === "adding"
                  ? "Adding…"
                  : product.inStock
                    ? "Add to Cart"
                    : "Out of Stock"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
