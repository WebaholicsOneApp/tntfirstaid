import { NextResponse } from 'next/server';
import { updateProfile } from '~/lib/auth/auth-api';
import { getCustomerToken, clearCustomerToken } from '~/lib/auth/cookies';

export async function PUT(request: Request) {
  const token = await getCustomerToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // Allowlist fields to prevent forwarding arbitrary data to OneApp
    const { firstName, lastName, phone, defaultAddress } = body as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    if (firstName !== undefined) sanitized.firstName = firstName;
    if (lastName !== undefined) sanitized.lastName = lastName;
    if (phone !== undefined) sanitized.phone = phone;
    if (defaultAddress !== undefined) sanitized.defaultAddress = defaultAddress;
    const result = await updateProfile(token, sanitized);
    return NextResponse.json(result);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401) {
      await clearCustomerToken();
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 },
    );
  }
}
