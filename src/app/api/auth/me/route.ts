import { NextResponse } from 'next/server';
import { getMe } from '~/lib/auth/auth-api';
import { getCustomerToken, clearCustomerToken } from '~/lib/auth/cookies';

export async function GET() {
  const token = await getCustomerToken();
  if (!token) {
    return NextResponse.json({ customer: null });
  }

  try {
    const data = await getMe(token);
    return NextResponse.json(data);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401) {
      await clearCustomerToken();
    }
    return NextResponse.json({ customer: null });
  }
}
