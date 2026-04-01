import { NextResponse } from 'next/server';
import { getBatchedRecommendations } from '~/lib/data';

const RECOMMENDATIONS_API_ENABLED = true;
const SLOW_RECOMMENDATIONS_REQUEST_MS = 250;

/**
 * GET /api/recommendations?productIds=1,2,3
 * Returns product recommendations based on cart items
 * Uses optimized batched query for all products at once
 */
export async function GET(request: Request) {
  const startedAt = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const productIdsParam = searchParams.get('productIds');

    if (!productIdsParam) {
      return NextResponse.json(
        { message: 'productIds parameter is required' },
        { status: 400 }
      );
    }

    // Parse and validate product IDs
    const productIds = productIdsParam
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id) && id > 0);

    if (productIds.length === 0) {
      return NextResponse.json(
        { message: 'No valid product IDs provided' },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    if (productIds.length > 20) {
      return NextResponse.json(
        { message: 'Too many product IDs (max 20)' },
        { status: 400 }
      );
    }

    if (!RECOMMENDATIONS_API_ENABLED) {
      const response = NextResponse.json({ recommendations: [] });
      response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
      response.headers.set('X-Recommendations-Status', 'disabled');
      return response;
    }

    const recommendations = await getBatchedRecommendations(productIds, 12);

    // Cache response for 60s
    const response = NextResponse.json({ recommendations });
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');

    const durationMs = Date.now() - startedAt;
    if (durationMs >= SLOW_RECOMMENDATIONS_REQUEST_MS) {
      console.warn('[Recommendations API] Slow request', {
        durationMs,
        productCount: productIds.length,
      });
    }

    return response;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.error('[Recommendations API] error', { durationMs, error });
    return NextResponse.json(
      { message: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
