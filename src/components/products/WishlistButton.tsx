"use client";

import { useState } from "react";
import { useWishlist, type WishlistItem } from "~/lib/wishlist";
import { cn } from "~/lib/utils";

interface WishlistButtonProps {
  item: Omit<WishlistItem, "addedAt">;
  className?: string;
  /** Visual size variant. "sm" fits on a product card, "md" on the PDP. */
  size?: "sm" | "md";
  /** Style: "icon-only" for cards, "labeled" for PDP. */
  variant?: "icon-only" | "labeled";
}

export default function WishlistButton({
  item,
  className,
  size = "sm",
  variant = "icon-only",
}: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const [pulse, setPulse] = useState(false);
  const saved = has(item.productId);

  const handleClick = (e: React.MouseEvent) => {
    // Stop event from triggering parent Link navigation when used inside a card.
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
    setPulse(true);
    setTimeout(() => setPulse(false), 250);
  };

  if (variant === "icon-only") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        className={cn(
          "group/wish flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/0 bg-white/95 shadow-sm backdrop-blur transition-all duration-150",
          "hover:scale-105 active:scale-95",
          size === "sm" ? "h-8 w-8" : "h-10 w-10",
          pulse && "scale-110",
          className,
        )}
      >
        <HeartIcon
          filled={saved}
          className={cn(
            size === "sm" ? "h-4 w-4" : "h-5 w-5",
            saved
              ? "text-primary-500"
              : "text-secondary-400 group-hover/wish:text-primary-500",
          )}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={cn(
        "group/wish inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
        saved
          ? "border-primary-200 bg-primary-50 text-primary-700"
          : "border-secondary-200 bg-white text-secondary-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700",
        className,
      )}
    >
      <HeartIcon
        filled={saved}
        className={cn(
          "h-4 w-4",
          saved ? "text-primary-500" : "text-secondary-400 group-hover/wish:text-primary-500",
        )}
      />
      {saved ? "Saved" : "Save for later"}
    </button>
  );
}

function HeartIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
