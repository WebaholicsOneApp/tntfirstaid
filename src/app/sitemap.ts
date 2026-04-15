import type { MetadataRoute } from "next";
import { getProducts, getTopLevelCategories } from "~/lib/data";
import { slugify } from "~/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://tntfirstaid.com";

  let productsResult: { products: { slug: string }[] } = { products: [] };
  let categories: { categoryName: string }[] = [];

  try {
    const PAGE_SIZE = 100;
    let allProducts: { slug: string }[] = [];
    let page = 1;
    let hasMore = true;

    const [firstPage, c] = await Promise.all([
      getProducts({}, "newest", { page: 1, pageSize: PAGE_SIZE }),
      getTopLevelCategories(),
    ]);

    allProducts = firstPage.products;
    hasMore = firstPage.products.length === PAGE_SIZE;
    categories = c;
    page = 2;

    while (hasMore) {
      const result = await getProducts({}, "newest", {
        page,
        pageSize: PAGE_SIZE,
      });
      allProducts = allProducts.concat(result.products);
      hasMore = result.products.length === PAGE_SIZE;
      page++;
    }

    productsResult = { products: allProducts };
  } catch {
    // API may be unreachable during build — return static pages only
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/distributors`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const productPages: MetadataRoute.Sitemap = productsResult.products.map(
    (product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/shop/${slugify(category.categoryName)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
