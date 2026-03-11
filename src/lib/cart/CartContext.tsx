'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, useState, type ReactNode } from 'react';
import type { Cart, CartItem, CartContextType } from '~/types/cart';

const CART_STORAGE_KEY = 'alpha-munitions-cart';

// Initial empty cart state
const initialCart: Cart = {
  items: [],
  subtotal: 0,
  itemCount: 0,
};

// Cart actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: Omit<CartItem, 'quantity'>; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { variationId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { variationId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart };

// Calculate cart totals
function calculateTotals(items: CartItem[]): Pick<Cart, 'subtotal' | 'itemCount'> {
  return items.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + item.price * item.quantity,
      itemCount: acc.itemCount + item.quantity,
    }),
    { subtotal: 0, itemCount: 0 }
  );
}

// Cart reducer
function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const existingIndex = state.items.findIndex((i) => i.id === item.id);

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((i, index) =>
          index === existingIndex
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxQuantity || 99) }
            : i
        );
      } else {
        // Add new item
        newItems = [...state.items, { ...item, quantity }];
      }

      return { items: newItems, ...calculateTotals(newItems) };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((i) => i.id !== action.payload.variationId);
      return { items: newItems, ...calculateTotals(newItems) };
    }

    case 'UPDATE_QUANTITY': {
      const { variationId, quantity } = action.payload;
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.id !== variationId);
        return { items: newItems, ...calculateTotals(newItems) };
      }
      const newItems = state.items.map((i) =>
        i.id === variationId
          ? { ...i, quantity: Math.min(quantity, i.maxQuantity || 99) }
          : i
      );
      return { items: newItems, ...calculateTotals(newItems) };
    }

    case 'CLEAR_CART':
      return initialCart;

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.items)) {
          dispatch({ type: 'LOAD_CART', payload: parsed });
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [cart, isHydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
    setIsOpen(true); // Open cart drawer when item is added
  }, []);

  const removeItem = useCallback((variationId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { variationId } });
  }, []);

  const updateQuantity = useCallback((variationId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { variationId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        cart: isHydrated ? cart : initialCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
