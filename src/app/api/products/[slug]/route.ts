import { NextResponse } from "next/server";
import { getProductDetailOnly } from "~/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const product = await getProductDetailOnly(slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    brandName: product.brandName,
    categoryName: product.categoryName,
    primaryImage: product.primaryImage,
    description: product.description,
    bulletPoints: product.bulletPoints,
    images: product.images,
    price: product.price,
    maxPrice: product.maxPrice,
    msrp: product.msrp,
    inStock: product.inStock,
    variations: product.variations,
  });
}
