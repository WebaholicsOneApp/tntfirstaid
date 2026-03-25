import { NextResponse } from 'next/server';
import { verifyMagicLink } from '~/lib/auth/auth-api';
import { setCustomerToken } from '~/lib/auth/cookies';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const data = await verifyMagicLink(token);

    // Set httpOnly cookie with the customer JWT
    await setCustomerToken(data.token);

    return NextResponse.json({ customer: data.customer });
  } catch (err) {
    const upstream = (err as { status?: number }).status || 400;
    // Map upstream errors to client-appropriate status: 410 = expired, else 400
    const status = upstream === 410 ? 410 : 400;
    const message =
      status === 410
        ? 'This sign-in link has expired. Please request a new one.'
        : 'This sign-in link is invalid or has already been used.';
    return NextResponse.json({ error: message }, { status });
  }
}
