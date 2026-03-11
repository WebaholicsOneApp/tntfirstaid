import { NextResponse } from 'next/server';

/**
 * Apple Pay Domain Validation
 * Apple Pay requires domain validation before it can be used.
 * This endpoint returns the domain association file.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { validationURL } = body;

    if (!validationURL || typeof validationURL !== 'string') {
      return NextResponse.json(
        { error: 'validationURL is required' },
        { status: 400 }
      );
    }

    // Validate that the URL is from Apple
    const url = new URL(validationURL);
    if (!url.hostname.endsWith('.apple.com')) {
      return NextResponse.json(
        { error: 'Invalid validation URL' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alphamunitions.com';
    const domain = new URL(siteUrl).hostname;

    // Request Apple Pay merchant session
    const response = await fetch(validationURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantIdentifier: process.env.APPLE_PAY_MERCHANT_ID,
        domainName: domain,
        displayName: 'Alpha Munitions',
      }),
    });

    if (!response.ok) {
      console.error('[APPLE_PAY] Validation failed:', response.status);
      return NextResponse.json(
        { error: 'Apple Pay validation failed' },
        { status: 500 }
      );
    }

    const merchantSession = await response.json();
    return NextResponse.json(merchantSession);
  } catch (error) {
    console.error('[APPLE_PAY] Validation error:', error);
    return NextResponse.json(
      { error: 'Apple Pay validation error' },
      { status: 500 }
    );
  }
}
