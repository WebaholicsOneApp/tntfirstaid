'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Customer } from '~/types/auth';

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  customerAuthEnabled: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  initialCustomer: Customer | null;
  customerAuthEnabled: boolean;
}

export function AuthProvider({
  children,
  initialCustomer,
  customerAuthEnabled,
}: AuthProviderProps) {
  const [customer, setCustomer] = useState<Customer | null>(initialCustomer);
  // Start loading if auth is enabled but server didn't provide initial customer
  // (client-side hydration via /api/auth/me will resolve it)
  const [isLoading, setIsLoading] = useState(customerAuthEnabled && !initialCustomer);
  const didHydrate = useRef(false);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Best-effort — cookie gets cleared server-side
    }
    setCustomer(null);
    setIsLoading(false);
    window.location.href = '/account';
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = (await res.json()) as { customer: Customer | null };
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    }
    setIsLoading(false);
  }, []);

  // Client-side auth hydration: when the server skips getMe() to avoid
  // blocking the layout, hydrate auth state on mount via the API route.
  useEffect(() => {
    if (customerAuthEnabled && !initialCustomer && !didHydrate.current) {
      didHydrate.current = true;
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        customerAuthEnabled,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
