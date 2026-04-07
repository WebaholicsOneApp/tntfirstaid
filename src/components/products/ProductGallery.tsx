"use client";

import { useState } from "react";
import { ProductImage } from "~/components/ui/ProductImage";
import { cn } from "~/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const validImages = images.filter((_, i) => !imgErrors.has(i));

  const handleImageError = (index: number) => {
    setImgErrors((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  if (validImages.length === 0) {
    return (
      <div className="bg-secondary-50 flex aspect-square items-center justify-center rounded-lg">
        <svg
          className="text-secondary-200 h-24 w-24"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  const currentImage = images[selectedIndex];
  const showThumbnails = validImages.length > 1;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="border-secondary-100 relative aspect-square overflow-hidden rounded-lg border bg-white">
        {currentImage && !imgErrors.has(selectedIndex) ? (
          <ProductImage
            src={currentImage}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
            onError={() => handleImageError(selectedIndex)}
          />
        ) : (
          <div className="text-secondary-200 flex h-full w-full items-center justify-center">
            <svg
              className="h-24 w-24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            if (imgErrors.has(index)) return null;
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all sm:h-20 sm:w-20",
                  selectedIndex === index
                    ? "border-primary-500 ring-primary-300 ring-1"
                    : "border-secondary-200 hover:border-primary-300",
                )}
              >
                <ProductImage
                  src={image}
                  alt={`${productName} - image ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() => handleImageError(index)}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
