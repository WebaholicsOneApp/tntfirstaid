'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '~/lib/utils';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
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
      <div className="aspect-square bg-secondary-50 rounded-lg flex items-center justify-center">
        <svg className="w-24 h-24 text-secondary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary-50 border border-secondary-100">
        {currentImage && !imgErrors.has(selectedIndex) ? (
          <Image
            src={currentImage}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
            onError={() => handleImageError(selectedIndex)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-secondary-200">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  'relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all',
                  selectedIndex === index
                    ? 'border-primary-500 ring-1 ring-primary-300'
                    : 'border-secondary-200 hover:border-primary-300'
                )}
              >
                <Image
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
