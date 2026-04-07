import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getApiClient, ApiClientError } from "~/lib/api-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, action = "add" } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 },
      );
    }

    // Mark review as helpful via API
    const result = await getApiClient().markReviewHelpful<{
      success: boolean;
      helpfulCount: number;
    }>({ reviewId, action });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiClientError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Helpful vote error:", error);
    return NextResponse.json(
      { error: "Failed to record vote" },
      { status: 500 },
    );
  }
}
