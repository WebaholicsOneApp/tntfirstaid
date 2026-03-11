/**
 * Review System Types
 * Types for customer reviews on product pages
 */

export interface Review {
  id: number;
  customerName: string;
  rating: number;
  title: string | null;
  content: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  images: ReviewImage[];
}

export interface ReviewImage {
  id: number;
  imageUrl: string;
  thumbnailUrl: string | null;
}

export interface ReviewAggregate {
  totalReviews: number;
  averageRating: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  aggregate: ReviewAggregate;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewSubmission {
  productId: number;
  variationId?: number;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string;
  content: string;
}

export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
