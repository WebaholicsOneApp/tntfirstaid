'use client';
import { createContext, useContext, useState } from 'react';

interface NavigationLoadingContextType {
  isNavigating: boolean;
  setIsNavigating: (val: boolean) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
  isNavigating: false,
  setIsNavigating: () => {},
});

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  return (
    <NavigationLoadingContext.Provider value={{ isNavigating, setIsNavigating }}>
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}
