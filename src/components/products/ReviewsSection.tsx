"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import StarRating from "./StarRating";
import RatingBreakdown from "./RatingBreakdown";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import ReviewGallery from "./ReviewGallery";
import { useAuth } from "~/lib/auth";
import AuthPromptModal from "~/components/ui/AuthPromptModal";
import type { ImageWithReview } from "./ReviewGallery";
import type { Review, ReviewAggregate, ReviewSortOption } from "~/types/review";

interface ReviewsSectionProps {
  productId: number;
  productName: string;
  aggregate?: ReviewAggregate | null;
}

export default function ReviewsSection({
  productId,
  productName,
  aggregate: initialAggregate,
}: ReviewsSectionProps) {
  const { customer, isAuthenticated, customerAuthEnabled } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [aggregate, setAggregate] = useState<ReviewAggregate | null>(
    initialAggregate ?? null,
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<ReviewSortOption>("newest");
  const [showForm, setShowForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Collect all images from all reviews
  const allImages = useMemo(() => {
    const images: ImageWithReview[] = [];
    reviews.forEach((review) => {
      if (review.images && review.images.length > 0) {
        review.images.forEach((img) => {
          if (!img.thumbnailUrl && !img.imageUrl) return;
          images.push({
            imageId: images.length,
            imageUrl: img.imageUrl,
            thumbnailUrl: img.thumbnailUrl,
            review,
          });
        });
      }
    });
    return images;
  }, [reviews]);

  // Client-side rating filter
  const filteredReviews = useMemo(() => {
    if (!ratingFilter) return reviews;
    return reviews.filter((r) => r.rating === ratingFilter);
  }, [reviews, ratingFilter]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews/product/${productId}?page=${page}&limit=10&sort=${sort}`,
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setAggregate(data.aggregate);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
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
    document
      .getElementById("reviews-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRatingFilter = (rating: number | null) => {
    setRatingFilter(rating);
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated && customerAuthEnabled) {
      setShowAuthModal(true);
      return;
    }
    setShowForm(true);
  };

  // When a review card image is clicked, find its global index in allImages
  const handleImageClick = (imageUrl: string) => {
    const index = allImages.findIndex((img) => img.imageUrl === imageUrl);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };

  return (
    <section
      id="reviews-section"
      className="border-secondary-100 mt-12 border-t pt-8"
    >
      {/* Section Header */}
      <div className="mb-6">
        <span className="bg-secondary-100 text-secondary-400 mb-4 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
          Customer Reviews
        </span>
        <h2 className="font-display text-secondary-900 text-2xl font-bold tracking-tight md:text-3xl">
          What Our Customers Say
        </h2>
      </div>

      {/* Empty State */}
      {!loading && reviews.length === 0 && (
        <div className="py-20 text-center">
          <div className="bg-secondary-50 ring-secondary-100 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ring-1">
            <svg
              className="text-secondary-300 h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-secondary-800 mb-2 text-xl font-semibold">
            No Reviews Yet
          </h3>
          <p className="text-secondary-500 mx-auto mb-8 max-w-sm">
            Be the first to share your experience with this product.
          </p>
          <button
            onClick={handleWriteReviewClick}
            className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
          >
            Write a Review
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Main content — only when there are reviews or loading */}
      {(loading || reviews.length > 0) && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left Column — Rating Summary + Customer Photos (sticky sidebar on desktop) */}
          {aggregate && aggregate.totalReviews > 0 && (
            <div className="space-y-5 lg:sticky lg:top-8">
              {/* Rating Summary Card */}
              <div className="border-secondary-100 rounded-2xl border bg-white p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">
                    <span className="text-secondary-900 text-5xl font-bold tracking-tighter">
                      {Number(aggregate.averageRating).toFixed(1)}
                    </span>
                    <span className="text-secondary-300 ml-0.5 text-xl">
                      /5
                    </span>
                  </div>
                  <StarRating
                    rating={Number(aggregate.averageRating)}
                    size="lg"
                  />
                  <p className="text-secondary-400 mt-2 text-sm">
                    Based on{" "}
                    <span className="text-secondary-600 font-medium">
                      {aggregate.totalReviews}
                    </span>{" "}
                    {aggregate.totalReviews === 1 ? "review" : "reviews"}
                  </p>

                  {/* Write a Review CTA */}
                  <button
                    onClick={handleWriteReviewClick}
                    className="bg-primary-600 hover:bg-primary-700 mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                  >
                    Write a Review
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>
                </div>

                {/* Rating Breakdown */}
                <div className="border-secondary-100 mt-5 border-t pt-5">
                  <RatingBreakdown
                    aggregate={aggregate}
                    onFilterClick={handleRatingFilter}
                    activeFilter={ratingFilter}
                  />
                </div>
              </div>

              {/* Customer Photos Strip */}
              {allImages.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-secondary-900 text-base font-semibold">
                      Customer Photos{" "}
                      <span className="text-secondary-400 font-normal">
                        ({allImages.length})
                      </span>
                    </h3>
                    {allImages.length > 8 && (
                      <button
                        onClick={() => setSelectedImageIndex(0)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                      >
                        See all photos
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {allImages.slice(0, 8).map((img, index) => (
                      <button
                        key={img.imageId}
                        onClick={() => setSelectedImageIndex(index)}
                        className="bg-secondary-100 ring-secondary-200 hover:ring-secondary-300 relative h-16 w-16 overflow-hidden rounded-xl ring-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] hover:shadow-md"
                      >
                        <Image
                          src={img.thumbnailUrl || img.imageUrl}
                          alt="Customer photo"
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                    {allImages.length > 8 && (
                      <button
                        onClick={() => setSelectedImageIndex(8)}
                        className="bg-secondary-100 ring-secondary-200 text-secondary-500 hover:bg-secondary-200 flex h-16 w-16 items-center justify-center rounded-xl text-sm font-semibold ring-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      >
                        +{allImages.length - 8}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Column — Filters + Reviews + Pagination */}
          <div className="space-y-4">
            {/* Filter Bar + Sort */}
            {reviews.length > 0 && (
              <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
                {/* Filter chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-secondary-600 mr-1 text-sm font-medium">
                    {filteredReviews.length}{" "}
                    {filteredReviews.length === 1 ? "review" : "reviews"}
                  </span>
                  <button
                    onClick={() => setRatingFilter(null)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      ratingFilter === null
                        ? "bg-primary-600 text-white"
                        : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                    }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <button
                      key={stars}
                      onClick={() =>
                        setRatingFilter(ratingFilter === stars ? null : stars)
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        ratingFilter === stars
                          ? "bg-primary-600 text-white"
                          : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                      }`}
                    >
                      {stars}&#9733;
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-secondary-400 text-xs font-medium">
                    Sort by
                  </span>
                  <select
                    value={sort}
                    onChange={(e) =>
                      handleSortChange(e.target.value as ReviewSortOption)
                    }
                    className="border-secondary-200 text-secondary-700 focus:ring-primary-500/30 focus:border-primary-500 rounded-xl border bg-white px-3 py-2 text-sm transition-colors duration-200 focus:ring-2 focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {loading ? (
              /* Skeleton Loading */
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border-secondary-100 animate-pulse rounded-2xl border bg-white p-5"
                  >
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className="bg-secondary-200 h-5 w-5 rounded"
                        />
                      ))}
                    </div>
                    <div className="bg-secondary-200 mb-3 h-5 w-48 rounded" />
                    <div className="mb-4 space-y-2">
                      <div className="bg-secondary-100 h-4 w-full rounded" />
                      <div className="bg-secondary-100 h-4 w-3/4 rounded" />
                    </div>
                    <div className="border-secondary-50 flex items-center gap-3 border-t pt-4">
                      <div className="bg-secondary-200 h-8 w-8 rounded-full" />
                      <div className="bg-secondary-200 h-3 w-24 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onImageClick={handleImageClick}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-secondary-400">
                      No {ratingFilter}-star reviews yet.
                    </p>
                    <button
                      onClick={() => setRatingFilter(null)}
                      className="text-primary-600 hover:text-primary-700 mt-2 text-sm font-medium"
                    >
                      Show all reviews
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !ratingFilter && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="text-secondary-600 border-secondary-200 hover:bg-secondary-50 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:cursor-not-allowed disabled:opacity-40"
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
                        className={`h-10 w-10 rounded-xl text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                          page === pageNum
                            ? "bg-primary-600 text-white"
                            : "text-secondary-600 border-secondary-200 hover:bg-secondary-50 border bg-white"
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
                  className="text-secondary-600 border-secondary-200 hover:bg-secondary-50 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showForm && (
        <ReviewForm
          productId={productId}
          productName={productName}
          prefillName={
            customer
              ? `${customer.firstName} ${customer.lastName}`.trim()
              : undefined
          }
          prefillEmail={customer?.email}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setPage(1);
            setSort("newest");
            setRatingFilter(null);
            fetchReviews();
          }}
        />
      )}

      {/* Auth prompt for write-a-review */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to write a review"
        subtitle="Sign in to share your experience with this product."
        onAuthenticated={() => setShowForm(true)}
      />

      {/* Image Gallery */}
      <ReviewGallery
        images={allImages}
        selectedIndex={selectedImageIndex}
        onClose={() => setSelectedImageIndex(null)}
        onNavigate={setSelectedImageIndex}
      />
    </section>
  );
}
