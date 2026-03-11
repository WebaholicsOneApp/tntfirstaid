/**
 * Server-side utility to get CSP nonce from request headers
 * Use this in Server Components to get the nonce for inline scripts
 */
import { headers } from 'next/headers';

const CSP_NONCE_HEADER = 'x-csp-nonce';

/**
 * Gets the CSP nonce from the request headers
 * This function must be called from a Server Component
 *
 * @returns The nonce string or undefined if not set
 *
 * @example
 * ```tsx
 * // In a Server Component (e.g., layout.tsx or page.tsx)
 * import { getNonce } from '~/lib/get-nonce';
 *
 * export default async function Layout({ children }) {
 *   const nonce = await getNonce();
 *   return (
 *     <html>
 *       <body>
 *         <script nonce={nonce}>console.log('safe!');</script>
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export async function getNonce(): Promise<string | undefined> {
  const headersList = await headers();
  return headersList.get(CSP_NONCE_HEADER) ?? undefined;
}
