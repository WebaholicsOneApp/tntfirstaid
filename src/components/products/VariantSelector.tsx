"use client";

import { useState, useMemo, useCallback } from "react";
import type { VariationDetail } from "~/types";
import { sortVariantOptions } from "./variantOrdering";

interface VariantSelectorProps {
  variations: VariationDetail[];
  selectedVariationId: number | null;
  onSelect: (variation: VariationDetail) => void;
  onClear: () => void;
}

export default function VariantSelector({
  variations,
  selectedVariationId,
  onSelect,
  onClear,
}: VariantSelectorProps) {
  const hasSecondDimension = variations.some(
    (v) => v.variationTwo != null && v.variationTwo !== "",
  );

  // Derive selected values from the currently selected variation
  const selectedVariation =
    variations.find((v) => v.id === selectedVariationId) ?? null;
  const [sel1, setSel1] = useState<string>(selectedVariation?.variation ?? "");
  const [sel2, setSel2] = useState<string>(
    selectedVariation?.variationTwo ?? "",
  );

  const label1 = variations[0]?.variantType ?? "Option";
  const label2 = hasSecondDimension
    ? (variations[0]?.variantTypeTwo ?? "Option 2")
    : null;

  // Get unique in-stock values for each dimension, sorted to match WooCommerce
  const options1 = useMemo(() => {
    const seen = new Set<string>();
    const raw = variations
      .filter((v) => v.inStock)
      .map((v) => v.variation)
      .filter((val): val is string => {
        if (val == null || val === "" || seen.has(val)) return false;
        seen.add(val);
        return true;
      });
    return sortVariantOptions(label1, raw);
  }, [variations, label1]);

  const options2 = useMemo(() => {
    if (!hasSecondDimension || !label2) return [];
    const seen = new Set<string>();
    const raw = variations
      .filter((v) => {
        if (!v.inStock) return false;
        if (sel1) return v.variation === sel1;
        return true;
      })
      .map((v) => v.variationTwo)
      .filter((val): val is string => {
        if (val == null || val === "" || seen.has(val)) return false;
        seen.add(val);
        return true;
      });
    return sortVariantOptions(label2, raw);
  }, [variations, hasSecondDimension, sel1, label2]);

  // Find matching variation for current selections
  const findMatch = useCallback(
    (v1: string, v2: string) => {
      return variations.find((v) => {
        const match1 = v.variation === v1;
        if (!hasSecondDimension) return match1;
        return match1 && v.variationTwo === v2;
      });
    },
    [variations, hasSecondDimension],
  );

  if (variations.length <= 1) return null;

  const handleSelect1 = (value: string) => {
    setSel1(value);
    // Auto-clear sel2 if it's no longer valid for the new dim1 selection
    if (hasSecondDimension && sel2) {
      const stillValid = variations.some(
        (v) => v.inStock && v.variation === value && v.variationTwo === sel2,
      );
      if (!stillValid) {
        setSel2("");
        onClear();
        return;
      }
    }
    if (!hasSecondDimension || sel2) {
      const match = findMatch(value, sel2);
      if (match) onSelect(match);
    }
  };

  const handleSelect2 = (value: string) => {
    setSel2(value);
    if (sel1) {
      const match = findMatch(sel1, value);
      if (match) onSelect(match);
    }
  };

  const handleClear = () => {
    setSel1("");
    setSel2("");
    onClear();
  };

  const hasSelection = sel1 !== "" || sel2 !== "";

  return (
    <div className="space-y-4">
      {/* First dimension */}
      <div>
        <label className="text-secondary-700 mb-1.5 block text-sm font-medium">
          {label1}
        </label>
        {options1.length === 0 ? (
          <p className="text-secondary-500 text-sm italic">
            Currently unavailable
          </p>
        ) : (
          <select
            value={sel1}
            onChange={(e) => handleSelect1(e.target.value)}
            className="border-secondary-300 text-secondary-800 focus:border-primary-500 focus:ring-primary-500 w-full max-w-xs rounded-md border bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
          >
            <option value="">Choose an option</option>
            {options1.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Second dimension */}
      {hasSecondDimension && label2 && (
        <div>
          <label className="text-secondary-700 mb-1.5 block text-sm font-medium">
            {label2}
          </label>
          <select
            value={sel2}
            onChange={(e) => handleSelect2(e.target.value)}
            className="border-secondary-300 text-secondary-800 focus:border-primary-500 focus:ring-primary-500 w-full max-w-xs rounded-md border bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
          >
            <option value="">Choose an option</option>
            {options2.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear link */}
      {hasSelection && (
        <button
          type="button"
          onClick={handleClear}
          className="text-primary-600 hover:text-primary-800 text-sm underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
