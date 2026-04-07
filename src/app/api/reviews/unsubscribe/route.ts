import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getApiClient, ApiClientError } from "~/lib/api-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
        },
        { status: 400 },
      );
    }

    // Unsubscribe via API (handles token lookup and update server-side)
    const result = await getApiClient().unsubscribeReviews<{
      success: boolean;
      message: string;
    }>({ token });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiClientError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.status },
      );
    }
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process unsubscribe request. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({
      valid: false,
      error: "No token provided",
    });
  }

  try {
    // Validate token via API
    const result = await getApiClient().validateReviewToken<{
      valid: boolean;
      email?: string;
      alreadyUnsubscribed?: boolean;
      error?: string;
    }>({ token });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      valid: false,
      error: "Invalid or expired unsubscribe link.",
    });
  }
}
