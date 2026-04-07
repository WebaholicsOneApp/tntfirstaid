import { NextResponse } from "next/server";
import {
  getSearchSuggestions,
  MIN_SEARCH_LENGTH,
  MAX_SEARCH_LENGTH,
} from "~/lib/data";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";

/**
 * Search suggestions API for autocomplete
 * Returns products and categories suggestions
 *
 * GET /api/search/suggestions?q=<query>
 */
export async function GET(request: Request) {
  // Rate limit search requests
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, "search");

  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // Validate query parameter
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 },
      );
    }

    const trimmed = query.trim();

    // Validate query length
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      return NextResponse.json(
        { error: `Query must be at least ${MIN_SEARCH_LENGTH} characters` },
        { status: 400 },
      );
    }

    if (trimmed.length > MAX_SEARCH_LENGTH) {
      return NextResponse.json(
        { error: `Query must be at most ${MAX_SEARCH_LENGTH} characters` },
        { status: 400 },
      );
    }

    // Get suggestions
    const suggestions = await getSearchSuggestions(trimmed);

    // Return with cache headers for client-side caching
    return NextResponse.json(suggestions, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 },
    );
  }
}
