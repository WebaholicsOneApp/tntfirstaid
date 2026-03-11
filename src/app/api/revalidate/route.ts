import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { clearBrandingCache, clearPolicyCache } from '~/lib/db';
import { clearProductCaches } from '~/lib/data';

const REVALIDATE_SECRET = process.env.ONEAPP_WEBHOOK_SECRET;

/**
 * POST /api/revalidate
 * Called by OneApp after storefront branding is updated.
 * Clears the in-memory branding cache and revalidates all pages.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { secret } = body;

  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Clear in-memory caches
  clearBrandingCache();
  clearPolicyCache();
  clearProductCaches();

  // Revalidate the entire site (layout + all pages)
  revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true });
}
