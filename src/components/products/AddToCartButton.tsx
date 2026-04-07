"use client";

import { useState } from "react";
import type { VariationDetail } from "~/types";
import { useCart } from "~/lib/cart";
import { cn } from "~/lib/utils";
import { Spinner } from "~/components/ui/Spinner";

interface AddToCartButtonProps {
  productId: number;
  productSlug: string;
  productName: string;
  variation: VariationDetail | null;
  productImage?: string | null;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  productSlug,
  productName,
  variation,
  productImage,
  disabled,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addPhase, setAddPhase] = useState<"idle" | "adding" | "added">("idle");

  const isOutOfStock = !variation?.inStock;
  const isDisabled = disabled || isOutOfStock || !variation;
  const maxQty = variation?.quantity ?? 99;
  const isAdding = addPhase !== "idle";

  const handleAdd = () => {
    if (!variation || isDisabled || isAdding) return;
    setAddPhase("adding");

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
      },
      quantity,
    );

    // Phase 1: spinner "Adding…" for 300ms, then phase 2: green "Added!" for 400ms
    setTimeout(() => setAddPhase("added"), 300);
    setTimeout(() => setAddPhase("idle"), 700);
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(maxQty, prev + 1));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Quantity selector */}
      <div className="border-secondary-200 flex items-center rounded-md border">
        <button
          onClick={handleDecrement}
          disabled={quantity <= 1 || isDisabled}
          className="text-secondary-500 hover:text-secondary-800 disabled:text-secondary-200 px-3 py-2.5 transition-colors disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
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
            if (!isNaN(val) && val >= 1 && val <= maxQty) {
              setQuantity(val);
            }
          }}
          disabled={isDisabled}
          className="text-secondary-800 disabled:text-secondary-300 w-12 [appearance:textfield] border-0 bg-transparent text-center text-sm font-medium focus:ring-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Quantity"
        />
        <button
          onClick={handleIncrement}
          disabled={quantity >= maxQty || isDisabled}
          className="text-secondary-500 hover:text-secondary-800 disabled:text-secondary-200 px-3 py-2.5 transition-colors disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        disabled={isDisabled}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-all",
          isOutOfStock
            ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
            : addPhase === "added"
              ? "bg-green-600 text-white"
              : "bg-primary-500 text-secondary-900 hover:bg-primary-400 active:bg-primary-600",
        )}
      >
        {!isOutOfStock && addPhase === "adding" && <Spinner />}
        {isOutOfStock
          ? "Out of Stock"
          : addPhase === "adding"
            ? "Adding…"
            : addPhase === "added"
              ? "Added!"
              : "Add to Cart"}
      </button>
    </div>
  );
}
