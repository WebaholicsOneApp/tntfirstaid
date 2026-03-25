import { NextResponse } from 'next/server';
import { login } from '~/lib/auth/auth-api';
import { setCustomerToken } from '~/lib/auth/cookies';
import { checkRateLimit, getClientIp, rateLimitResponse } from '~/lib/ratelimit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, 'checkout'); // 10/min
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const data = await login(email, password);

    // Set httpOnly cookie with the customer JWT
    await setCustomerToken(data.token);

    return NextResponse.json({ customer: data.customer });
  } catch {
    // Generic error to prevent enumeration
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 },
    );
  }
}
