import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getApiClient } from '~/lib/api-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const id = Number(productId);
    if (!id || isNaN(id)) {
      return NextResponse.json({ imageUrl: null });
    }

    // Fetch product review images via API (handles image selection logic server-side)
    const data = await getApiClient().getProductReviewImages<{ imageUrl: string | null }>(id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Product Image] Error:', error);
    return NextResponse.json({ imageUrl: null });
  }
}
