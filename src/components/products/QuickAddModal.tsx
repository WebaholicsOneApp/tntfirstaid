'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ProductImage } from '~/components/ui/ProductImage';
import { Spinner } from '~/components/ui/Spinner';
import { useCart } from '~/lib/cart/CartContext';
import { formatCentsToDollars, cn } from '~/lib/utils';
import { sanitizeProductDescription } from '~/lib/sanitize';
import VariantSelector from '~/components/products/VariantSelector';
import StockBadge from '~/components/products/StockBadge';
import type { ProductListItem, VariationDetail } from '~/types';
import { getCachedProduct, prefetchProduct } from '~/lib/product-prefetch';

const QUICKADD_KEYFRAMES = [
  '@keyframes quickadd-overlay-in {',
  '  from { opacity: 0; }',
  '  to { opacity: 1; }',
  '}',
  '@keyframes quickadd-panel-in {',
  '  from { opacity: 0; transform: translateY(24px) scale(0.97); }',
  '  to { opacity: 1; transform: translateY(0) scale(1); }',
  '}',
].join('\n');

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
  const [selectedVariation, setSelectedVariation] = useState<VariationDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addPhase, setAddPhase] = useState<'idle' | 'adding' | 'added'>('idle');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');

  // Fetch product details — use prefetch cache if available
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const cached = getCachedProduct<ProductData>(product.slug);
    const dataPromise = cached ?? (() => {
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

    return () => { cancelled = true; };
  }, [product.slug]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Parse bullet points into specs and features
  const { specs, features } = useMemo(() => {
    if (!data) return { specs: [], features: [] };
    const s: { label: string; value: string }[] = [];
    const f: string[] = [];
    for (const point of data.bulletPoints) {
      const colonIdx = point.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        s.push({ label: point.slice(0, colonIdx).trim(), value: point.slice(colonIdx + 1).trim() });
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
    if (!selectedVariation || addPhase !== 'idle') return;
    setAddPhase('adding');

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

    setTimeout(() => setAddPhase('added'), 300);
    setTimeout(() => {
      setAddPhase('idle');
      onClose();
    }, 800);
  }, [selectedVariation, addPhase, addItem, product, quantity, onClose]);

  const maxQty = selectedVariation?.quantity ?? 99;
  const isOutOfStock = selectedVariation ? !selectedVariation.inStock : false;
  const canAdd = selectedVariation && !isOutOfStock && addPhase === 'idle';

  // Price display — show selected variation price or range
  const priceDisplay = selectedVariation
    ? formatCentsToDollars(selectedVariation.price)
    : product.maxPrice != null && product.maxPrice > (product.price ?? 0)
      ? `${formatCentsToDollars(product.price)} – ${formatCentsToDollars(product.maxPrice)}`
      : formatCentsToDollars(product.price);

  const displayMsrp = selectedVariation?.msrp ?? data?.msrp ?? product.msrp;
  const displayPrice = selectedVariation?.price ?? product.price;
  const isOnSale = displayMsrp != null && displayPrice != null && displayMsrp > displayPrice;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
      style={{ animation: 'quickadd-overlay-in 250ms ease-[cubic-bezier(0.32,0.72,0,1)] forwards' }}
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-4xl bg-white md:rounded-2xl rounded-t-2xl shadow-2xl
          max-h-[90dvh] md:h-[80dvh] overflow-hidden flex flex-col"
        style={{ animation: 'quickadd-panel-in 350ms ease-[cubic-bezier(0.32,0.72,0,1)] forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center
            text-secondary-400 hover:text-secondary-700 bg-white/90 hover:bg-secondary-50
            rounded-full ring-1 ring-secondary-100
            transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            active:scale-95"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {error && !data ? (
          <div className="p-10 text-center">
            <p className="text-sm text-secondary-500 mb-4">Unable to load product details.</p>
            <Link
              href={`/product/${product.slug}`}
              className="text-sm text-primary-600 hover:text-primary-800 underline"
            >
              View on product page
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* ─── Left: Product Image ─── */}
            <div className="md:w-1/2 flex-shrink-0 bg-white">
              <div className="relative aspect-square md:aspect-auto md:h-full overflow-hidden">
                  {displayImage ? (
                    <ProductImage
                      src={displayImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain p-6 md:p-10
                        transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full min-h-[280px] text-secondary-200">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
              </div>
            </div>

            {/* ─── Right: Product Details ─── */}
            <div className="md:w-1/2 p-5 sm:p-6 md:p-8 flex flex-col overflow-y-auto">
                {/* Category — show from API data or skeleton */}
                {loading ? (
                  <div className="h-3 w-16 bg-secondary-100 rounded animate-pulse mb-2" />
                ) : data?.categoryName ? (
                  <p className="text-[0.6rem] font-mono tracking-[0.2em] text-primary-600 uppercase mb-2">
                    {data.categoryName}
                  </p>
                ) : null}

                {/* Product name — available immediately from ProductListItem */}
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="group inline-flex items-baseline gap-2 mb-3 pr-8"
                >
                  <h2 className="text-lg sm:text-xl font-display font-bold text-secondary-900
                    group-hover:text-primary-700 transition-colors duration-300 leading-snug">
                    {product.name}
                  </h2>
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-secondary-300 group-hover:text-primary-500
                      translate-x-0 group-hover:translate-x-1 transition-all duration-300
                      ease-[cubic-bezier(0.32,0.72,0,1)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>

                {/* Price — available immediately */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-bold text-secondary-900">
                    {priceDisplay}
                  </span>
                  {isOnSale && (
                    <span className="text-sm text-secondary-400 line-through">
                      {formatCentsToDollars(displayMsrp)}
                    </span>
                  )}
                </div>

                {/* Stock badge — available immediately (fallback from ProductListItem) */}
                <div className="mb-4">
                  <StockBadge
                    inStock={selectedVariation?.inStock ?? data?.inStock ?? product.inStock}
                    quantity={selectedVariation?.quantity}
                  />
                </div>

                {/* Divider */}
                <div className="h-px bg-secondary-100 mb-4" />

                {/* Variant selector — needs API data */}
                {loading ? (
                  <div className="mb-4 space-y-2">
                    <div className="h-4 w-24 bg-secondary-100 rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-9 w-20 bg-secondary-100 rounded animate-pulse" />
                      <div className="h-9 w-20 bg-secondary-100 rounded animate-pulse" />
                      <div className="h-9 w-20 bg-secondary-100 rounded animate-pulse" />
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
                <div className="flex gap-3 mb-5">
                  {/* Quantity */}
                  <div className="flex items-center border border-secondary-200 rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || !canAdd}
                      className="px-3 py-2.5 text-secondary-500 hover:text-secondary-800
                        disabled:text-secondary-200 disabled:cursor-not-allowed
                        transition-colors duration-200 active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={maxQty}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= maxQty) setQuantity(val);
                      }}
                      disabled={!canAdd}
                      className="w-10 text-center text-sm font-medium text-secondary-800
                        border-0 focus:outline-none focus:ring-0 bg-transparent
                        disabled:text-secondary-300
                        [appearance:textfield]
                        [&::-webkit-outer-spin-button]:appearance-none
                        [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="Quantity"
                    />
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      disabled={quantity >= maxQty || !canAdd}
                      className="px-3 py-2.5 text-secondary-500 hover:text-secondary-800
                        disabled:text-secondary-200 disabled:cursor-not-allowed
                        transition-colors duration-200 active:scale-95"
                      aria-label="Increase quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Add to cart button */}
                  <button
                    onClick={handleAdd}
                    disabled={!canAdd}
                    className={cn(
                      'flex-1 py-3 rounded-lg text-[0.65rem] font-mono tracking-[0.15em] uppercase',
                      'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                      'flex items-center justify-center gap-2 active:scale-[0.98]',
                      isOutOfStock
                        ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                        : addPhase === 'added'
                          ? 'bg-green-600 text-white'
                          : !selectedVariation
                            ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                            : 'bg-primary-500 text-secondary-950 hover:bg-primary-400',
                    )}
                  >
                    {addPhase === 'adding' && <Spinner />}
                    {isOutOfStock
                      ? 'Out of Stock'
                      : addPhase === 'adding'
                        ? 'Adding...'
                        : addPhase === 'added'
                          ? 'Added!'
                          : !selectedVariation
                            ? loading ? 'Loading…' : 'Select an Option'
                            : 'Add to Cart'}
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-secondary-100 mb-4" />

                {/* Description / Specifications tabs */}
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-secondary-100 rounded animate-pulse" />
                    <div className="h-3 w-full bg-secondary-50 rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-secondary-50 rounded animate-pulse" />
                    <div className="h-3 w-3/5 bg-secondary-50 rounded animate-pulse" />
                  </div>
                ) : data ? (
                <div>
                  <div className="flex border-b border-secondary-200 mb-3">
                    <button
                      onClick={() => setActiveTab('description')}
                      className={cn(
                        'px-4 py-2 text-xs font-medium border-b-2 transition-colors duration-200 -mb-px',
                        activeTab === 'description'
                          ? 'border-primary-500 text-primary-700'
                          : 'border-transparent text-secondary-400 hover:text-secondary-600',
                      )}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => setActiveTab('specifications')}
                      className={cn(
                        'px-4 py-2 text-xs font-medium border-b-2 transition-colors duration-200 -mb-px',
                        activeTab === 'specifications'
                          ? 'border-primary-500 text-primary-700'
                          : 'border-transparent text-secondary-400 hover:text-secondary-600',
                      )}
                    >
                      Specifications
                    </button>
                  </div>

                  <div className="text-sm">
                    {activeTab === 'description' && (
                      <>
                        {sanitizedDescription ? (
                          <div
                            className="product-description prose prose-sm max-w-none text-secondary-600"
                            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                          />
                        ) : features.length > 0 ? (
                          <ul className="space-y-1.5">
                            {features.map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-secondary-600">
                                <svg className="w-3.5 h-3.5 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs">{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-secondary-400 italic text-xs">No description available.</p>
                        )}
                      </>
                    )}

                    {activeTab === 'specifications' && (
                      <div className="space-y-2">
                        {data.categoryName && (
                          <SpecRow label="Category" value={data.categoryName} />
                        )}
                        {selectedVariation?.manufacturerNo && (
                          <SpecRow label="SKU" value={selectedVariation.manufacturerNo} />
                        )}
                        {selectedVariation?.weight != null && selectedVariation.weight > 0 && (
                          <SpecRow label="Weight" value={`${selectedVariation.weight} lbs`} />
                        )}
                        {specs.map((spec) => (
                          <SpecRow key={spec.label} label={spec.label} value={spec.value} />
                        ))}
                        {selectedVariation?.variation && (
                          <SpecRow
                            label={selectedVariation.variantType ?? 'Variant'}
                            value={selectedVariation.variation}
                          />
                        )}
                        {data.brandName && data.brandName !== '#N/A' && (
                          <SpecRow label="Brand" value={data.brandName} />
                        )}
                        {specs.length === 0 && !data.categoryName && !selectedVariation && (
                          <p className="text-secondary-400 italic text-xs">No specifications available.</p>
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
    <div className="flex border-b border-secondary-50 pb-1.5">
      <span className="text-xs font-medium text-secondary-500 w-28 flex-shrink-0">{label}</span>
      <span className="text-xs text-secondary-800">{value}</span>
    </div>
  );
}

export default function QuickAddModal(props: QuickAddModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <QuickAddModalInner {...props} />,
    document.body,
  );
}
