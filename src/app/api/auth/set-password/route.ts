import { NextResponse } from "next/server";
import { setPassword } from "~/lib/auth/auth-api";
import { getCustomerToken, clearCustomerToken } from "~/lib/auth/cookies";

export async function POST(request: Request) {
  const token = await getCustomerToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password;

    if (!password || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: "Password must be between 8 and 128 characters." },
        { status: 400 },
      );
    }

    await setPassword(token, password);
    return NextResponse.json({ success: true });
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401) {
      await clearCustomerToken();
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to set password. Please try again." },
      { status: 500 },
    );
  }
}
