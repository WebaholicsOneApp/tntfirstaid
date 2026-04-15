import { type NextRequest, NextResponse } from "next/server";

/**
 * Newsletter Subscribe API Route — proxies to OneApp storefront newsletter endpoint.
 */

const ONEAPP_API_URL = process.env.ONEAPP_API_URL!;
const ONEAPP_API_KEY = process.env.ONEAPP_API_KEY!;

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length >= 5 && email.length <= 254;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName } = body;

    if (!email?.trim() || !validateEmail(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${ONEAPP_API_URL}/api/v2/storefront/newsletter/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Storefront-Api-Key": ONEAPP_API_KEY,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: firstName?.trim() || undefined,
          lastName: lastName?.trim() || undefined,
        }),
      },
    );

    const text = await res.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[NEWSLETTER] Non-JSON response from OneApp:", res.status, text);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 502 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: (data.error as string) || "Failed to subscribe. Please try again." },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(
      "[NEWSLETTER] Error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 },
    );
  }
}
