export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-12 bg-secondary-100 rounded" />
        <div className="h-3 w-3 bg-secondary-100 rounded" />
        <div className="h-3 w-10 bg-secondary-100 rounded" />
        <div className="h-3 w-3 bg-secondary-100 rounded" />
        <div className="h-3 w-24 bg-secondary-100 rounded" />
      </div>

      {/* Product detail skeleton */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image */}
        <div className="aspect-square bg-secondary-100 rounded" />

        {/* Info */}
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-secondary-100 rounded" />
          <div className="h-5 w-1/4 bg-secondary-100 rounded" />
          <div className="h-4 w-full bg-secondary-50 rounded mt-6" />
          <div className="h-4 w-5/6 bg-secondary-50 rounded" />
          <div className="h-4 w-2/3 bg-secondary-50 rounded" />
          <div className="h-12 w-full bg-secondary-100 rounded mt-8" />
        </div>
      </div>
    </div>
  );
}
