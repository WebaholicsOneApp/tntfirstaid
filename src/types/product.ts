/**
 * Product Types for Storefront
 * Based on OneApp database schema
 */

// Store Product (main product entity)
export interface StoreProduct {
  id: number;
  storeId: number;
  name: string;
  description: string | null;
  bulletPoints: string[];
  metaData: Record<string, unknown>;
  keywords: string | null;
  brandId: number | null;
  productType: 'simple' | 'grouped';
  isGroup: boolean;
  channelCategoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deactivatedAt: Date | null;
}

// Variation (SKU-level product variant)
export interface Variation {
  id: number;
  productId: number;
  manufacturerNo: string | null;
  brandId: number | null;
  baseVariationId: number | null;
  packCount: number | null;
  weight: number | null;
  itemPrice: number | null; // in cents
  msrp: number | null; // in cents
  map: number | null; // Minimum Advertised Price in cents
  metaData: Record<string, unknown>;
  variantType: string | null;
  variantTypeTwo: string | null;
  variation: string | null;
  variationTwo: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Variation Image
export interface VariationImage {
  id: number;
  variationId: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Product Image
export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string[]; // Array constrained to single element
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Brand
export interface Brand {
  id: number;
  brand: string;
  metaData: Record<string, unknown>;
}

// Category
export interface Category {
  id: number;
  categoryName: string;
  parentCategoryId: number | null;
  amazonCategoryId: string | null;
  walmartCategoryId: string | null;
  wooCommerceCategoryId: string | null;
  ebayCategoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Manufacturer Supplier (for inventory)
export interface ManufacturerSupplier {
  id: number;
  variationId: number | null;
  manufacturerNo: string;
  brandId: number | null;
  quantity: number;
  cost: number | null; // in cents
  msrp: number | null;
  shippingCost: number | null;
  estimatedShipping: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Storefront DTOs (Data Transfer Objects)
// ============================================

// Product for list/grid display
export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  brandName: string | null;
  brandId: number | null;
  categoryName: string | null;
  categoryId: number | null;
  primaryImage: string | null;
  fallbackImage: string | null; // Used when primaryImage fails to load
  price: number | null; // in cents
  maxPrice?: number | null; // in cents (for price ranges)
  msrp: number | null; // in cents (min MSRP for discount calculations)
  maxMsrp?: number | null; // in cents (max MSRP for ranges)
  map: number | null; // MAP (Minimum Advertised Price) in cents - used for discount calculations
  maxMap?: number | null; // in cents (for MAP ranges)
  inStock: boolean;
  variationCount: number;
  averageRating?: number;
  totalReviews?: number;
}

// Full product detail
export interface ProductDetail extends ProductListItem {
  bulletPoints: string[];
  keywords: string | null;
  images: string[];
  variations: VariationDetail[];
  relatedProducts: ProductListItem[];
}

// Variation detail for product page
export interface VariationDetail {
  id: number;
  manufacturerNo: string | null;
  variantType: string | null;
  variation: string | null;
  variantTypeTwo: string | null;
  variationTwo: string | null;
  price: number | null;
  msrp: number | null;
  map: number | null;
  weight: number | null;
  images: string[];
  inStock: boolean;
  quantity: number;
}

// Category with hierarchy
export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
  productCount?: number;
  imageUrl?: string;
  mergedCategoryIds: number[]; // all DB IDs this node represents (includes self)
}

// Brand for display
export interface BrandListItem {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  logoUrl?: string;
}

// Search result
export interface SearchResult {
  products: ProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filters for product queries
export interface ProductFilters {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  productIds?: number[];
}

// Sort options
export type ProductSortOption =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'oldest'
  | 'best_sellers'
  | 'relevance'
  | 'top_rated';

// Pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// ============================================
// Search Suggestion Types
// ============================================

// Product suggestion for autocomplete
export interface ProductSuggestion {
  id: number;
  slug: string;
  name: string;
  brandName: string | null;
  primaryImage: string | null;
  price: number | null; // in cents
  maxPrice: number | null; // in cents
  inStock: boolean;
}

// Category suggestion for autocomplete
export interface CategorySuggestion {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  parentName: string | null;
}

// Complete search suggestions response
export interface SearchSuggestionsResponse {
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  queryType: 'sku' | 'keyword' | 'ymm';
}
