import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductDetailBySlug, getReviewAggregate } from '~/lib/data';
import { stripHtml } from '~/lib/sanitize';
import Breadcrumbs from '~/components/common/Breadcrumbs';
import JsonLd from '~/components/common/JsonLd';
import ProductDetailClient from '~/components/products/ProductDetailClient';
import ProductGrid from '~/components/products/ProductGrid';
import type { BreadcrumbItem } from '~/components/common/Breadcrumbs';
import type { ReviewAggregate } from '~/types/review';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const description = product.description
    ? stripHtml(product.description).slice(0, 160)
    : `${product.name} - premium ammunition from Alpha Munitions`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.primaryImage ? [{ url: product.primaryImage }] : undefined,
    },
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch review aggregate in parallel — non-blocking if table is empty
  const reviewAggregate = await getReviewAggregate(product.id).catch(() => null);

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
  ];
  if (product.categoryName) {
    breadcrumbs.push({
      label: product.categoryName,
      href: `/shop/${slugify(product.categoryName)}`,
    });
  }
  breadcrumbs.push({ label: product.name });

  // JSON-LD structured data
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description
      ? stripHtml(product.description).slice(0, 5000)
      : undefined,
    image: product.primaryImage ?? undefined,
    brand: product.brandName
      ? { '@type': 'Brand', name: product.brandName }
      : undefined,
    offers: {
      '@type': product.variations.length > 1 ? 'AggregateOffer' : 'Offer',
      priceCurrency: 'USD',
      ...(product.variations.length > 1
        ? {
            lowPrice: product.price != null ? (product.price / 100).toFixed(2) : undefined,
            highPrice:
              product.maxPrice != null ? (product.maxPrice / 100).toFixed(2) : undefined,
            offerCount: product.variations.length,
          }
        : {
            price: product.price != null ? (product.price / 100).toFixed(2) : undefined,
          }),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={jsonLd} />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Product detail */}
      <ProductDetailClient product={product} reviewAggregate={reviewAggregate} />

      {/* Related products */}
      {product.relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-display font-bold text-secondary-800 mb-6">
            You May Also Like
          </h2>
          <ProductGrid products={product.relatedProducts.slice(0, 4)} />
        </section>
      )}
    </div>
  );
}
