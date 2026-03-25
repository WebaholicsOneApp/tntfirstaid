'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProductImage } from '~/components/ui/ProductImage';
import StarRating from '~/components/products/StarRating';

interface ProductItem {
  productId: number;
  productName: string;
  variationName: string | null;
  imageUrl: string | null;
  alreadyReviewed: boolean;
}

interface TokenData {
  valid: boolean;
  customerEmail?: string;
  customerName?: string;
  orderId?: number;
  products?: ProductItem[];
  allReviewed?: boolean;
  error?: string;
}

interface ImagePreview {
  file: File;
  preview: string;
}

const MAX_IMAGES = 5;
const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const initialRating = searchParams.get('rating');

  // Token validation state
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Token validation
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setTokenData({ valid: false, error: 'No token provided' });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/reviews/validate-token?token=${token}`);
        const data = await response.json();
        setTokenData(data);
      } catch {
        setTokenData({ valid: false, error: 'Failed to validate token' });
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  // Auto-select product when only one reviewable
  useEffect(() => {
    if (!tokenData?.valid || !tokenData.products) return;

    const reviewable = tokenData.products.filter(p => !p.alreadyReviewed);

    if (reviewable.length === 0) return;

    if (reviewable.length === 1) {
      setSelectedProduct(reviewable[0] ?? null);
      setShowProductPicker(false);
    } else {
      setShowProductPicker(true);
    }
  }, [tokenData]);

  // Pre-fill rating from URL param after product is selected
  useEffect(() => {
    if (selectedProduct && initialRating && rating === 0) {
      const num = parseInt(initialRating, 10);
      if (num >= 1 && num <= 5) {
        setRating(num);
      }
    }
  }, [selectedProduct, initialRating, rating]);

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const newImages: ImagePreview[] = [];
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        setError('Only JPEG, PNG, WebP, and GIF images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be under 5MB');
        return;
      }
      newImages.push({ file, preview: URL.createObjectURL(file) });
    }

    setImages([...images, ...newImages]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const removed = newImages[index];
    if (removed) URL.revokeObjectURL(removed.preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProduct) { setError('Please select a product'); return; }
    if (rating === 0) { setError('Please select a star rating'); return; }
    if (content.trim().length < 10) { setError('Review must be at least 10 characters'); return; }

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploadProgress('Uploading...');
        const formData = new FormData();
        images.forEach((img) => formData.append('images', img.file));

        const uploadResponse = await fetch('/api/reviews/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.error || 'Failed to upload images');
        imageUrls = uploadData.images.map((img: { url: string }) => img.url);
      }

      setUploadProgress('Submitting review...');

      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
          customerName: tokenData!.customerName?.trim() || 'Customer',
          customerEmail: tokenData!.customerEmail?.trim().toLowerCase() || '',
          imageUrls,
          token,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit review');

      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleReviewAnother = () => {
    // Mark just-reviewed product as reviewed in local state
    if (tokenData?.products && selectedProduct) {
      const updated = tokenData.products.map(p =>
        p.productId === selectedProduct.productId
          ? { ...p, alreadyReviewed: true }
          : p
      );
      setTokenData({ ...tokenData, products: updated });
    }
    setSubmitted(false);
    setSelectedProduct(null);
    setRating(0);
    setTitle('');
    setContent('');
    setImages([]);
    setError(null);
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // --- Invalid Token ---
  if (!tokenData?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-secondary-900 mb-2">Invalid Link</h1>
          <p className="text-secondary-600 mb-6">
            {tokenData?.error || 'This review link is invalid or has expired.'}
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // --- All Products Already Reviewed ---
  if (tokenData.allReviewed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-secondary-900 mb-2">All Products Reviewed</h1>
          <p className="text-secondary-600 mb-6">
            You have already submitted reviews for all products in this order. Thank you for your feedback!
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // --- Success ---
  if (submitted) {
    const remaining = tokenData.products?.filter(
      p => !p.alreadyReviewed && p.productId !== selectedProduct?.productId
    ) || [];

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-3">Thank You!</h1>
          <p className="text-secondary-600 mb-2">
            Your review has been submitted and will be visible after moderation.
          </p>
          <p className="text-sm text-secondary-400 mb-8">
            Your feedback helps fellow shooters make better choices.
          </p>
          {remaining.length > 0 ? (
            <button
              onClick={handleReviewAnother}
              className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Review Another Product
            </button>
          ) : (
            <Link href="/" className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Continue Shopping
            </Link>
          )}
        </div>
      </div>
    );
  }

  // --- Product Picker (multi-item orders) ---
  if (showProductPicker && !selectedProduct) {
    const reviewable = tokenData.products!.filter(p => !p.alreadyReviewed);
    const reviewed = tokenData.products!.filter(p => p.alreadyReviewed);

    return (
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 pt-8 pb-4 text-center">
              <h1 className="text-lg font-semibold text-secondary-900">Select a Product to Review</h1>
              <p className="text-sm text-secondary-500 mt-1">
                Choose which product you would like to review
              </p>
            </div>

            <div className="px-8 pb-8 space-y-3">
              {reviewable.map((product) => (
                <button
                  key={product.productId}
                  onClick={() => {
                    setSelectedProduct(product);
                    if (initialRating) {
                      const num = parseInt(initialRating, 10);
                      if (num >= 1 && num <= 5) setRating(num);
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 border border-secondary-200 rounded-xl
                    hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  {product.imageUrl ? (
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.productName}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-lg object-contain bg-secondary-50 border border-secondary-100"
                      unoptimized
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-secondary-900 block">{product.productName}</span>
                    {product.variationName && (
                      <span className="text-sm text-secondary-500">{product.variationName}</span>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              {reviewed.map((product) => (
                <div
                  key={product.productId}
                  className="w-full flex items-center gap-4 p-4 border border-secondary-100 rounded-xl bg-secondary-50 opacity-60"
                >
                  {product.imageUrl ? (
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.productName}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-lg object-contain bg-secondary-50"
                      unoptimized
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-secondary-500 block">{product.productName}</span>
                    {product.variationName && (
                      <span className="text-sm text-secondary-400">{product.variationName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium">Reviewed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-6">
            <span className="text-lg font-bold text-secondary-400">{process.env.NEXT_PUBLIC_SITE_NAME || 'Alpha Munitions'}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Review Form ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Product Image + Name */}
          <div className="px-8 pt-8 pb-4 text-center">
            {showProductPicker && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setRating(0);
                  setTitle('');
                  setContent('');
                  setImages([]);
                  setError(null);
                }}
                className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors mb-4 inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Review a different product
              </button>
            )}

            {selectedProduct?.imageUrl ? (
              <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-secondary-50 border border-secondary-100">
                <ProductImage
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.productName}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto mb-4 rounded-xl bg-secondary-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}

            <h1 className="text-lg font-semibold text-secondary-900">
              {selectedProduct?.productName}
            </h1>
            {selectedProduct?.variationName && (
              <p className="text-sm text-secondary-500">{selectedProduct.variationName}</p>
            )}
            <p className="text-sm text-secondary-500 mt-1">How would you rate this product?</p>
          </div>

          {/* Star Rating */}
          <div className="px-8 py-4 text-center">
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                size="2xl"
                interactive
                onChange={setRating}
              />
            </div>
            <div className="h-6 mt-2">
              {rating > 0 && (
                <span className="text-sm font-medium text-amber-600">
                  {RATING_LABELS[rating]}
                </span>
              )}
            </div>
          </div>

          {/* Progressive Disclosure: Form appears after star selection */}
          {rating > 0 && (
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              <div className="border-t border-secondary-100" />

              {/* Review Title */}
              <div>
                <label htmlFor="review-title" className="block text-sm font-medium text-secondary-700 mb-2">
                  Review Title <span className="text-secondary-400">(optional)</span>
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={255}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-700
                    placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500
                    focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Review Content */}
              <div>
                <label htmlFor="review-content" className="block text-sm font-medium text-secondary-700 mb-2">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="review-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  maxLength={5000}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-700
                    placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500
                    focus:border-primary-500 transition-colors resize-none"
                />
                <span className="text-xs text-secondary-400 mt-1 block">
                  {content.length}/5000 characters (minimum 10)
                </span>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Add Photos <span className="text-secondary-400">(optional)</span>
                </label>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-secondary-200">
                          <ProductImage
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full
                            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-secondary-200 rounded-lg
                        text-sm text-secondary-600 hover:bg-secondary-50 cursor-pointer transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Add Photos
                    </label>
                    <span className="text-xs text-secondary-400 ml-2">
                      {images.length}/{MAX_IMAGES} (max 5MB each)
                    </span>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-xl
                  hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {uploadProgress || 'Submitting...'}
                  </span>
                ) : (
                  'Submit Review'
                )}
              </button>

              {/* Reviewing as */}
              <p className="text-xs text-secondary-400 text-center">
                Reviewing as <span className="font-medium text-secondary-500">{tokenData.customerName}</span>
              </p>
            </form>
          )}

          {/* Bottom padding when no rating selected */}
          {rating === 0 && <div className="pb-8" />}
        </div>

        {/* Branding */}
        <div className="text-center mt-6">
          <span className="text-lg font-bold text-secondary-400">{process.env.NEXT_PUBLIC_SITE_NAME || 'Alpha Munitions'}</span>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
