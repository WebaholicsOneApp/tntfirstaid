# Alpha Munitions — OneApp API Migration Checklist

## Pre-Deploy Checks
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] No knex/pg imports in src/: `grep -r "pgKnex\|knex\|from 'pg'" src/` returns zero matches
- [ ] All env vars documented in `src/env.js` are set in Vercel (or local `.env`)

---

## Functional Tests

### Homepage & Navigation
- [ ] `/` — homepage loads, featured products appear
- [ ] Mega menu — SHOP dropdown shows category tree
- [ ] Search overlay — typing in header search shows autocomplete
- [ ] Search overlay — category suggestions appear

### Shop / Listing
- [ ] `/shop` — product grid renders with prices
- [ ] `/shop` — filter by category works
- [ ] `/shop` — price range slider works
- [ ] `/shop` — pagination works (next/prev page)
- [ ] `/shop/[category]` — category slug page loads products

### Product Detail
- [ ] `/product/[slug]` — product detail page loads
- [ ] `/product/[slug]` — images display correctly
- [ ] `/product/[slug]` — variation selector works
- [ ] `/product/[slug]` — price updates on variation change
- [ ] `/product/[slug]` — reviews section renders (or shows "no reviews")
- [ ] `/product/[slug]` — related products section renders

### Search
- [ ] `/search?q=brass` — search results page loads
- [ ] Empty search query — blocked (min length enforced)
- [ ] Very long search query — blocked (max length enforced)

### Static / Info Pages
- [ ] `/privacy` — privacy policy content renders
- [ ] `/terms` — terms content renders
- [ ] `/shipping-returns` — shipping policy renders
- [ ] `/contact` — contact form renders
- [ ] `/faq` — FAQ page loads
- [ ] `/about` — about page loads
- [ ] `/news` — news page loads

### Checkout
- [ ] `/checkout` — cart → checkout → Stripe redirect works (requires STRIPE keys)

### Edge Cases
- [ ] Invalid product slug → 404 page
- [ ] Invalid category slug → empty state or 404

---

## Webhook / API Tests

### API Smoke Tests (curl)
- [ ] `GET /api/products` — returns product list JSON
- [ ] `GET /api/search/suggestions?q=brass` — returns suggestions JSON
- [ ] `GET /api/products?categoryId=X` — filtered results
- [ ] `POST /api/contact` with test payload — returns 200
- [ ] `POST /api/revalidate` with `ONEAPP_WEBHOOK_SECRET` — returns 200

### Auth Guards
- [ ] `POST /api/orders/fulfillment` without auth header → 401
- [ ] `POST /api/orders/fulfillment` with wrong secret → 401
- [ ] `POST /api/revalidate` with wrong secret → 401

---

## Known Issues / Notes

- `getReviewAggregate` null-cache bug fixed (was re-fetching every request for products with no reviews)
- `SearchSuggestionsResponse.queryType` widened to include `'ymm'` for year/make/model queries
- Removed unused `CACHE_TTL_SEARCH_MS` constant
- Category exclusions: "Modified Cases" and "Reloading Component" excluded from storefront display (`EXCLUDED_DB_CATEGORIES` in `src/lib/data.ts`)
- Stripe, email (Resend), and legacy DB env vars are optional — only `ONEAPP_API_URL` and `ONEAPP_API_KEY` are required for storefront reads
