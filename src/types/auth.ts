export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  hasPassword: boolean;
  defaultAddress?: ShippingAddress;
  defaultBillingAddress?: ShippingAddress;
  stats?: {
    orderCount: number;
    lifetimeValueCents: number;
    firstOrderAt: string | null;
    lastOrderAt: string | null;
  };
}

export interface AuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface OrderItem {
  id: number;
  name: string;
  variation?: string;
  quantity: number;
  price: number; // cents
  image?: string;
  isDownloadable?: boolean;
  downloadUrl?: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  createdAt: string;
  total: number; // cents
  subtotal?: number;
  shipping?: number;
  tax?: number;
  items: OrderItem[];
  paymentMethod?: {
    type: string;
    brand?: string;
    last4?: string;
    label: string;
  } | null;
  tracking?: {
    carrier: string;
    trackingNumber: string;
    url?: string;
  } | null;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
