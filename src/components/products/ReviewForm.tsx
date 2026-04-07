"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import StarRating from "./StarRating";

interface ReviewFormProps {
  productId: number;
  productName: string;
  prefillEmail?: string;
  prefillName?: string;
  token?: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImagePreview {
  file: File;
  preview: string;
}

const MAX_IMAGES = 5;

export default function ReviewForm({
  productId,
  productName,
  prefillEmail,
  prefillName,
  token,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [customerName, setCustomerName] = useState(prefillName || "");
  const [customerEmail, setCustomerEmail] = useState(prefillEmail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total count
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate and create previews
    const newImages: ImagePreview[] = [];
    for (const file of files) {
      // Check file type
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        )
      ) {
        setError("Only JPEG, PNG, WebP, and GIF images are allowed");
        return;
      }
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be under 5MB");
        return;
      }
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImages([...images, ...newImages]);
    setError(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const removed = newImages[index];
    if (removed) URL.revokeObjectURL(removed.preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const errors = new Set<string>();
    if (rating === 0) errors.add("rating");
    if (content.trim().length < 10) errors.add("content");
    if (customerName.trim().length < 2) errors.add("customerName");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
      errors.add("customerEmail");
    if (errors.size > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields.");
      return;
    }
    setFieldErrors(new Set());

    setIsSubmitting(true);

    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploadProgress("Uploading...");
        const formData = new FormData();
        images.forEach((img) => {
          formData.append("images", img.file);
        });

        const uploadResponse = await fetch("/api/reviews/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to upload images");
        }

        imageUrls = uploadData.images.map((img: { url: string }) => img.url);
      }

      setUploadProgress("Submitting review...");

      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          imageUrls,
          token, // Include token for verified purchase tracking
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Clean up image previews
      images.forEach((img) => URL.revokeObjectURL(img.preview));

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Prevent body scroll when modal is open
  if (typeof window !== "undefined") {
    document.body.style.overflow = "hidden";
  }

  const handleClose = () => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = "";
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-secondary-100 sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b bg-white px-6 py-4">
          <h2 className="text-secondary-900 text-lg font-bold">
            Write a Review
          </h2>
          <button
            onClick={handleClose}
            className="hover:bg-secondary-100 rounded-lg p-2 transition-colors"
          >
            <svg
              className="text-secondary-500 h-5 w-5"
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

        {success ? (
          /* Success State */
          <div className="p-8 text-center">
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
            <h3 className="text-secondary-900 mb-2 text-xl font-bold">
              Thank You!
            </h3>
            <p className="text-secondary-600">
              Your review has been submitted and will be visible after
              moderation.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* Product name */}
            <div className="text-secondary-600 text-sm">
              Reviewing:{" "}
              <span className="text-secondary-900 font-medium">
                {productName}
              </span>
            </div>

            {/* Star Rating */}
            <div>
              <label className="text-secondary-700 mb-2 block text-sm font-medium">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div
                className={
                  fieldErrors.has("rating")
                    ? "inline-block rounded-lg p-1 ring-1 ring-red-400"
                    : "inline-block"
                }
              >
                <StarRating
                  rating={rating}
                  size="lg"
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
              {rating > 0 && (
                <span className="text-secondary-500 mt-1 block text-sm">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>

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

            {/* Image Upload */}
            <div>
              <label className="text-secondary-700 mb-2 block text-sm font-medium">
                Add Photos{" "}
                <span className="text-secondary-400">(optional)</span>
              </label>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {images.map((img, index) => (
                    <div key={index} className="group relative">
                      <div className="border-secondary-200 h-20 w-20 overflow-hidden rounded-lg border">
                        <Image
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
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

              {/* Upload Button */}
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

            {/* Name */}
            <div>
              <label
                htmlFor="review-name"
                className="text-secondary-700 mb-2 block text-sm font-medium"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="review-name"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (fieldErrors.size)
                    setFieldErrors((prev) => {
                      const n = new Set(prev);
                      n.delete("customerName");
                      return n;
                    });
                }}
                placeholder="John D."
                maxLength={100}
                className={`w-full border px-4 py-3 ${fieldErrors.has("customerName") ? "border-red-400" : "border-secondary-200"} text-secondary-700 placeholder:text-secondary-400 focus:ring-primary-500 focus:border-primary-500 rounded-xl transition-colors focus:ring-2 focus:outline-none`}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="review-email"
                className="text-secondary-700 mb-2 block text-sm font-medium"
              >
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                id="review-email"
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (fieldErrors.size)
                    setFieldErrors((prev) => {
                      const n = new Set(prev);
                      n.delete("customerEmail");
                      return n;
                    });
                }}
                placeholder="john@example.com"
                className={`w-full border px-4 py-3 ${fieldErrors.has("customerEmail") ? "border-red-400" : "border-secondary-200"} text-secondary-700 placeholder:text-secondary-400 focus:ring-primary-500 focus:border-primary-500 rounded-xl transition-colors focus:ring-2 focus:outline-none`}
              />
              <span className="text-secondary-400 mt-1 block text-xs">
                Your email will not be published
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit button */}
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
          </form>
        )}
      </div>
    </div>
  );
}
