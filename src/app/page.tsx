import { getFeaturedProducts, getCategoryIdsByNamePattern, getProducts } from '~/lib/data';
import HeroSection from '~/components/home/HeroSection';
import OcdTechnologySection from '~/components/home/OcdTechnologySection';
import FeatureIconsSection from '~/components/home/FeatureIconsSection';
import DataDrivenSection from '~/components/home/DataDrivenSection';
import ShopBrassCarousel from '~/components/home/ShopBrassCarousel';
import ReamersSection from '~/components/home/ReamersSection';
import SignaturesSection from '~/components/home/SignaturesSection';
import FooterCtaBanner from '~/components/home/FooterCtaBanner';
import AnimatedDivider from '~/components/ui/AnimatedDivider';

export default async function HomePage() {
  // Fetch brass products and reamer/tool products in parallel
  const [brassProducts, reamerProducts] = await Promise.all([
    getBrassProducts(),
    getReamerProducts(),
  ]);

  return (
    <>
      <HeroSection />
      <OcdTechnologySection />
      <FeatureIconsSection />
      <DataDrivenSection />
      <AnimatedDivider />
      <ShopBrassCarousel products={brassProducts} />
      <AnimatedDivider />
      <ReamersSection products={reamerProducts} />
      <AnimatedDivider />
      <SignaturesSection />
      <FooterCtaBanner />
    </>
  );
}

async function getBrassProducts() {
  try {
    const brassCategoryIds = await getCategoryIdsByNamePattern('Brass');
    if (brassCategoryIds.length > 0) {
      const result = await getProducts(
        { categoryIds: brassCategoryIds },
        'best_sellers',
        { page: 1, pageSize: 12 }
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
    const reamerCategoryIds = await getCategoryIdsByNamePattern('Reamer');
    if (reamerCategoryIds.length > 0) {
      const result = await getProducts(
        { categoryIds: reamerCategoryIds },
        'best_sellers',
        { page: 1, pageSize: 4 }
      );
      return result.products;
    }
    // Fallback to featured products if no reamer category found
    return getFeaturedProducts(4);
  } catch {
    return [];
  }
}
