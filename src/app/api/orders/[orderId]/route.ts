import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const id = Number(orderId);

    if (!orderId || Number.isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Valid order ID is required' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      orderId: id,
      orderNumber: null,
      customerEmail: null,
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 },
    );
  }
}
