import { cn } from '~/lib/utils';

interface StockBadgeProps {
  inStock: boolean;
  quantity?: number;
  className?: string;
}

export default function StockBadge({ inStock, quantity, className }: StockBadgeProps) {
  if (!inStock) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700',
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Out of Stock
      </span>
    );
  }

  if (quantity !== undefined && quantity > 0 && quantity < 5) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700',
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Low Stock
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      In Stock
    </span>
  );
}
