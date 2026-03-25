# Lessons Learned

## Next.js Performance Patterns (learned 2026-03-25)

### Root Layout is the #1 Performance Bottleneck
- Every `await` in `layout.tsx` blocks ALL page rendering — no HTML sent until layout completes
- Always use `Promise.all()` for independent fetches in layouts
- Never block the layout on auth calls (`getMe()`) — move auth hydration to client-side
- `React.cache()` deduplicates `getStoreConfig()` across `generateMetadata()` and layout/page within same request

### `loading.tsx` is Critical for Perceived Performance
- Without `loading.tsx`, Next.js waits for the ENTIRE server component tree before sending bytes
- Adding `loading.tsx` creates Suspense boundaries that enable streaming — layout shell renders immediately
- Key routes that need loading skeletons: root, shop, product detail, search
- Skeletons should match the page's visual structure (heading + grid placeholders, etc.)

### `next/dynamic` in Server Components
- **`ssr: false` is NOT allowed in Server Components** — Next.js will throw a build error
- Dynamic imports still code-split without `ssr: false` — the component JS loads in a separate chunk
- Use `loading: () => <placeholder />` for a visual fallback while the chunk downloads
- Good for heavy libraries (GSAP ~100KB) only used on specific pages

### Client-Side Auth Hydration Pattern
- Instead of blocking layout with `getMe(token)`, pass `initialCustomer: null` to AuthProvider
- AuthProvider starts with `isLoading: true` when `customerAuthEnabled && !initialCustomer`
- `useEffect` on mount calls `/api/auth/me` to hydrate — resolves in ~200ms client-side
- Auth-gated pages (account login) must check `isLoading` before `isAuthenticated` to avoid flash of login form
- Server components that need auth data (dashboard) still do their own `getMe()` call — this is fine

### Dead Config Cleanup
- When migrating from direct DB to API client, remove webpack externals for DB drivers
- `serverExternalPackages` and webpack `externals` for packages not in `package.json` are dead weight
- Verify with `grep` in `package.json` before removing

## General Patterns

### Always Verify After Changes
- Run `tsc --noEmit` for type safety
- Run `next build` for compilation + build errors
- Run `next lint` to check no new warnings introduced
- Build errors from `ssr: false` in Server Components only surface at build time, not in dev
