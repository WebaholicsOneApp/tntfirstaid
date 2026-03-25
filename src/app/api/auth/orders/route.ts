import { NextResponse } from 'next/server';
import { getOrders } from '~/lib/auth/auth-api';
import { getCustomerToken, clearCustomerToken } from '~/lib/auth/cookies';

export async function GET(request: Request) {
  const token = await getCustomerToken();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));

  try {
    const data = await getOrders(token, page, pageSize);
    return NextResponse.json(data);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401) {
      await clearCustomerToken();
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
