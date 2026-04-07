"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ProductImage } from "~/components/ui/ProductImage";
import { Spinner } from "~/components/ui/Spinner";
import { useCart } from "~/lib/cart/CartContext";
import { formatCentsToDollars, cn } from "~/lib/utils";
import { sanitizeProductDescription } from "~/lib/sanitize";
import VariantSelector from "~/components/products/VariantSelector";
import StockBadge from "~/components/products/StockBadge";
import type { ProductListItem, VariationDetail } from "~/types";
import { getCachedProduct, prefetchProduct } from "~/lib/product-prefetch";

const QUICKADD_KEYFRAMES = [
  "@keyframes quickadd-overlay-in {",
  "  from { opacity: 0; }",
  "  to { opacity: 1; }",
  "}",
  "@keyframes quickadd-panel-in {",
  "  from { opacity: 0; transform: translateY(24px) scale(0.97); }",
  "  to { opacity: 1; transform: translateY(0) scale(1); }",
  "}",
].join("\n");

interface QuickAddModalProps {
  product: ProductListItem;
  onClose: () => void;
}

interface ProductData {
  id: number;
  name: string;
  slug: string;
  brandName: string | null;
  categoryName: string | null;
  primaryImage: string | null;
  description: string | null;
  bulletPoints: string[];
  images: string[];
  price: number | null;
  maxPrice: number | null;
  msrp: number | null;
  inStock: boolean;
  variations: VariationDetail[];
}

