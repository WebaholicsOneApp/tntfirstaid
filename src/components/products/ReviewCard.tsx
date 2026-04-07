"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import StarRating from "./StarRating";
import { useAuth } from "~/lib/auth";
import AuthPromptModal from "~/components/ui/AuthPromptModal";
import type { Review } from "~/types/review";

interface ReviewCardProps {
  review: Review;
  onImageClick?: (imageUrl: string) => void;
}

export default function ReviewCard({ review, onImageClick }: ReviewCardProps) {
  const { isAuthenticated, customerAuthEnabled } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount ?? 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const votedReviews = JSON.parse(
      localStorage.getItem("votedReviews") || "[]",
    );
    setHasVoted(votedReviews.includes(review.id));
  }, [review.id]);

  const submitVote = async () => {
    setIsVoting(true);
    try {
      const res = await fetch("/api/reviews/helpful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
          action: hasVoted ? "remove" : "add",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHelpfulCount(data.helpfulCount);

        const newVoted = !hasVoted;
        setHasVoted(newVoted);

        // Sync localStorage
        const votedReviews = JSON.parse(
          localStorage.getItem("votedReviews") || "[]",
        );
        if (newVoted) {
          if (!votedReviews.includes(review.id)) {
            votedReviews.push(review.id);
          }
        } else {
          const idx = votedReviews.indexOf(review.id);
          if (idx !== -1) votedReviews.splice(idx, 1);
        }
        localStorage.setItem("votedReviews", JSON.stringify(votedReviews));
      }
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleHelpfulClick = async () => {
    if (isVoting) return;

    // Auth gate: require sign-in if auth is enabled and user isn't authenticated
    if (!isAuthenticated && customerAuthEnabled) {
      setShowAuthModal(true);
      return;
    }

    await submitVote();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const visibleImages = review.images
    ? review.images.filter(
        (img) =>
          !failedImages.has(img.id) && (img.thumbnailUrl || img.imageUrl),
      )
    : [];

  return (
    <div className="border-secondary-100 rounded-2xl border bg-white p-5 transition-shadow duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)]">
      {/* Stars */}
      <div className="mb-2">
        <StarRating rating={review.rating} size="md" />
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="text-secondary-900 mb-1.5 text-base leading-snug font-semibold">
          {review.title}
        </h4>
      )}

      {/* Content */}
      <p className="text-secondary-500 mb-3 text-sm leading-relaxed whitespace-pre-wrap">
        {review.content}
      </p>

      {/* Images */}
      {visibleImages.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {visibleImages.map((image) => (
            <button
              key={image.id}
              onClick={() => onImageClick?.(image.imageUrl)}
              className="bg-secondary-100 ring-secondary-200 hover:ring-secondary-300 relative h-14 w-14 overflow-hidden rounded-xl ring-1 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03]"
            >
              <Image
                src={image.thumbnailUrl || image.imageUrl}
                alt="Review photo"
                fill
                className="object-cover"
                onError={() => {
                  setFailedImages((prev) => new Set(prev).add(image.id));
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Footer: avatar + name + verified + date | helpful button */}
      <div className="border-secondary-100 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div className="flex items-center gap-2.5 text-sm">
          {/* Avatar */}
          <div className="bg-secondary-100 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <span className="text-secondary-500 text-xs font-semibold">
              {review.customerName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Name */}
          <span className="text-secondary-900 font-medium">
            {review.customerName}
          </span>

          {/* Verified badge */}
          {review.verifiedPurchase && (
            <>
              <span className="text-secondary-300">&middot;</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
            </>
          )}

          {/* Date */}
          <span className="text-secondary-300">&middot;</span>
          <span className="text-secondary-400">
            {formatDate(review.createdAt)}
          </span>
        </div>

        {/* Helpful button */}
        <button
          onClick={handleHelpfulClick}
          disabled={isVoting}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] disabled:opacity-70 ${
            hasVoted
              ? "bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100"
              : "bg-secondary-50 text-secondary-600 border-secondary-200 hover:bg-secondary-100"
          }`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          {isVoting ? "..." : `Helpful (${helpfulCount})`}
        </button>
      </div>

      {/* Auth prompt modal for helpful voting */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to continue"
        subtitle="Sign in to mark reviews as helpful."
        onAuthenticated={() => {
          // Auto-fire the vote after successful password login (skip auth check)
          submitVote();
        }}
      />
    </div>
  );
}
