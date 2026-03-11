import { NextResponse } from 'next/server';
import { getTopLevelCategories, getFeaturedProducts } from '~/lib/data';
import { checkRateLimit, getClientIp, rateLimitResponse } from '~/lib/ratelimit';

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, 'search');
  if (!rateLimit.success) return rateLimitResponse(rateLimit);

  try {
    const [categories, products] = await Promise.all([
      getTopLevelCategories(),
      getFeaturedProducts(10),
    ]);

    return NextResponse.json(
      { categories: categories.slice(0, 6), products: products.slice(0, 10) },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } }
    );
  } catch (err) {
    console.error('[search/defaults]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
