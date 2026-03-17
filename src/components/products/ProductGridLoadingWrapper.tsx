'use client';

import { useNavigationLoading } from '~/lib/navigation-loading-context';
import ProductCardSkeleton from './ProductCardSkeleton';

export default function ProductGridLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { isNavigating } = useNavigationLoading();

  if (isNavigating) {
    return <ProductCardSkeleton count={12} />;
  }

  return <>{children}</>;
}
