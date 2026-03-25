import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getApiClient } from '~/lib/api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId: productIdParam } = await params;
    const productId = parseInt(productIdParam, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sort = searchParams.get('sort') || 'newest';

    // Fetch reviews via API (handles pagination, sorting, images, aggregates)
    const data = await getApiClient().getProductReviews(productId, {
      page,
      limit,
      sort,
    });

    // Map API response keys to what the frontend component expects
    return NextResponse.json({
      reviews: (data as Record<string, unknown>).data ?? (data as Record<string, unknown>).reviews ?? [],
      aggregate: (data as Record<string, unknown>).aggregate ?? null,
      pagination: (data as Record<string, unknown>).pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
