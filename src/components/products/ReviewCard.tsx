'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import StarRating from './StarRating';
import type { Review } from '~/types/review';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Check if user has already voted (stored in localStorage)
  useEffect(() => {
    const votedReviews = JSON.parse(localStorage.getItem('votedReviews') || '[]');
    setHasVoted(votedReviews.includes(review.id));
  }, [review.id]);

  const handleHelpfulClick = async () => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      const res = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id, action: hasVoted ? 'remove' : 'add' }),
      });

      if (res.ok) {
        const data = await res.json();
        setHelpfulCount(data.helpfulCount);

        // Toggle vote state
        const votedReviews = JSON.parse(localStorage.getItem('votedReviews') || '[]');
        if (hasVoted) {
          // Remove vote
          const filtered = votedReviews.filter((id: number) => id !== review.id);
          localStorage.setItem('votedReviews', JSON.stringify(filtered));
          setHasVoted(false);
        } else {
          // Add vote
          votedReviews.push(review.id);
          localStorage.setItem('votedReviews', JSON.stringify(votedReviews));
          setHasVoted(true);
        }
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  // Navigation functions
  const goToPreviousImage = useCallback(() => {
    if (selectedImageIndex !== null && review.images && review.images.length > 0) {
      setSelectedImageIndex(
        selectedImageIndex > 0 ? selectedImageIndex - 1 : review.images.length - 1
      );
    }
  }, [selectedImageIndex, review.images]);

  const goToNextImage = useCallback(() => {
    if (selectedImageIndex !== null && review.images && review.images.length > 0) {
      setSelectedImageIndex(
        selectedImageIndex < review.images.length - 1 ? selectedImageIndex + 1 : 0
      );
    }
  }, [selectedImageIndex, review.images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextImage();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, goToPreviousImage, goToNextImage]);

  // Format date relative to now
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-secondary-200 rounded-xl p-5">
      <div className="flex gap-5">
        {/* Part 1: Stars, Name, Date, Images, Helpful */}
        <div className="w-48 flex-shrink-0">
          {/* Rating and Verified Purchase */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <StarRating rating={review.rating} size="lg" />
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified Purchase
              </span>
            )}
          </div>

          {/* Avatar, Name, and Date */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-secondary-600">
                {review.customerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-semibold text-secondary-900 text-sm">{review.customerName}</span>
              <p className="text-xs text-secondary-500">Reviewed on {formatDate(review.createdAt)}</p>
            </div>
          </div>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {review.images.map((image, index) => {
                // Hide images that failed to load
                if (failedImages.has(image.id)) return null;

                return (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className="relative w-14 h-14 rounded-lg overflow-hidden border border-secondary-200 hover:border-secondary-300 transition-colors bg-secondary-100"
                  >
                    <Image
                      src={image.thumbnailUrl || image.imageUrl}
                      alt="Review image"
                      fill
                      className="object-cover"
                      onError={() => {
                        setFailedImages(prev => new Set(prev).add(image.id));
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Helpful button */}
          <button
            onClick={handleHelpfulClick}
            disabled={isVoting}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              hasVoted
                ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                : 'bg-secondary-50 text-secondary-600 border-secondary-200 hover:bg-secondary-100'
            } disabled:opacity-70`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {isVoting ? '...' : `Helpful (${helpfulCount})`}
          </button>
        </div>

        {/* Part 2: Title and Comment */}
        <div className="flex-1 border-l border-secondary-100 pl-5">
          {/* Title */}
          {review.title && (
            <h4 className="font-semibold text-secondary-900 text-lg mb-2">{review.title}</h4>
          )}

          {/* Content */}
          <p className="text-secondary-600 text-base leading-relaxed whitespace-pre-wrap">
            {review.content}
          </p>
        </div>
      </div>

      {/* Expanded image modal with review details */}
      {selectedImageIndex !== null && review.images?.[selectedImageIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-secondary-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="flex flex-col lg:flex-row gap-6 max-w-5xl w-full max-h-[90vh] bg-white rounded-2xl p-6 border border-secondary-200 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image with Navigation */}
            <div className="flex-shrink-0 lg:flex-1 flex items-center justify-center relative min-h-[300px] lg:min-h-0">
              {/* Previous Arrow */}
              {review.images.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-secondary-100
                    rounded-full flex items-center justify-center shadow-lg transition-colors z-10 border border-secondary-200"
                >
                  <svg className="w-5 h-5 text-secondary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={review.images[selectedImageIndex].imageUrl}
                alt="Review image expanded"
                className="max-w-full max-h-[50vh] lg:max-h-[60vh] object-contain rounded-lg"
              />

              {/* Next Arrow */}
              {review.images.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-secondary-100
                    rounded-full flex items-center justify-center shadow-lg transition-colors z-10 border border-secondary-200"
                >
                  <svg className="w-5 h-5 text-secondary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Image Counter */}
              {review.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-secondary-800 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {review.images.length}
                </div>
              )}
            </div>

            {/* Review Details */}
            <div className="lg:w-80 lg:max-h-[70vh] lg:overflow-y-auto lg:border-l lg:border-secondary-200 lg:pl-6 border-t border-secondary-200 pt-6 lg:border-t-0 lg:pt-0">
              {/* Reviewer Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-secondary-600">
                    {review.customerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-secondary-900">{review.customerName}</p>
                  <StarRating rating={review.rating} size="sm" />
                </div>
              </div>

              {/* Verified Badge */}
              {review.verifiedPurchase && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified Purchase
                  </span>
                </div>
              )}

              {/* Review Title */}
              {review.title && (
                <h4 className="font-semibold text-secondary-900 mb-2">{review.title}</h4>
              )}

              {/* Review Content */}
              <p className="text-secondary-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                {review.content}
              </p>

              {/* All Images from this Review */}
              {review.images.filter(img => !failedImages.has(img.id)).length > 0 && (
                <div>
                  <p className="text-xs text-secondary-500 mb-2">
                    {review.images.filter(img => !failedImages.has(img.id)).length === 1 ? 'Photo from this review:' : 'All photos from this review:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {review.images.map((img, index) => {
                      if (failedImages.has(img.id)) return null;

                      return (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all bg-secondary-100 ${
                            index === selectedImageIndex
                              ? 'border-primary-500'
                              : 'border-secondary-200 hover:border-secondary-300'
                          }`}
                        >
                          <Image
                            src={img.thumbnailUrl || img.imageUrl}
                            alt="Review photo"
                            fill
                            className="object-cover"
                            onError={() => {
                              setFailedImages(prev => new Set(prev).add(img.id));
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date */}
              <p className="text-xs text-secondary-400 mt-4">
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
