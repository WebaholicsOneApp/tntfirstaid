/**
 * Review Submission API
 * Proxies to OneApp storefront API for database writes
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getApiClient, ApiClientError } from "~/lib/api-client";
import { stripHtml } from "~/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      customerName,
      customerEmail,
      rating,
      content,
      title,
      variationId,
      imageUrls,
      token,
    } = body;

    // Validate required fields
    if (!productId || !customerName || !customerEmail || !rating || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate rating
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate content length
    const sanitizedContent = stripHtml(content).trim();
    if (sanitizedContent.length < 10) {
      return NextResponse.json(
        { error: "Review content must be at least 10 characters" },
        { status: 400 },
      );
    }

    if (sanitizedContent.length > 5000) {
      return NextResponse.json(
        { error: "Review content must not exceed 5000 characters" },
        { status: 400 },
      );
    }

    // Validate name length
    const sanitizedName = stripHtml(customerName).trim();
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 },
      );
    }

    // Submit review via API (handles product validation, company/store IDs server-side)
    const result = await getApiClient().submitReview({
      productId,
      variationId: variationId || null,
      reviewerName: sanitizedName,
      reviewerEmail: customerEmail.toLowerCase().trim(),
      rating: ratingNum,
      title: title ? stripHtml(title).trim() : null,
      content: sanitizedContent,
      token: token || null,
      images: imageUrls || [],
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiClientError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit review. Please try again." },
      { status: 500 },
    );
  }
}
