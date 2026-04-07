/**
 * Shared helper that reads the auth cookie server-side and returns
 * the customer profile or null. Never throws — checkout must always
 * work for guests.
 */
import { getCustomerToken } from "~/lib/auth/cookies";
import { getMe } from "~/lib/auth/auth-api";
import type { Customer } from "~/types/auth";

export async function getCheckoutCustomer(): Promise<Customer | null> {
  try {
    const token = await getCustomerToken();
    if (!token) return null;
    const { customer } = await getMe(token);
    return customer;
  } catch {
    return null;
  }
}
