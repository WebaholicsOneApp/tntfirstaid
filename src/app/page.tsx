import { Suspense } from "react";
import { getFeaturedProducts } from "~/lib/data";
import { DEMO_FEATURED_PRODUCTS } from "~/lib/demo-featured-products";
import HeroSection from "~/components/home/HeroSection";
import MarqueeBand from "~/components/home/MarqueeBand";
import FeatureIconsSection from "~/components/home/FeatureIconsSection";
import DataDrivenSection from "~/components/home/DataDrivenSection";
import FeaturedProductsGrid from "~/components/home/FeaturedProductsGrid";
import FooterCtaBanner from "~/components/home/FooterCtaBanner";

export const revalidate = 300;

function FeaturedGridSkeleton() {
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-5 lg:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border-secondary-100 overflow-hidden rounded-lg border"
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
          <div className="skeleton min-h-[420px] !rounded-2xl" />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeBand />
      <FeatureIconsSection />
      <Suspense fallback={<FeaturedGridSkeleton />}>
        <FeaturedProductsLoader />
      </Suspense>
      <DataDrivenSection />
      <FooterCtaBanner />
    </>
  );
}

async function FeaturedProductsLoader() {
  const products = await getFeaturedProducts(4).catch(() => []);
  const display = products.length > 0 ? products : DEMO_FEATURED_PRODUCTS;
  return <FeaturedProductsGrid products={display} />;
}
