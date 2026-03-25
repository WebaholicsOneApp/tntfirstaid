/**
 * Server-side helpers that call OneApp storefront auth endpoints.
 * Uses direct fetch (not StorefrontApiClient) because auth calls
 * need per-request Authorization headers for the customer JWT.
 */
import type { Customer, OrdersResponse, ShippingAddress } from '~/types/auth';

const ONEAPP_API_URL = process.env.ONEAPP_API_URL || 'http://localhost:3001';
const ONEAPP_API_KEY = process.env.ONEAPP_API_KEY || '';
const BASE = `${ONEAPP_API_URL}/api/v2/storefront/auth`;

function headers(customerToken?: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Storefront-Api-Key': ONEAPP_API_KEY,
  };
  if (customerToken) {
    h.Authorization = `Bearer ${customerToken}`;
  }
  return h;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body as Record<string, string>).error || `API error: ${res.status}`;
    const err = new Error(msg) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public auth endpoints (no customer JWT required)
// ---------------------------------------------------------------------------

export async function requestMagicLink(email: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/magic-link`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function verifyMagicLink(
  token: string,
): Promise<{ token: string; customer: Customer }> {
  const res = await fetch(`${BASE}/verify`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ token }),
  });
  return handleResponse(res);
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; customer: Customer }> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

// ---------------------------------------------------------------------------
// Authenticated customer endpoints (require customer JWT)
// ---------------------------------------------------------------------------

export async function getMe(
  customerToken: string,
): Promise<{ customer: Customer }> {
  const res = await fetch(`${BASE}/me`, {
    method: 'GET',
    headers: headers(customerToken),
  });
  return handleResponse(res);
}

export async function getOrders(
  customerToken: string,
  page = 1,
  pageSize = 10,
): Promise<OrdersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`${BASE}/orders?${params}`, {
    method: 'GET',
    headers: headers(customerToken),
  });
  return handleResponse(res);
}

export async function setPassword(
  customerToken: string,
  password: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/set-password`, {
    method: 'POST',
    headers: headers(customerToken),
    body: JSON.stringify({ password }),
  });
  return handleResponse(res);
}

export async function updateProfile(
  customerToken: string,
  data: { firstName?: string; lastName?: string; phone?: string; defaultAddress?: ShippingAddress },
): Promise<{ customer: Customer }> {
  const res = await fetch(`${BASE}/profile`, {
    method: 'PUT',
    headers: headers(customerToken),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
