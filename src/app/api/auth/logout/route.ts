import { NextResponse } from 'next/server';
import { clearCustomerToken } from '~/lib/auth/cookies';

export async function POST() {
  await clearCustomerToken();
  return NextResponse.json({ success: true });
}
