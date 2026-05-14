import { NextResponse } from "next/server";
import { getDemoFallbackStatus } from "~/lib/demo-fallback";

export const dynamic = "force-dynamic";

export async function GET() {
  const fallback = getDemoFallbackStatus();
  const status = fallback.degraded ? "degraded" : "ok";
  const httpStatus = fallback.degraded ? 503 : 200;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      catalog: {
        degraded: fallback.degraded,
        demoFallbackAllowed: fallback.allowed,
        demoFallbackTotalCount: fallback.totalCount,
        demoFallbackLastFiredAt: fallback.lastFiredAt
          ? new Date(fallback.lastFiredAt).toISOString()
          : null,
        recentEvents: fallback.recent.map((e) => ({
          source: e.source,
          at: new Date(e.at).toISOString(),
          detail: e.detail,
        })),
      },
    },
    {
      status: httpStatus,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
