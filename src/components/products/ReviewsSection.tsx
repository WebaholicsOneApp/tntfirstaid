'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import StarRating from './StarRating';
import RatingBreakdown from './RatingBreakdown';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import type { Review, ReviewAggregate, ReviewSortOption } from '~/types/review';

interface ImageWithReview {
  imageId: number;
  imageUrl: string;
  thumbnailUrl: string | null;
  review: Review;
}

interface ReviewsSectionProps {
  productId: number;
  productName: string;
  aggregate?: ReviewAggregate | null;
}

export default function ReviewsSection({ productId, productName, aggregate: initialAggregate }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [aggregate, setAggregate] = useState<ReviewAggregate | null>(initialAggregate ?? null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<ReviewSortOption>('newest');
  const [showForm, setShowForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Collect all images from all reviews
  const allImages = useMemo(() => {
    const images: ImageWithReview[] = [];
    reviews.forEach((review) => {
      if (review.images && review.images.length > 0) {
        review.images.forEach((img) => {
          images.push({
            imageId: img.id,
            imageUrl: img.imageUrl,
            thumbnailUrl: img.thumbnailUrl,
            review,
          });
        });
      }
    });
    return images;
  }, [reviews]);

  // Get currently selected image
  const selectedImage = selectedImageIndex !== null ? allImages[selectedImageIndex] : null;

  // Navigation functions
  const goToPreviousImage = useCallback(() => {
    if (selectedImageIndex !== null && allImages.length > 0) {
      setSelectedImageIndex(
        selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1
      );
    }
  }, [selectedImageIndex, allImages.length]);

  const goToNextImage = useCallback(() => {
    if (selectedImageIndex !== null && allImages.length > 0) {
      setSelectedImageIndex(
        selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0
      );
    }
  }, [selectedImageIndex, allImages.length]);

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

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews/product/${productId}?page=${page}&limit=10&sort=${sort}`
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setAggregate(data.aggregate);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, page, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSortChange = (newSort: ReviewSortOption) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to reviews section
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="reviews-section" className="mt-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-secondary-900">Customer Reviews</h2>
        {/* Only show header button when there are reviews */}
        {!loading && reviews.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold
              rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2
              focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write a Review
          </button>
        )}
      </div>

      {/* Empty State - Full Width Centered */}
      {!loading && reviews.length === 0 && (
        <div className="py-16 text-center bg-secondary-50 rounded-xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-secondary-800 mb-2">No Reviews Yet</h3>
          <p className="text-secondary-600 mb-6">Be the first to share your experience with this product!</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold
              rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2
              focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write a Review
          </button>
        </div>
      )}

      {/* Two Column Layout - Only show when there are reviews or loading */}
      {(loading || reviews.length > 0) && (
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Rating Summary & Photos */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-4 space-y-6">
            {/* Rating Summary */}
            {aggregate && aggregate.totalReviews > 0 && (
              <div className="bg-secondary-50 rounded-xl p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <span className="text-5xl font-bold text-secondary-900">
                      {Number(aggregate.averageRating).toFixed(1)}
                    </span>
                    <span className="text-2xl text-secondary-400">/5</span>
                  </div>
                  <div>
                    <StarRating rating={Number(aggregate.averageRating)} size="xl" />
                    <p className="text-base text-secondary-500 mt-1">
                      {aggregate.totalReviews} {aggregate.totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
                <RatingBreakdown aggregate={aggregate} />
              </div>
            )}

            {/* Customer Photos Gallery */}
            {allImages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                  Customer Photos ({allImages.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allImages.slice(0, 6).map((img, index) => (
                    <button
                      key={img.imageId}
                      onClick={() => setSelectedImageIndex(index)}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-secondary-200
                        hover:border-primary-400 hover:shadow-md transition-all group"
                    >
                      <Image
                        src={img.thumbnailUrl || img.imageUrl}
                        alt="Customer photo"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                  {allImages.length > 6 && (
                    <button
                      onClick={() => setSelectedImageIndex(6)}
                      className="w-16 h-16 rounded-lg border border-secondary-200 bg-secondary-100
                        flex items-center justify-center text-secondary-600 font-medium text-sm
                        hover:bg-secondary-200 transition-colors"
                    >
                      +{allImages.length - 6}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Reviews List */}
        <div className="flex-1 min-w-0">
          {/* Sort Controls */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-secondary-600">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as ReviewSortOption)}
                className="px-3 py-2 text-sm border border-secondary-200 rounded-lg bg-white
                  text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          )}

          {/* Reviews List */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center gap-2 text-secondary-500">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading reviews...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-secondary-600 bg-white border border-secondary-200
              rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                    page === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-600 bg-white border border-secondary-200 hover:bg-secondary-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-secondary-600 bg-white border border-secondary-200
              rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
          )}
        </div>
        {/* End Right Column */}
      </div>
      )}
      {/* End Two Column Layout */}

      {/* Review Form Modal */}
      {showForm && (
        <ReviewForm
          productId={productId}
          productName={productName}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setPage(1);
            setSort('newest');
            fetchReviews();
          }}
        />
      )}

      {/* Image Preview Modal with Review Details */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
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
              {allImages.length > 1 && (
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
                src={selectedImage.imageUrl}
                alt="Customer photo"
                className="max-w-full max-h-[50vh] lg:max-h-[60vh] object-contain rounded-lg"
              />

              {/* Next Arrow */}
              {allImages.length > 1 && (
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
              {allImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-secondary-800 text-white px-3 py-1 rounded-full text-sm">
                  {(selectedImageIndex ?? 0) + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Review Details */}
            <div className="lg:w-80 lg:max-h-[70vh] lg:overflow-y-auto lg:border-l lg:border-secondary-200 lg:pl-6 border-t border-secondary-200 pt-6 lg:border-t-0 lg:pt-0">
              {/* Reviewer Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-secondary-600">
                    {selectedImage.review.customerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-secondary-900">{selectedImage.review.customerName}</p>
                  <div className="flex items-center gap-1">
                    <StarRating rating={selectedImage.review.rating} size="sm" />
                  </div>
                </div>
              </div>

              {/* Verified Badge */}
              {selectedImage.review.verifiedPurchase && (
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
              {selectedImage.review.title && (
                <h4 className="font-semibold text-secondary-900 mb-2">{selectedImage.review.title}</h4>
              )}

              {/* Review Content */}
              <p className="text-secondary-600 text-sm leading-relaxed mb-4">
                {selectedImage.review.content}
              </p>

              {/* All Images from this Review */}
              {selectedImage.review.images.length > 0 && (
                <div>
                  <p className="text-xs text-secondary-500 mb-2">
                    {selectedImage.review.images.length === 1 ? 'Photo from this review:' : 'All photos from this review:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.review.images.map((img) => {
                      // Find the index of this image in allImages
                      const imgIndex = allImages.findIndex(i => i.imageId === img.id);
                      return (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIndex(imgIndex)}
                          className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                            img.id === selectedImage.imageId
                              ? 'border-primary-500'
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

              {/* Date */}
              <p className="text-xs text-secondary-400 mt-4">
                {new Date(selectedImage.review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
