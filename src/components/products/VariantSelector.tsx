'use client';

import type { VariationDetail } from '~/types';
import { formatCentsToDollars, cn } from '~/lib/utils';

interface VariantSelectorProps {
  variations: VariationDetail[];
  selectedVariationId: number | null;
  onSelect: (variation: VariationDetail) => void;
}

export default function VariantSelector({
  variations,
  selectedVariationId,
  onSelect,
}: VariantSelectorProps) {
  if (variations.length <= 1) return null;

  // Determine the label for the variant group
  const variantLabel =
    variations[0]?.variantType ?? 'Option';

  return (
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-2">
        {variantLabel}
      </label>
      <div className="flex flex-wrap gap-2">
        {variations.map((variation) => {
          const isSelected = variation.id === selectedVariationId;
          const displayName =
            variation.variation || variation.manufacturerNo || `Option ${variation.id}`;

          return (
            <button
              key={variation.id}
              onClick={() => onSelect(variation)}
              disabled={!variation.inStock}
              className={cn(
                'px-4 py-2 rounded-md border text-sm font-medium transition-all',
                isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-800 ring-1 ring-primary-300'
                  : variation.inStock
                    ? 'border-secondary-200 bg-white text-secondary-700 hover:border-primary-300'
                    : 'border-secondary-100 bg-secondary-50 text-secondary-300 cursor-not-allowed line-through'
              )}
            >
              <span>{displayName}</span>
              {variation.price != null && (
                <span className="ml-2 text-xs text-secondary-500">
                  {formatCentsToDollars(variation.price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
