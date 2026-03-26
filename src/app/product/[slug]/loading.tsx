export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton h-3 w-12" />
        <span className="text-secondary-200">/</span>
        <div className="skeleton h-3 w-10" />
        <span className="text-secondary-200">/</span>
        <div className="skeleton h-3 w-24" style={{ animationDelay: '100ms' }} />
      </div>

      {/* Product detail skeleton */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image */}
        <div className="skeleton aspect-[2/3] rounded-lg" />

        {/* Info */}
        <div className="space-y-5">
          {/* Title */}
          <div className="skeleton h-8 w-3/4" />

          {/* Star rating row */}
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-24" style={{ animationDelay: '100ms' }} />
            <div className="skeleton h-4 w-16 opacity-60" style={{ animationDelay: '200ms' }} />
          </div>

          {/* Price */}
          <div className="skeleton h-7 w-1/4" style={{ animationDelay: '150ms' }} />

          {/* Divider */}
          <div className="h-px bg-secondary-100" />

          {/* Description lines */}
          <div className="space-y-2.5">
            <div className="skeleton h-4 w-full" style={{ animationDelay: '200ms' }} />
            <div className="skeleton h-4 w-5/6" style={{ animationDelay: '260ms' }} />
            <div className="skeleton h-4 w-2/3 opacity-70" style={{ animationDelay: '320ms' }} />
          </div>

          {/* Variant selector */}
          <div className="skeleton h-11 w-full rounded-lg" style={{ animationDelay: '300ms' }} />

          {/* Add to cart button */}
          <div className="skeleton h-12 w-full rounded-lg" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}
