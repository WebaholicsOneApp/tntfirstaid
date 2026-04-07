import { NextResponse } from "next/server";
import { requestMagicLink } from "~/lib/auth/auth-api";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "~/lib/ratelimit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, "strict");
  if (!rl.success) return rateLimitResponse(rl);

  let body: { email?: string; redirect?: string };
  try {
    body = (await request.json()) as { email?: string; redirect?: string };
  } catch {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await requestMagicLink(email, body.redirect);
  } catch {
    // Swallow errors — always return generic success to prevent email enumeration
  }

  return NextResponse.json({
    success: true,
    message: "If an account exists, a sign-in link has been sent.",
  });
}
