'use client';

import { useState, useMemo } from 'react';
import type { ProductDetail } from '~/types';
import type { ReviewAggregate } from '~/types/review';
import { formatCentsToDollars, cn } from '~/lib/utils';
import { sanitizeProductDescription } from '~/lib/sanitize';
import ProductGallery from './ProductGallery';
import VariantSelector from './VariantSelector';
import AddToCartButton from './AddToCartButton';
import StockBadge from './StockBadge';
import ReviewsSection, { StarRating } from './ReviewsSection';

interface ProductDetailClientProps {
  product: ProductDetail;
  reviewAggregate?: ReviewAggregate | null;
}

export default function ProductDetailClient({ product, reviewAggregate }: ProductDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  // Find the default variation — first in-stock variation, or just the first
  const defaultVariation = useMemo(() => {
    if (product.variations.length === 0) return null;
    return (
      product.variations.find((v) => v.inStock) ?? product.variations[0] ?? null
    );
  }, [product.variations]);

  const [selectedVariation, setSelectedVariation] = useState(defaultVariation);

  // Get current price to display
  const displayPrice = selectedVariation?.price ?? product.price;
  const displayMsrp = selectedVariation?.msrp ?? product.msrp;
  const isOnSale = displayMsrp != null && displayPrice != null && displayMsrp > displayPrice;

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
    [product.description]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Image Gallery */}
      <ProductGallery images={images} productName={product.name} />

      {/* Right: Product Info */}
      <div className="space-y-6">
        {/* Category */}
        {product.categoryName && (
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
            {product.categoryName}
          </p>
        )}

        {/* Product name */}
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-secondary-800 leading-tight">
          {product.name}
        </h1>

        {/* Star rating summary */}
        {reviewAggregate && reviewAggregate.totalReviews > 0 && (
          <button
            onClick={() => setActiveTab('reviews')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <StarRating rating={reviewAggregate.averageRating} />
            <span className="text-sm text-secondary-500">
              {reviewAggregate.averageRating.toFixed(1)} ({reviewAggregate.totalReviews} review{reviewAggregate.totalReviews !== 1 ? 's' : ''})
            </span>
          </button>
        )}

        {/* Brand */}
        {product.brandName && (
          <p className="text-sm text-secondary-500">
            by <span className="font-medium text-secondary-700">{product.brandName}</span>
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-secondary-900">
            {formatCentsToDollars(displayPrice)}
          </span>
          {isOnSale && (
            <span className="text-lg text-secondary-400 line-through">
              {formatCentsToDollars(displayMsrp)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <StockBadge
          inStock={selectedVariation?.inStock ?? product.inStock}
          quantity={selectedVariation?.quantity}
        />

        {/* Variant selector */}
        {product.variations.length > 1 && (
          <VariantSelector
            variations={product.variations}
            selectedVariationId={selectedVariation?.id ?? null}
            onSelect={setSelectedVariation}
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

        {/* SKU / Category / Tags */}
        <div className="text-sm text-secondary-500 space-y-1">
          {selectedVariation?.manufacturerNo && (
            <p>
              <span className="font-medium text-secondary-700">SKU:</span>{' '}
              {selectedVariation.manufacturerNo}
            </p>
          )}
          {product.categoryName && (
            <p>
              <span className="font-medium text-secondary-700">Category:</span>{' '}
              {product.categoryName}
            </p>
          )}
          {product.keywords && (
            <p>
              <span className="font-medium text-secondary-700">Tags:</span>{' '}
              {product.keywords
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>

        {/* Bullet points */}
        {product.bulletPoints.length > 0 && (
          <ul className="space-y-2">
            {product.bulletPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-secondary-600">
                <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        )}

        {/* Tabs: Description / Specifications */}
        <div className="pt-4 border-t border-secondary-100">
          <div className="flex border-b border-secondary-200">
            <button
              onClick={() => setActiveTab('description')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === 'description'
                  ? 'border-primary-500 text-primary-700'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              )}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === 'specifications'
                  ? 'border-primary-500 text-primary-700'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              )}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === 'reviews'
                  ? 'border-primary-500 text-primary-700'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              )}
            >
              Reviews{reviewAggregate && reviewAggregate.totalReviews > 0 ? ` (${reviewAggregate.totalReviews})` : ''}
            </button>
          </div>

          <div className="pt-4">
            {activeTab === 'description' && (
              sanitizedDescription ? (
                <div
                  className="product-description prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              ) : (
                <p className="text-sm text-secondary-400 italic">
                  No description available.
                </p>
              )
            )}
            {activeTab === 'specifications' && (
              <div className="space-y-3">
                {selectedVariation?.manufacturerNo && (
                  <SpecRow label="Manufacturer #" value={selectedVariation.manufacturerNo} />
                )}
                {selectedVariation?.weight != null && selectedVariation.weight > 0 && (
                  <SpecRow label="Weight" value={`${selectedVariation.weight} lbs`} />
                )}
                {selectedVariation?.variation && (
                  <SpecRow label={selectedVariation.variantType ?? 'Variant'} value={selectedVariation.variation} />
                )}
                {selectedVariation?.variationTwo && (
                  <SpecRow
                    label={selectedVariation.variantTypeTwo ?? 'Variant 2'}
                    value={selectedVariation.variationTwo}
                  />
                )}
                {product.brandName && (
                  <SpecRow label="Brand" value={product.brandName} />
                )}
                {!selectedVariation?.manufacturerNo && !selectedVariation?.weight && !product.brandName && (
                  <p className="text-sm text-secondary-400 italic">
                    No specifications available.
                  </p>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <ReviewsSection productId={product.id} aggregate={reviewAggregate ?? null} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-secondary-50 pb-2">
      <span className="text-sm font-medium text-secondary-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-secondary-800">{value}</span>
    </div>
  );
}
