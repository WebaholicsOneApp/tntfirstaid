"use client";

import { useState, useMemo } from "react";
import type { ProductDetail } from "~/types";
import type { ReviewAggregate } from "~/types/review";
import { formatCentsToDollars, cn } from "~/lib/utils";
import { sanitizeProductDescription } from "~/lib/sanitize";
import ProductGallery from "./ProductGallery";
import VariantSelector from "./VariantSelector";
import AddToCartButton from "./AddToCartButton";
import StockBadge from "./StockBadge";
import ReviewsSection from "./ReviewsSection";
import RecommendationGrid from "./RecommendationGrid";
import StarRating from "./StarRating";

interface ProductDetailClientProps {
  product: ProductDetail;
  reviewAggregate?: ReviewAggregate | null;
}

export default function ProductDetailClient({
  product,
  reviewAggregate,
}: ProductDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"description" | "specifications">(
    "description",
  );

  // Find the default variation — first in-stock variation, or just the first
  const defaultVariation = useMemo(() => {
    if (product.variations.length === 0) return null;
    return (
      product.variations.find((v) => v.inStock) ?? product.variations[0] ?? null
    );
  }, [product.variations]);

  // Multi-variation products start with no selection so the price range is shown
  const [selectedVariation, setSelectedVariation] = useState(
    product.variations.length > 1 ? null : defaultVariation,
  );

  // Compute price range across all variations
  const priceRange = useMemo(() => {
    const prices = product.variations
      .map((v) => v.price)
      .filter((p): p is number => p != null && p > 0);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min !== max ? { min, max } : null;
  }, [product.variations]);

  // Get current price to display
  const displayPrice = selectedVariation?.price ?? product.price;
  const displayMsrp = selectedVariation?.msrp ?? product.msrp;
  const isOnSale =
    displayMsrp != null && displayPrice != null && displayMsrp > displayPrice;
  const showRange = !selectedVariation && priceRange != null;

  // Get images — prefer selected variation images, fall back to product images
  const images = useMemo(() => {
    if (selectedVariation && selectedVariation.images.length > 0) {
      return selectedVariation.images;
    }
    return product.images;
  }, [selectedVariation, product.images]);

  // Sanitize description for rendering
  const sanitizedDescription = useMemo(
    () => sanitizeProductDescription(product.description),
    [product.description],
  );

  // Split bulletPoints: items with "Label: value" pattern → specs, rest → features
  const { specs, features } = useMemo(() => {
    const specs: { label: string; value: string }[] = [];
    const features: string[] = [];
    for (const point of product.bulletPoints) {
      const colonIdx = point.indexOf(":");
      if (colonIdx > 0 && colonIdx < 30) {
        specs.push({
          label: point.slice(0, colonIdx).trim(),
          value: point.slice(colonIdx + 1).trim(),
        });
      } else {
        features.push(point);
      }
    }
    return { specs, features };
  }, [product.bulletPoints]);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
      {/* Left: Image Gallery */}
      <ProductGallery images={images} productName={product.name} />

      {/* Right: Product Info */}
      <div className="space-y-6">
        {/* Category */}
        {product.categoryName && (
          <p className="text-primary-600 text-xs font-semibold tracking-wider uppercase">
            {product.categoryName}
          </p>
        )}

        {/* Product name + SKU */}
        <div className="space-y-1">
          <h1 className="font-display text-secondary-900 text-2xl leading-tight font-bold sm:text-3xl">
            {product.name}
          </h1>
          {selectedVariation?.manufacturerNo && (
            <p className="inline-flex items-center gap-1.5 text-xs">
              <span className="text-secondary-400 tracking-wider uppercase">
                SKU
              </span>
              <span className="text-secondary-300">|</span>
              <span className="text-secondary-500 font-mono">
                {selectedVariation.manufacturerNo}
              </span>
            </p>
          )}
        </div>

        {/* Star rating summary */}
        {reviewAggregate && reviewAggregate.totalReviews > 0 && (
          <button
            onClick={() =>
              document
                .getElementById("reviews-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <StarRating rating={reviewAggregate.averageRating} />
            <span className="text-secondary-500 text-sm">
              {reviewAggregate.averageRating.toFixed(1)} (
              {reviewAggregate.totalReviews} review
              {reviewAggregate.totalReviews !== 1 ? "s" : ""})
            </span>
          </button>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-secondary-900 text-2xl font-bold">
            {showRange
              ? `${formatCentsToDollars(priceRange.min)} – ${formatCentsToDollars(priceRange.max)}`
              : formatCentsToDollars(displayPrice)}
          </span>
          {!showRange && isOnSale && (
            <span className="text-secondary-400 text-lg line-through">
              {formatCentsToDollars(displayMsrp)}
            </span>
          )}
        </div>

        {/* Stock / download status */}
        {product.isDownloadable ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Digital Download
          </span>
        ) : (
          <StockBadge
            inStock={selectedVariation?.inStock ?? product.inStock}
            quantity={selectedVariation?.quantity}
          />
        )}

        {/* Variant selector */}
        {product.variations.length > 1 && (
          <VariantSelector
            variations={product.variations}
            selectedVariationId={selectedVariation?.id ?? null}
            onSelect={setSelectedVariation}
            onClear={() => setSelectedVariation(null)}
          />
        )}

        {/* Add to cart */}
        <AddToCartButton
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          variation={selectedVariation}
          productImage={product.primaryImage}
        />

        {/* Tags */}
        {product.keywords && (
          <div className="text-secondary-500 text-sm">
            <p>
              <span className="text-secondary-700 font-medium">Tags:</span>{" "}
              {product.keywords
                .split(/[|,]/)
                .map((tag) => tag.trim())
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}

        {/* Feature bullet points (non-spec items only — specs go in Specifications tab) */}
        {features.length > 0 && (
          <ul className="space-y-2">
            {features.map((point, i) => (
              <li
                key={i}
                className="text-secondary-600 flex items-start gap-2 text-sm"
              >
                <svg
                  className="text-primary-500 mt-0.5 h-4 w-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        )}

        {/* Tabs: Description / Specifications */}
        <div className="border-secondary-100 border-t pt-4">
          <div className="border-secondary-200 flex border-b">
            <button
              onClick={() => setActiveTab("description")}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-75 active:scale-95",
                activeTab === "description"
                  ? "border-primary-500 text-primary-700"
                  : "text-secondary-500 hover:text-secondary-700 border-transparent",
              )}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("specifications")}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-75 active:scale-95",
                activeTab === "specifications"
                  ? "border-primary-500 text-primary-700"
                  : "text-secondary-500 hover:text-secondary-700 border-transparent",
              )}
            >
              Specifications
            </button>
          </div>

          <div className="pt-4">
            {activeTab === "description" &&
              (sanitizedDescription ? (
                <div
                  className="product-description prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              ) : (
                <p className="text-secondary-400 text-sm italic">
                  No description available.
                </p>
              ))}
            {activeTab === "specifications" && (
              <div className="space-y-3">
                {product.categoryName && (
                  <SpecRow label="Category" value={product.categoryName} />
                )}
                {selectedVariation?.manufacturerNo && (
                  <SpecRow
                    label="Manufacturer #"
                    value={selectedVariation.manufacturerNo}
                  />
                )}
                {selectedVariation?.weight != null &&
                  selectedVariation.weight > 0 && (
                    <SpecRow
                      label="Weight"
                      value={`${selectedVariation.weight} lbs`}
                    />
                  )}
                {specs.map((spec) => (
                  <SpecRow
                    key={spec.label}
                    label={spec.label}
                    value={spec.value}
                  />
                ))}
                {selectedVariation?.variation && (
                  <SpecRow
                    label={selectedVariation.variantType ?? "Variant"}
                    value={selectedVariation.variation}
                  />
                )}
                {selectedVariation?.variationTwo && (
                  <SpecRow
                    label={selectedVariation.variantTypeTwo ?? "Variant 2"}
                    value={selectedVariation.variationTwo}
                  />
                )}
                {product.brandName && product.brandName !== "#N/A" && (
                  <SpecRow label="Brand" value={product.brandName} />
                )}
                {specs.length === 0 &&
                  !product.categoryName &&
                  !selectedVariation && (
                    <p className="text-secondary-400 text-sm italic">
                      No specifications available.
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews — standalone section below product detail */}
      <div className="col-span-full">
        <ReviewsSection
          productId={product.id}
          productName={product.name}
          aggregate={reviewAggregate ?? null}
        />
      </div>

      {/* Related products — below reviews */}
      {product.relatedProducts.filter((r) => r.inStock).length > 0 && (
        <div className="col-span-full mt-8 mb-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-primary-500 h-px w-6" />
            <span className="text-secondary-400 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
              Recommended
            </span>
          </div>
          <h2 className="font-display text-secondary-900 mb-6 text-2xl font-bold">
            You May Also Like
          </h2>
          <RecommendationGrid
            products={product.relatedProducts
              .filter((r) => r.inStock)
              .slice(0, 5)}
          />
        </div>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-secondary-50 flex border-b pb-2">
      <span className="text-secondary-500 w-36 flex-shrink-0 text-sm font-medium">
        {label}
      </span>
      <span className="text-secondary-800 text-sm">{value}</span>
    </div>
  );
}
