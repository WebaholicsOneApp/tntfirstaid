"use client";

import { useTransition, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useNavigationLoading } from "~/lib/navigation-loading-context";
import { Spinner } from "~/components/ui/Spinner";

const SORT_OPTIONS = [
  { value: "best_sellers", label: "Best Sellers" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "top_rated", label: "Top Rated" },
  { value: "name_asc", label: "Name: A to Z" },
] as const;

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "best_sellers";
  const [isPending, startTransition] = useTransition();
  const { setIsNavigating } = useNavigationLoading();

  useEffect(() => {
    setIsNavigating(isPending);
  }, [isPending, setIsNavigating]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.delete("page"); // Reset to page 1 on sort change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="text-secondary-500 text-sm whitespace-nowrap"
      >
        Sort by:
      </label>
      <div className="relative flex items-center">
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleChange}
          disabled={isPending}
          className="border-secondary-200 text-secondary-700 focus:ring-primary-300 focus:border-primary-300 rounded-md border bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-70"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isPending && (
          <span className="pointer-events-none absolute right-8">
            <Spinner className="text-secondary-400 h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
