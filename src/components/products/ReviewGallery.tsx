'use client';

import { useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import StarRating from './StarRating';
import type { Review } from '~/types/review';

export interface ImageWithReview {
  imageId: number;
  imageUrl: string;
  thumbnailUrl: string | null;
  review: Review;
}

interface ReviewGalleryProps {
  images: ImageWithReview[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ReviewGallery({
  images,
  selectedIndex,
  onClose,
  onNavigate,
}: ReviewGalleryProps) {
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  // Navigation
  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null && images.length > 0) {
      onNavigate(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
    }
  }, [selectedIndex, images.length, onNavigate]);

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && images.length > 0) {
      onNavigate(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
    }
  }, [selectedIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, goToPrevious, goToNext, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (selectedIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedIndex]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedIndex]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (selectedIndex === null || !selectedImage) return null;

  // Find all images belonging to the currently selected review
  const currentReviewImages = images.filter(
    (img) => img.review.id === selectedImage.review.id
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10
          hover:bg-white/20 flex items-center justify-center
          transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        aria-label="Close gallery"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden
          w-full max-w-6xl mt-14 mb-4 mx-4 lg:mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image viewer — dark area */}
        <div className="flex-1 relative flex items-center justify-center bg-secondary-950 lg:rounded-l-2xl rounded-t-2xl lg:rounded-tr-none min-h-[40vh] lg:min-h-0">
          {/* Previous arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10
                rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center
                transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              aria-label="Previous image"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Main image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage.imageUrl}
            alt={`Photo from ${selectedImage.review.customerName}'s review`}
            className="max-w-full max-h-[45vh] lg:max-h-[65vh] object-contain px-14"
          />

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10
                rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center
                transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              aria-label="Next image"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Image counter pill */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/15 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Review details sidebar */}
        <div className="lg:w-80 flex-shrink-0 bg-white lg:rounded-r-2xl rounded-b-2xl lg:rounded-bl-none overflow-y-auto max-h-[40vh] lg:max-h-none">
          <div className="p-6 space-y-4">
            {/* Rating */}
            <StarRating rating={selectedImage.review.rating} size="md" />

            {/* Verified badge */}
            {selectedImage.review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified Purchase
              </span>
            )}

            {/* Title */}
            {selectedImage.review.title && (
              <h4 className="font-semibold text-secondary-900 text-base leading-snug">
                {selectedImage.review.title}
              </h4>
            )}

            {/* Content */}
            <p className="text-secondary-500 text-sm leading-relaxed whitespace-pre-wrap">
              {selectedImage.review.content}
            </p>

            {/* This review's photos */}
            {currentReviewImages.length > 1 && (
              <div>
                <p className="text-xs text-secondary-400 mb-2">
                  Photos from this review
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentReviewImages.map((img) => {
                    const globalIdx = images.findIndex(
                      (i) => i.imageId === img.imageId
                    );
                    return (
                      <button
                        key={img.imageId}
                        onClick={() => onNavigate(globalIdx)}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2
                          transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            img.imageId === selectedImage.imageId
                              ? 'border-primary-500 ring-1 ring-primary-500/30'
                              : 'border-secondary-200 hover:border-secondary-300'
                          }`}
                      >
                        <Image
                          src={img.thumbnailUrl || img.imageUrl}
                          alt="Review photo"
                          fill
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviewer info + date */}
            <div className="flex items-center gap-3 pt-4 border-t border-secondary-100">
              <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-secondary-500">
                  {selectedImage.review.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">
                  {selectedImage.review.customerName}
                </p>
                <p className="text-xs text-secondary-400">
                  {formatDate(selectedImage.review.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom thumbnail strip */}
      {images.length > 1 && (
        <div
          ref={thumbnailStripRef}
          className="flex-shrink-0 px-4 pb-4 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2 justify-center mx-auto max-w-4xl">
            {images.map((img, index) => (
              <button
                key={img.imageId}
                ref={index === selectedIndex ? activeThumbnailRef : null}
                onClick={() => onNavigate(index)}
                className={`relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden
                  transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    index === selectedIndex
                      ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-black/85 opacity-100'
                      : 'opacity-50 hover:opacity-80'
                  }`}
              >
                <Image
                  src={img.thumbnailUrl || img.imageUrl}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
