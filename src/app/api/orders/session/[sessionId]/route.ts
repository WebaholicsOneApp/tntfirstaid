import { NextResponse } from "next/server";
import { ApiClientError, getApiClient } from "~/lib/api-client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    const order = await getApiClient().getOrderBySession<{
      orderId: number | string;
      orderNumber: string | null;
      customerEmail: string | null;
    }>(sessionId);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order by session:", error);

    if (error instanceof ApiClientError && error.status === 404) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
