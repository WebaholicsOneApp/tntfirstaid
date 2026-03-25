import { NextResponse } from 'next/server';
import { getApiClient } from '~/lib/api-client';
import { escapeXml, slugify } from '~/lib/xml-helpers';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alphamunition.com';

export async function GET() {
  try {
    // Fetch all approved reviews with product info via API
    const data = await getApiClient().getReviewsFeed<{
      reviews: {
        id: number;
        customerName: string;
        rating: number;
        title: string | null;
        content: string;
        createdAt: string | Date;
        productName: string;
      }[];
    }>();

    const reviews = data.reviews || [];

    const reviewXmlEntries = reviews.map((review) => {
      const productSlug = slugify(review.productName);
      const productUrl = `${siteUrl}/products/${productSlug}`;
      const timestamp = new Date(review.createdAt).toISOString();

      return `    <review>
      <review_id>${escapeXml(String(review.id))}</review_id>
      <reviewer>
        <name>${escapeXml(review.customerName)}</name>
      </reviewer>
      <review_timestamp>${timestamp}</review_timestamp>${review.title ? `\n      <title>${escapeXml(review.title)}</title>` : ''}
      <content>${escapeXml(review.content)}</content>
      <review_url type="singleton">${escapeXml(productUrl)}#reviews</review_url>
      <ratings>
        <overall min="1" max="5">${review.rating}</overall>
      </ratings>
      <products>
        <product>
          <product_url>${escapeXml(productUrl)}</product_url>
          <product_name>${escapeXml(review.productName)}</product_name>
        </product>
      </products>
      <is_spam>false</is_spam>
    </review>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:vc="http://www.w3.org/2007/XMLSchema-versioning"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:noNamespaceSchemaLocation="http://www.google.com/shopping/reviews/schema/product/2.3/product_reviews.xsd">
  <version>2.3</version>
  <publisher>
    <name>${escapeXml(process.env.STORE_NAME || 'Alpha Munitions')}</name>
    <link>${escapeXml(siteUrl)}</link>
  </publisher>
  <reviews>
${reviewXmlEntries.join('\n')}
  </reviews>
</feed>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating reviews feed:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><error>Internal Server Error</error>',
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml' },
      }
    );
  }
}
