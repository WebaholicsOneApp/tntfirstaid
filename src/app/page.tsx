import { Suspense } from "react";
import dynamic from "next/dynamic";
import {
  getFeaturedProducts,
  getCategoryIdsByNamePattern,
  getProducts,
} from "~/lib/data";

const HudHeroSection = dynamic(
  () => import("~/components/home/HudHeroSection"),
  { loading: () => <div className="bg-secondary-950 h-screen" /> },
);

export const revalidate = 300;
import MarqueeBand from "~/components/home/MarqueeBand";
import OcdTechnologySection from "~/components/home/OcdTechnologySection";
import FeatureIconsSection from "~/components/home/FeatureIconsSection";
import DataDrivenSection from "~/components/home/DataDrivenSection";
import ShopBrassCarousel from "~/components/home/ShopBrassCarousel";
import ReamersSection from "~/components/home/ReamersSection";
import SignaturesSection from "~/components/home/SignaturesSection";
import FooterCtaBanner from "~/components/home/FooterCtaBanner";

function CarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-secondary-200 h-px w-6" />
            <div className="skeleton h-3 w-24" />
          </div>
          <div className="skeleton h-10 w-48" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="border-secondary-100 w-[220px] shrink-0 overflow-hidden rounded-lg border"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className="skeleton aspect-[3/4] !rounded-none"
                style={{ animationDelay: `${i * 100}ms` }}
              />
              <div className="space-y-2 p-3">
                <div
                  className="skeleton h-4 w-3/4"
                  style={{ animationDelay: `${i * 100 + 50}ms` }}
                />
                <div
                  className="skeleton h-4 w-1/3"
                  style={{ animationDelay: `${i * 100 + 100}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HudHeroSection />
      <MarqueeBand />
      <OcdTechnologySection />
      <FeatureIconsSection />
      <DataDrivenSection />
      <Suspense fallback={<CarouselSkeleton count={6} />}>
        <BrassCarouselLoader />
      </Suspense>
      <Suspense fallback={<CarouselSkeleton count={4} />}>
        <ReamersSectionLoader />
      </Suspense>
      <SignaturesSection />
      <FooterCtaBanner />
    </>
  );
}

async function BrassCarouselLoader() {
  const products = await getBrassProducts();
  return <ShopBrassCarousel products={products} />;
}

async function ReamersSectionLoader() {
  const products = await getReamerProducts();
  return <ReamersSection products={products} />;
}

async function getBrassProducts() {
  try {
    const brassCategoryIds = await getCategoryIdsByNamePattern("Brass");
    if (brassCategoryIds.length > 0) {
      const result = await getProducts(
        { categoryIds: brassCategoryIds },
        "best_sellers",
        { page: 1, pageSize: 12 },
      );
      return result.products;
    }
    // Fallback to featured products if no brass category found
    return getFeaturedProducts(12);
  } catch {
    return [];
  }
}

async function getReamerProducts() {
  try {
    const reamerCategoryIds = await getCategoryIdsByNamePattern("Reamer");
    if (reamerCategoryIds.length > 0) {
      const result = await getProducts(
        { categoryIds: reamerCategoryIds },
        "best_sellers",
        { page: 1, pageSize: 4 },
      );
      return result.products;
    }
    // Fallback to featured products if no reamer category found
    return getFeaturedProducts(4);
  } catch {
    return [];
  }
}
