import { NextRequest, NextResponse } from 'next/server';
import { getProductReviews } from '~/lib/data';
import type { ReviewSortOption } from '~/types/review';

const VALID_SORTS: ReviewSortOption[] = ['newest', 'oldest', 'highest', 'lowest', 'helpful'];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const productId = Number(searchParams.get('productId'));
  if (!productId || productId <= 0) {
    return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
  }

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 10));
  const sortParam = searchParams.get('sort') as ReviewSortOption | null;
  const sort = sortParam && VALID_SORTS.includes(sortParam) ? sortParam : 'newest';

  const result = await getProductReviews(productId, { page, limit, sort });

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}
