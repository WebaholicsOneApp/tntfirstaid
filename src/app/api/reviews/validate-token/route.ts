/**
 * Validate Review Token API
 * Proxies to OneApp for token validation
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface TokenResponse {
  valid: boolean;
  customerEmail?: string;
  customerName?: string;
  orderId?: number;
  products?: Array<{
    productId: number;
    productName: string;
    variationName: string | null;
    imageUrl: string | null;
    alreadyReviewed: boolean;
  }>;
  allReviewed?: boolean;
  error?: string;
}

function getOneAppApiUrl(): string {
  return process.env.ONEAPP_API_URL || "http://localhost:3001";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json<TokenResponse>({
        valid: false,
        error: "No token provided",
      });
    }

    const oneAppUrl = getOneAppApiUrl();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(
        `${oneAppUrl}/api/v1/reviews/validate-token?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        },
      );

      clearTimeout(timeout);

      if (!response.ok) {
        console.error(
          `[Validate Token] OneApp returned status ${response.status}`,
        );
        return NextResponse.json<TokenResponse>({
          valid: false,
          error: "Failed to validate token. Please try again.",
        });
      }

      const data = await response.json();
      return NextResponse.json<TokenResponse>(data);
    } catch (fetchError: unknown) {
      clearTimeout(timeout);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[Validate Token] OneApp request timed out");
      } else {
        console.error(
          "[Validate Token] OneApp fetch error:",
          fetchError instanceof Error ? fetchError.message : fetchError,
        );
      }
      return NextResponse.json<TokenResponse>({
        valid: false,
        error: "Failed to validate token. Please try again.",
      });
    }
  } catch (error) {
    console.error("[Validate Token] Error:", error);
    return NextResponse.json<TokenResponse>({
      valid: false,
      error: "Failed to validate token. Please try again.",
    });
  }
}
