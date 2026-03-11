import { getCategoryTreeForStorefront } from '~/lib/data';
import Header from './Header';
import type { CategoryWithChildren } from '~/types';

interface HeaderWrapperProps {
  siteName?: string;
}

export default async function HeaderWrapper({ siteName }: HeaderWrapperProps) {
  let categories: CategoryWithChildren[] = [];
  try {
    categories = await getCategoryTreeForStorefront();
  } catch {
    categories = [];
  }
  return <Header siteName={siteName} categories={categories} />;
}
