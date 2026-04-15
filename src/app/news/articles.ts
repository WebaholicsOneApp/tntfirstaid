export interface Article {
  slug: string;
  title: string;
  author: string;
  date: string;
  category: string;
  image: string;
  /** Text paragraphs for text-based articles */
  content?: string[];
  /** Remote magazine page scan URLs for image-based articles */
  pages?: string[];
  /** External purchase link for magazine articles */
  purchaseUrl?: string;
}

export const articles: Article[] = [];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export const categories = ["All", "News", "Training", "Preparedness"];
