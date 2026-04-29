"use client";

import { useEffect, useRef, useState } from "react";
import type { VariationDetail } from "~/types";
import { useCart } from "~/lib/cart";
import { formatCentsToDollars, cn } from "~/lib/utils";
import { Spinner } from "~/components/ui/Spinner";

interface StickyMobileBuyBarProps {
  productId: number;
  productSlug: string;
  productName: string;
  variation: VariationDetail | null;
  productImage?: string | null;
  displayPrice: number | null;
  inlineButtonId: string;
  hasMultipleVariations: boolean;
}

export default function StickyMobileBuyBar({
  productId,
  productSlug,
  productName,
  variation,
  productImage,
  displayPrice,
  inlineButtonId,
  hasMultipleVariations,
}: StickyMobileBuyBarProps) {
  const { addItem } = useCart();
  const [addPhase, setAddPhase] = useState<"idle" | "adding" | "added">("idle");
  const [inlineVisible, setInlineVisible] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Hide the sticky bar while the inline Add-to-Cart is on screen.
  useEffect(() => {
    const target = document.getElementById(inlineButtonId);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInlineVisible(entry?.isIntersecting ?? true),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [inlineButtonId]);

  const isDownloadable = variation?.isDownloadable ?? false;
  const isOutOfStock = isDownloadable ? false : !variation?.inStock;
  const needsVariationChoice = hasMultipleVariations && !variation;
  const isDisabled = isOutOfStock || (!variation && !needsVariationChoice);
  const isAdding = addPhase !== "idle";

  const handleAdd = () => {
    if (needsVariationChoice) {
      // Scroll user up to the variant selector / inline button
      document
        .getElementById(inlineButtonId)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!variation || isDisabled || isAdding) return;
    setAddPhase("adding");
    const maxQty = isDownloadable ? 1 : (variation.quantity ?? 99);
    addItem(
      {
        id: variation.id,
        productId,
        productSlug,
        name: productName,
        variation: variation.variation,
        variantType: variation.variantType,
        variationTwo: variation.variationTwo,
        variantTypeTwo: variation.variantTypeTwo,
        packCount: variation.packCount,
        manufacturerNo: variation.manufacturerNo,
        price: variation.price ?? 0,
        image: variation.images[0] ?? productImage ?? null,
        maxQuantity: maxQty,
        isDownloadable: isDownloadable || undefined,
        downloadUrl: variation.downloadUrl ?? undefined,
      },
      1,
    );
    setTimeout(() => setAddPhase("added"), 300);
    setTimeout(() => setAddPhase("idle"), 1200);
  };

  const hidden = inlineVisible;

  return (
    <>
      <div ref={sentinelRef} aria-hidden />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-secondary-100 bg-white/95 backdrop-blur md:hidden",
          "px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]",
          "transition-transform duration-200 ease-out",
          hidden ? "translate-y-full" : "translate-y-0",
        )}
        role="region"
        aria-label="Add to cart"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-secondary-500 truncate text-[0.7rem] font-medium tracking-wide uppercase">
              {productName}
            </p>
            <p className="text-secondary-900 text-lg font-bold leading-tight">
              {displayPrice != null ? formatCentsToDollars(displayPrice) : "—"}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={isDisabled && !needsVariationChoice}
            className={cn(
              "flex min-h-[48px] min-w-[44%] items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold tracking-wider uppercase transition-colors active:scale-[0.98]",
              isOutOfStock
                ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                : addPhase === "added"
                  ? "bg-green-600 text-white"
                  : "bg-primary-500 text-secondary-900 hover:bg-primary-400",
            )}
          >
            {!isOutOfStock && addPhase === "adding" && <Spinner />}
            {isOutOfStock
              ? "Out of Stock"
              : addPhase === "adding"
                ? "Adding…"
                : addPhase === "added"
                  ? "Added!"
                  : needsVariationChoice
                    ? "Select Options"
                    : "Add to Cart"}
          </button>
        </div>
      </div>
    </>
  );
}
