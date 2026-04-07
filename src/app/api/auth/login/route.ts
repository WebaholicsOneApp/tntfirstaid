import { NextResponse } from "next/server";
import { login } from "~/lib/auth/auth-api";
import { COOKIE_NAME } from "~/lib/auth/cookies";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";

const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, "checkout"); // 10/min
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const data = await login(email, password);

    // Set httpOnly cookie directly on the response object
    const response = NextResponse.json({ customer: data.customer });
    response.cookies.set(COOKIE_NAME, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

    return response;
  } catch {
    // Generic error to prevent enumeration
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }
}
