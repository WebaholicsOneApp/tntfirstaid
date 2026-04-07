import { cn } from "~/lib/utils";

interface StockBadgeProps {
  inStock: boolean;
  quantity?: number;
  className?: string;
}

export default function StockBadge({
  inStock,
  quantity,
  className,
}: StockBadgeProps) {
  if (!inStock) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Out of Stock
      </span>
    );
  }

  if (quantity !== undefined && quantity > 0 && quantity < 5) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Low Stock
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      In Stock
    </span>
  );
}
