/**
 * Server-only cookie utilities for customer JWT.
 * The token is stored in an httpOnly cookie so client JS never touches the JWT.
 */
import { cookies } from "next/headers";

const COOKIE_NAME = "alpha-customer-token";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days (matches JWT expiry)

export async function getCustomerToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function setCustomerToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearCustomerToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
