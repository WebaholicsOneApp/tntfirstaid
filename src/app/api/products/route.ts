import { NextResponse } from "next/server";
import { getProducts } from "~/lib/data";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";
import type { ProductSortOption } from "~/types";

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(clientIp, "api");
  if (!rateLimit.success) return rateLimitResponse(rateLimit);

  try {
    const { searchParams } = new URL(request.url);

    // Enforce page >= 2 (page 1 is always server-rendered)
    const page = parseInt(searchParams.get("page") || "1", 10);
    if (isNaN(page) || page < 2) {
      return NextResponse.json({ error: "page must be >= 2" }, { status: 400 });
    }

    const sort = (searchParams.get("sort") ||
      "best_sellers") as ProductSortOption;
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") || "24", 10),
      48,
    );

    const parseCsvInts = (param: string | null) =>
      param
        ? param
            .split(",")
            .map((id) => parseInt(id, 10))
            .filter((id) => !isNaN(id))
        : undefined;

    const categoryIds = parseCsvInts(searchParams.get("categoryIds"));
    const brandIds = parseCsvInts(searchParams.get("brandIds"));
    const rawProductIds = parseCsvInts(searchParams.get("productIds"));
    const productIds = rawProductIds ? rawProductIds.slice(0, 500) : undefined;

    const filters = {
      categoryIds: categoryIds?.length ? categoryIds : undefined,
      brandIds: brandIds?.length ? brandIds : undefined,
      search: searchParams.get("search") || undefined,
      minPrice: searchParams.get("minPrice")
        ? parseInt(searchParams.get("minPrice")!, 10)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseInt(searchParams.get("maxPrice")!, 10)
        : undefined,
      inStock: searchParams.get("inStock") === "true" ? true : undefined,
      onSale: searchParams.get("onSale") === "true" ? true : undefined,
      packAvailable:
        searchParams.get("packAvailable") === "true" ? true : undefined,
      productIds: productIds?.length ? productIds : undefined,
    };

    const result = await getProducts(filters, sort, { page, pageSize });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control":
          "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[api/products]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
