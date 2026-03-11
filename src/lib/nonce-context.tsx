'use client';

/**
 * CSP Nonce Context
 * Provides the CSP nonce to client components for inline scripts
 */
import { createContext, useContext, type ReactNode } from 'react';

const NonceContext = createContext<string | undefined>(undefined);

interface NonceProviderProps {
  nonce: string | undefined;
  children: ReactNode;
}

/**
 * Provider component that passes the CSP nonce to children
 * Use this in your root layout to make nonce available throughout the app
 */
export function NonceProvider({ nonce, children }: NonceProviderProps) {
  return (
    <NonceContext.Provider value={nonce}>
      {children}
    </NonceContext.Provider>
  );
}

/**
 * Hook to access the CSP nonce in client components
 *
 * @returns The nonce string or undefined if not set
 *
 * @example
 * ```tsx
 * 'use client';
 * import { useNonce } from '~/lib/nonce-context';
 *
 * function MyComponent() {
 *   const nonce = useNonce();
 *   return <script nonce={nonce}>...</script>;
 * }
 * ```
 */
export function useNonce(): string | undefined {
  return useContext(NonceContext);
}
