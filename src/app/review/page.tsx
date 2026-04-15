"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductImage } from "~/components/ui/ProductImage";
import StarRating from "~/components/products/StarRating";

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
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const initialRating = searchParams.get("rating");

  // Token validation state
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Token validation
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setTokenData({ valid: false, error: "No token provided" });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/reviews/validate-token?token=${token}`,
        );
        const data = await response.json();
        setTokenData(data);
      } catch {
        setTokenData({ valid: false, error: "Failed to validate token" });
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  // Auto-select product when only one reviewable
  useEffect(() => {
    if (!tokenData?.valid || !tokenData.products) return;

    const reviewable = tokenData.products.filter((p) => !p.alreadyReviewed);

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
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        )
      ) {
        setError("Only JPEG, PNG, WebP, and GIF images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be under 5MB");
        return;
      }
      newImages.push({ file, preview: URL.createObjectURL(file) });
    }

    setImages([...images, ...newImages]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    const errors = new Set<string>();
    if (!selectedProduct) errors.add("product");
    if (rating === 0) errors.add("rating");
    if (content.trim().length < 10) errors.add("content");
    if (errors.size > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields.");
      return;
    }
    setFieldErrors(new Set());
    if (!selectedProduct) return;

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploadProgress("Uploading...");
        const formData = new FormData();
        images.forEach((img) => formData.append("images", img.file));

        const uploadResponse = await fetch("/api/reviews/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok)
          throw new Error(uploadData.error || "Failed to upload images");
        imageUrls = uploadData.images.map((img: { url: string }) => img.url);
      }

      setUploadProgress("Submitting review...");

      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
          customerName: tokenData!.customerName?.trim() || "Customer",
          customerEmail: tokenData!.customerEmail?.trim().toLowerCase() || "",
          imageUrls,
          token,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to submit review");

      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleReviewAnother = () => {
    // Mark just-reviewed product as reviewed in local state
    if (tokenData?.products && selectedProduct) {
      const updated = tokenData.products.map((p) =>
        p.productId === selectedProduct.productId
          ? { ...p, alreadyReviewed: true }
          : p,
      );
      setTokenData({ ...tokenData, products: updated });
    }
    setSubmitted(false);
    setSelectedProduct(null);
    setRating(0);
    setTitle("");
    setContent("");
    setImages([]);
    setError(null);
    setFieldErrors(new Set());
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // --- Invalid Token ---
  if (!tokenData?.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-secondary-900 mb-2 text-xl font-bold">
            Invalid Link
          </h1>
          <p className="text-secondary-600 mb-6">
            {tokenData?.error || "This review link is invalid or has expired."}
          </p>
          <Link
            href="/"
            className="bg-primary-600 hover:bg-primary-700 inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // --- All Products Already Reviewed ---
  if (tokenData.allReviewed) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-secondary-900 mb-2 text-xl font-bold">
            All Products Reviewed
          </h1>
          <p className="text-secondary-600 mb-6">
            You have already submitted reviews for all products in this order.
            Thank you for your feedback!
          </p>
          <Link
            href="/"
            className="bg-primary-600 hover:bg-primary-700 inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // --- Success ---
  if (submitted) {
    const remaining =
      tokenData.products?.filter(
        (p) => !p.alreadyReviewed && p.productId !== selectedProduct?.productId,
      ) || [];

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-secondary-900 mb-3 text-2xl font-bold">
            Thank You!
          </h1>
          <p className="text-secondary-600 mb-2">
            Your review has been submitted and will be visible after moderation.
          </p>
          <p className="text-secondary-400 mb-8 text-sm">
            Your feedback helps fellow shooters make better choices.
          </p>
          {remaining.length > 0 ? (
            <button
              onClick={handleReviewAnother}
              className="bg-primary-600 hover:bg-primary-700 inline-block rounded-xl px-8 py-3 font-semibold text-white transition-colors"
            >
              Review Another Product
            </button>
          ) : (
            <Link
              href="/"
              className="bg-primary-600 hover:bg-primary-700 inline-block rounded-xl px-8 py-3 font-semibold text-white transition-colors"
            >
              Continue Shopping
            </Link>
          )}
        </div>
      </div>
    );
  }

  // --- Product Picker (multi-item orders) ---
  if (showProductPicker && !selectedProduct) {
    const reviewable = tokenData.products!.filter((p) => !p.alreadyReviewed);
    const reviewed = tokenData.products!.filter((p) => p.alreadyReviewed);

    return (
      <div className="flex min-h-screen items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg">
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="px-8 pt-8 pb-4 text-center">
              <h1 className="text-secondary-900 text-lg font-semibold">
                Select a Product to Review
              </h1>
              <p className="text-secondary-500 mt-1 text-sm">
                Choose which product you would like to review
              </p>
            </div>

            <div className="space-y-3 px-8 pb-8">
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
                  className="border-secondary-200 hover:border-primary-300 hover:bg-primary-50 flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors"
                >
                  {product.imageUrl ? (
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.productName}
                      width={56}
                      height={56}
                      className="bg-secondary-50 border-secondary-100 h-14 w-14 rounded-lg border object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="bg-secondary-100 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg">
                      <svg
                        className="text-secondary-300 h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-secondary-900 block font-medium">
                      {product.productName}
                    </span>
                    {product.variationName && (
                      <span className="text-secondary-500 text-sm">
                        {product.variationName}
                      </span>
                    )}
                  </div>
                  <svg
                    className="text-secondary-400 h-5 w-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}

              {reviewed.map((product) => (
                <div
                  key={product.productId}
                  className="border-secondary-100 bg-secondary-50 flex w-full items-center gap-4 rounded-xl border p-4 opacity-60"
                >
                  {product.imageUrl ? (
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.productName}
                      width={56}
                      height={56}
                      className="bg-secondary-50 h-14 w-14 rounded-lg object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="bg-secondary-100 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg">
                      <svg
                        className="text-secondary-300 h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-secondary-500 block font-medium">
                      {product.productName}
                    </span>
                    {product.variationName && (
                      <span className="text-secondary-400 text-sm">
                        {product.variationName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1 text-green-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-xs font-medium">Reviewed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-secondary-400 text-lg font-bold">
              {process.env.NEXT_PUBLIC_SITE_NAME || "TNT First Aid"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Review Form ---
  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Product Image + Name */}
          <div className="px-8 pt-8 pb-4 text-center">
            {showProductPicker && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setRating(0);
                  setTitle("");
                  setContent("");
                  setImages([]);
                  setError(null);
                }}
                className="text-secondary-500 hover:text-secondary-700 mb-4 inline-flex items-center gap-1 text-sm transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Review a different product
              </button>
            )}

            {selectedProduct?.imageUrl ? (
              <div className="bg-secondary-50 border-secondary-100 mx-auto mb-4 h-24 w-24 overflow-hidden rounded-xl border">
                <ProductImage
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.productName}
                  width={96}
                  height={96}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="bg-secondary-100 mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-xl">
                <svg
                  className="text-secondary-300 h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            )}

            <h1 className="text-secondary-900 text-lg font-semibold">
              {selectedProduct?.productName}
            </h1>
            {selectedProduct?.variationName && (
              <p className="text-secondary-500 text-sm">
                {selectedProduct.variationName}
              </p>
            )}
            <p className="text-secondary-500 mt-1 text-sm">
              How would you rate this product?
            </p>
          </div>

          {/* Star Rating */}
          <div className="px-8 py-4 text-center">
            <div className="flex justify-center">
              <div
                className={
                  fieldErrors.has("rating")
                    ? "inline-block rounded-lg p-1 ring-1 ring-red-400"
                    : "inline-block"
                }
              >
                <StarRating
                  rating={rating}
                  size="2xl"
                  interactive
                  onChange={(val) => {
                    setRating(val);
                    if (fieldErrors.size)
                      setFieldErrors((prev) => {
                        const n = new Set(prev);
                        n.delete("rating");
                        return n;
                      });
                  }}
                />
              </div>
            </div>
            <div className="mt-2 h-6">
              {rating > 0 && (
                <span className="text-sm font-medium text-amber-600">
                  {RATING_LABELS[rating]}
                </span>
              )}
            </div>
          </div>

          {/* Progressive Disclosure: Form appears after star selection */}
          {rating > 0 && (
            <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-8">
              <div className="border-secondary-100 border-t" />

              {/* Review Title */}
              <div>
                <label
                  htmlFor="review-title"
                  className="text-secondary-700 mb-2 block text-sm font-medium"
                >
                  Review Title{" "}
                  <span className="text-secondary-400">(optional)</span>
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={255}
                  className="border-secondary-200 text-secondary-700 placeholder:text-secondary-400 focus:ring-primary-500 focus:border-primary-500 w-full rounded-xl border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                />
              </div>

              {/* Review Content */}
              <div>
                <label
                  htmlFor="review-content"
                  className="text-secondary-700 mb-2 block text-sm font-medium"
                >
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="review-content"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (fieldErrors.size)
                      setFieldErrors((prev) => {
                        const n = new Set(prev);
                        n.delete("content");
                        return n;
                      });
                  }}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  maxLength={5000}
                  className={`w-full border px-4 py-3 ${fieldErrors.has("content") ? "border-red-400" : "border-secondary-200"} text-secondary-700 placeholder:text-secondary-400 focus:ring-primary-500 focus:border-primary-500 resize-none rounded-xl transition-colors focus:ring-2 focus:outline-none`}
                />
                <span className="text-secondary-400 mt-1 block text-xs">
                  {content.length}/5000 characters (minimum 10)
                </span>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="text-secondary-700 mb-2 block text-sm font-medium">
                  Add Photos{" "}
                  <span className="text-secondary-400">(optional)</span>
                </label>

                {images.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="group relative">
                        <div className="border-secondary-200 h-20 w-20 overflow-hidden rounded-lg border">
                          <ProductImage
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
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
                      className="border-secondary-200 text-secondary-600 hover:bg-secondary-50 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Add Photos
                    </label>
                    <span className="text-secondary-400 ml-2 text-xs">
                      {images.length}/{MAX_IMAGES} (max 5MB each)
                    </span>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 w-full rounded-xl px-4 py-3 font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {uploadProgress || "Submitting..."}
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>

              {/* Reviewing as */}
              <p className="text-secondary-400 text-center text-xs">
                Reviewing as{" "}
                <span className="text-secondary-500 font-medium">
                  {tokenData.customerName}
                </span>
              </p>
            </form>
          )}

          {/* Bottom padding when no rating selected */}
          {rating === 0 && <div className="pb-8" />}
        </div>

        {/* Branding */}
        <div className="mt-6 text-center">
          <span className="text-secondary-400 text-lg font-bold">
            {process.env.NEXT_PUBLIC_SITE_NAME || "TNT First Aid"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="text-secondary-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ReviewPageContent />
    </Suspense>
  );
}