function QuickAddModalInner({ product, onClose }: QuickAddModalProps) {
  const { addItem } = useCart();
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedVariation, setSelectedVariation] =
    useState<VariationDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addPhase, setAddPhase] = useState<"idle" | "adding" | "added">("idle");
  const [activeTab, setActiveTab] = useState<"description" | "specifications">(
    "description",
  );

  // Fetch product details — use prefetch cache if available
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const cached = getCachedProduct<ProductData>(product.slug);
    const dataPromise =
      cached ??
      (() => {
        prefetchProduct(product.slug);
        return getCachedProduct<ProductData>(product.slug)!;
      })();

    dataPromise
      .then((json) => {
        if (!cancelled) {
          setData(json as ProductData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [product.slug]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Parse bullet points into specs and features
  const { specs, features } = useMemo(() => {
    if (!data) return { specs: [], features: [] };
    const s: { label: string; value: string }[] = [];
    const f: string[] = [];
    for (const point of data.bulletPoints) {
      const colonIdx = point.indexOf(":");
      if (colonIdx > 0 && colonIdx < 30) {
        s.push({
          label: point.slice(0, colonIdx).trim(),
          value: point.slice(colonIdx + 1).trim(),
        });
      } else {
        f.push(point);
      }
    }
    return { specs: s, features: f };
  }, [data]);

  // Sanitize description
  const sanitizedDescription = useMemo(
    () => sanitizeProductDescription(data?.description),
    [data?.description],
  );

  // Current display image — prefer selected variation, then product images
  const displayImage = useMemo(() => {
    if (selectedVariation && selectedVariation.images.length > 0) {
      return selectedVariation.images[0];
    }
    return data?.primaryImage ?? product.primaryImage;
  }, [selectedVariation, data?.primaryImage, product.primaryImage]);

  const handleAdd = useCallback(() => {
    if (!selectedVariation || addPhase !== "idle") return;
    setAddPhase("adding");

    addItem(
      {
        id: selectedVariation.id,
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        variation: selectedVariation.variation,
        manufacturerNo: selectedVariation.manufacturerNo,
        price: selectedVariation.price ?? 0,
        image: selectedVariation.images[0] ?? product.primaryImage ?? null,
        maxQuantity: selectedVariation.quantity,
      },
      quantity,
      { skipDrawer: true },
    );

    setTimeout(() => setAddPhase("added"), 300);
    setTimeout(() => {
      setAddPhase("idle");
      onClose();
    }, 800);
  }, [selectedVariation, addPhase, addItem, product, quantity, onClose]);

  const maxQty = selectedVariation?.quantity ?? 99;
  const isOutOfStock = selectedVariation ? !selectedVariation.inStock : false;
  const canAdd = selectedVariation && !isOutOfStock && addPhase === "idle";

  // Price display — show selected variation price or range
  const priceDisplay = selectedVariation
    ? formatCentsToDollars(selectedVariation.price)
    : product.maxPrice != null && product.maxPrice > (product.price ?? 0)
      ? `${formatCentsToDollars(product.price)} – ${formatCentsToDollars(product.maxPrice)}`
      : formatCentsToDollars(product.price);

  const displayMsrp = selectedVariation?.msrp ?? data?.msrp ?? product.msrp;
  const displayPrice = selectedVariation?.price ?? product.price;
  const isOnSale =
    displayMsrp != null && displayPrice != null && displayMsrp > displayPrice;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center"
      style={{
        animation:
          "quickadd-overlay-in 250ms ease-[cubic-bezier(0.32,0.72,0,1)] forwards",
      }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:h-[80dvh] md:max-w-4xl md:rounded-2xl"
        style={{
          animation:
            "quickadd-panel-in 350ms ease-[cubic-bezier(0.32,0.72,0,1)] forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="text-secondary-400 hover:text-secondary-700 hover:bg-secondary-50 ring-secondary-100 absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 ring-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95"
          aria-label="Close"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {error && !data ? (
          <div className="p-10 text-center">
            <p className="text-secondary-500 mb-4 text-sm">
              Unable to load product details.
            </p>
            <Link
              href={`/product/${product.slug}`}
              className="text-primary-600 hover:text-primary-800 text-sm underline"
            >
              View on product page
            </Link>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
            {/* ─── Left: Product Image ─── */}
            <div className="flex-shrink-0 bg-white md:w-1/2">
              <div className="relative aspect-square overflow-hidden md:aspect-auto md:h-full">
                {displayImage ? (
                  <ProductImage
                    src={displayImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-6 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] md:p-10"
                  />
                ) : (
                  <div className="text-secondary-200 flex h-full min-h-[280px] w-full items-center justify-center">
                    <svg
                      className="h-16 w-16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1}
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
              </div>
            </div>

            {/* ─── Right: Product Details ─── */}
            <div className="flex flex-col overflow-y-auto p-5 sm:p-6 md:w-1/2 md:p-8">
              {/* Category — show from API data or skeleton */}
              {loading ? (
                <div className="bg-secondary-100 mb-2 h-3 w-16 animate-pulse rounded" />
              ) : data?.categoryName ? (
                <p className="text-primary-600 mb-2 font-mono text-[0.6rem] tracking-[0.2em] uppercase">
                  {data.categoryName}
                </p>
              ) : null}

              {/* Product name — available immediately from ProductListItem */}
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="group mb-3 inline-flex items-baseline gap-2 pr-8"
              >
                <h2 className="font-display text-secondary-900 group-hover:text-primary-700 text-lg leading-snug font-bold transition-colors duration-300 sm:text-xl">
                  {product.name}
                </h2>
                <svg
                  className="text-secondary-300 group-hover:text-primary-500 h-4 w-4 flex-shrink-0 translate-x-0 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>

              {/* Price — available immediately */}
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-secondary-900 text-xl font-bold">
                  {priceDisplay}
                </span>
                {isOnSale && (
                  <span className="text-secondary-400 text-sm line-through">
                    {formatCentsToDollars(displayMsrp)}
                  </span>
                )}
              </div>

              {/* Stock badge — available immediately (fallback from ProductListItem) */}
              <div className="mb-4">
                <StockBadge
                  inStock={
                    selectedVariation?.inStock ??
                    data?.inStock ??
                    product.inStock
                  }
                  quantity={selectedVariation?.quantity}
                />
              </div>

              {/* Divider */}
              <div className="bg-secondary-100 mb-4 h-px" />

              {/* Variant selector — needs API data */}
              {loading ? (
                <div className="mb-4 space-y-2">
                  <div className="bg-secondary-100 h-4 w-24 animate-pulse rounded" />
                  <div className="flex gap-2">
                    <div className="bg-secondary-100 h-9 w-20 animate-pulse rounded" />
                    <div className="bg-secondary-100 h-9 w-20 animate-pulse rounded" />
                    <div className="bg-secondary-100 h-9 w-20 animate-pulse rounded" />
                  </div>
                </div>
              ) : data && data.variations.length > 1 ? (
                <div className="mb-4">
                  <VariantSelector
                    variations={data.variations}
                    selectedVariationId={selectedVariation?.id ?? null}
                    onSelect={setSelectedVariation}
                    onClear={() => setSelectedVariation(null)}
                  />
                </div>
              ) : null}

              {/* Quantity + Add to cart */}
              <div className="mb-5 flex gap-3">
                {/* Quantity */}
                <div className="border-secondary-200 flex items-center rounded-lg border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !canAdd}
                    className="text-secondary-500 hover:text-secondary-800 disabled:text-secondary-200 px-3 py-2.5 transition-colors duration-200 active:scale-95 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxQty}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1 && val <= maxQty)
                        setQuantity(val);
                    }}
                    disabled={!canAdd}
                    className="text-secondary-800 disabled:text-secondary-300 w-10 [appearance:textfield] border-0 bg-transparent text-center text-sm font-medium focus:ring-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty || !canAdd}
                    className="text-secondary-500 hover:text-secondary-800 disabled:text-secondary-200 px-3 py-2.5 transition-colors duration-200 active:scale-95 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={handleAdd}
                  disabled={!canAdd}
                  className={cn(
                    "flex-1 rounded-lg py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase",
                    "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "flex items-center justify-center gap-2 active:scale-[0.98]",
                    isOutOfStock
                      ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                      : addPhase === "added"
                        ? "bg-green-600 text-white"
                        : !selectedVariation
                          ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                          : "bg-primary-500 text-secondary-950 hover:bg-primary-400",
                  )}
                >
                  {addPhase === "adding" && <Spinner />}
                  {isOutOfStock
                    ? "Out of Stock"
                    : addPhase === "adding"
                      ? "Adding..."
                      : addPhase === "added"
                        ? "Added!"
                        : !selectedVariation
                          ? loading
                            ? "Loading…"
                            : "Select an Option"
                          : "Add to Cart"}
                </button>
              </div>

              {/* Divider */}
              <div className="bg-secondary-100 mb-4 h-px" />

              {/* Description / Specifications tabs */}
              {loading ? (
                <div className="space-y-2">
                  <div className="bg-secondary-100 h-4 w-32 animate-pulse rounded" />
                  <div className="bg-secondary-50 h-3 w-full animate-pulse rounded" />
                  <div className="bg-secondary-50 h-3 w-4/5 animate-pulse rounded" />
                  <div className="bg-secondary-50 h-3 w-3/5 animate-pulse rounded" />
                </div>
              ) : data ? (
                <div>
                  <div className="border-secondary-200 mb-3 flex border-b">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={cn(
                        "-mb-px border-b-2 px-4 py-2 text-xs font-medium transition-colors duration-200",
                        activeTab === "description"
                          ? "border-primary-500 text-primary-700"
                          : "text-secondary-400 hover:text-secondary-600 border-transparent",
                      )}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => setActiveTab("specifications")}
                      className={cn(
                        "-mb-px border-b-2 px-4 py-2 text-xs font-medium transition-colors duration-200",
                        activeTab === "specifications"
                          ? "border-primary-500 text-primary-700"
                          : "text-secondary-400 hover:text-secondary-600 border-transparent",
                      )}
                    >
                      Specifications
                    </button>
                  </div>

                  <div className="text-sm">
                    {activeTab === "description" && (
                      <>
                        {sanitizedDescription ? (
                          <div
                            className="product-description prose prose-sm text-secondary-600 max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: sanitizedDescription,
                            }}
                          />
                        ) : features.length > 0 ? (
                          <ul className="space-y-1.5">
                            {features.map((point, i) => (
                              <li
                                key={i}
                                className="text-secondary-600 flex items-start gap-2"
                              >
                                <svg
                                  className="text-primary-500 mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-xs">{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-secondary-400 text-xs italic">
                            No description available.
                          </p>
                        )}
                      </>
                    )}

                    {activeTab === "specifications" && (
                      <div className="space-y-2">
                        {data.categoryName && (
                          <SpecRow label="Category" value={data.categoryName} />
                        )}
                        {selectedVariation?.manufacturerNo && (
                          <SpecRow
                            label="SKU"
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
                        {data.brandName && data.brandName !== "#N/A" && (
                          <SpecRow label="Brand" value={data.brandName} />
                        )}
                        {specs.length === 0 &&
                          !data.categoryName &&
                          !selectedVariation && (
                            <p className="text-secondary-400 text-xs italic">
                              No specifications available.
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Keyframe animations */}
      <style dangerouslySetInnerHTML={{ __html: QUICKADD_KEYFRAMES }} />
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-secondary-50 flex border-b pb-1.5">
      <span className="text-secondary-500 w-28 flex-shrink-0 text-xs font-medium">
        {label}
      </span>
      <span className="text-secondary-800 text-xs">{value}</span>
    </div>
  );
}

export default function QuickAddModal(props: QuickAddModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<QuickAddModalInner {...props} />, document.body);
}
