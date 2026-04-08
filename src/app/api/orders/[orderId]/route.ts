import { NextResponse } from "next/server";
import { getApiClient } from "~/lib/api-client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const id = Number(orderId);

    if (!orderId || Number.isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "Valid order ID is required" },
        { status: 400 },
      );
    }

    const data = await getApiClient().get(`/orders/${id}`);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error fetching order by ID:", error);
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status: number }).status
        : 500;
    return NextResponse.json({ error: "Failed to fetch order" }, { status });
  }
}
