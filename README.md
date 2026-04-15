# TNT First Aid

Storefront for TNT First Aid, built on the [T3 Stack](https://create.t3.gg/) (Next.js + TypeScript + Tailwind).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in required values
npm run dev                  # starts on http://localhost:3005
```

## Scripts

- `npm run dev` — Next.js dev server (Turbopack) on port 3005
- `npm run build` — production build
- `npm run check` — lint + typecheck
- `npm run format:write` — Prettier
- `npm run test:build` — build with `SKIP_ENV_VALIDATION=1`

## Stack

- [Next.js 15](https://nextjs.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Stripe](https://stripe.com) for payments
- [Resend](https://resend.com) for transactional email
- [@t3-oss/env-nextjs](https://env.t3.gg) for env validation
