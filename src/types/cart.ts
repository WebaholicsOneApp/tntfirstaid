/**
 * Cart Types for Alpha Munitions Storefront
 */

export interface CartItem {
  id: number; // variation ID
  productId: number;
  productSlug: string;
  name: string;
  variation?: string | null;
  manufacturerNo?: string | null;
  price: number; // in cents
  quantity: number;
  image?: string | null;
  maxQuantity?: number; // available stock
}

export interface Cart {
  items: CartItem[];
  subtotal: number; // in cents
  itemCount: number;
}

export interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variationId: number) => void;
  updateQuantity: (variationId: number, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export interface CheckoutItem {
  variationId: number;
  productId: number;
  name: string;
  variation?: string | null;
  price: number;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export interface OrderItem {
  variationId: number;
  productId: number;
  name: string;
  variation?: string | null;
  manufacturerNo?: string | null;
  price: number;
  quantity: number;
  image?: string | null;
}

export interface Order {
  id: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customerEmail: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  paidAt?: string;
}
