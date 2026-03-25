import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Max 5MB per image
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
// Max 5 images per review
const MAX_IMAGES = 5;

// OneApp API URL - required for image uploads
const ONEAPP_API_URL = process.env.ONEAPP_API_URL;

export async function POST(request: NextRequest) {
  try {
    // Validate OneApp API URL is configured
    if (!ONEAPP_API_URL) {
      console.error('ONEAPP_API_URL environment variable is not configured');
      return NextResponse.json(
        { error: 'Image upload service is not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    // Validate all files first
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large. Maximum size is 5MB` },
          { status: 400 }
        );
      }
    }

    // Create a new FormData to forward to OneApp API
    const oneappFormData = new FormData();
    for (const file of files) {
      oneappFormData.append('images', file);
    }

    // Forward to OneApp API for upload to Azure Blob Storage
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const oneappResponse = await fetch(`${ONEAPP_API_URL}/api/v1/reviews/upload-images`, {
        method: 'POST',
        body: oneappFormData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!oneappResponse.ok) {
        const errorData = await oneappResponse.json().catch(() => ({}));
        console.error('[Image Upload] OneApp error:', errorData);
        return NextResponse.json(
          { error: (errorData as Record<string, string>).error || 'Failed to upload images' },
          { status: oneappResponse.status }
        );
      }

      const result = await oneappResponse.json();

      return NextResponse.json({
        success: true,
        images: result.images,
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeout);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[Image Upload] OneApp request timed out');
        return NextResponse.json(
          { error: 'Image upload timed out. Please try again.' },
          { status: 504 }
        );
      }
      console.error('[Image Upload] OneApp fetch error:', fetchError instanceof Error ? fetchError.message : fetchError);
      return NextResponse.json(
        { error: 'Failed to upload images' },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('[Image Upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
