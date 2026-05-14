/**
 * Demo-fallback observability.
 *
 * The data layer can fall back to bundled DEMO_* fixtures when the OneApp API
 * is unreachable or returns nothing. Without supervision this silently masks
 * production outages — customers see fake products, the merchant has no idea.
 *
 * This module provides:
 *   - isDemoFallbackAllowed()   — gate the fallback paths
 *   - recordDemoFallback(src)   — log + track every time fallback fires
 *   - getDemoFallbackStatus()   — surfaced by /api/health
 *
 * Default policy:
 *   - Production: fallback OFF unless ALLOW_DEMO_FALLBACK is truthy.
 *   - Development/test: fallback ON unless ALLOW_DEMO_FALLBACK is explicitly "0" / "false".
 */

const TRUTHY = new Set(["1", "true", "yes", "on"]);
const FALSY = new Set(["0", "false", "no", "off", ""]);

function parseFlag(raw: string | undefined): boolean | null {
  if (raw == null) return null;
  const norm = raw.trim().toLowerCase();
  if (TRUTHY.has(norm)) return true;
  if (FALSY.has(norm)) return false;
  return null;
}

export function isDemoFallbackAllowed(): boolean {
  const explicit = parseFlag(process.env.ALLOW_DEMO_FALLBACK);
  if (explicit !== null) return explicit;
  return process.env.NODE_ENV !== "production";
}

interface DemoFallbackEvent {
  source: string;
  at: number;
  detail?: string;
}

const MAX_EVENTS = 20;
const events: DemoFallbackEvent[] = [];
let totalCount = 0;

export function recordDemoFallback(source: string, detail?: string): void {
  totalCount++;
  events.unshift({ source, at: Date.now(), detail });
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  const tag = isDemoFallbackAllowed() ? "served" : "blocked";
  console.error(
    `[demo-fallback] ${tag} (${source})${detail ? ` — ${detail}` : ""}`,
  );
}

export interface DemoFallbackStatus {
  allowed: boolean;
  totalCount: number;
  lastFiredAt: number | null;
  recent: DemoFallbackEvent[];
  degraded: boolean;
}

const DEGRADED_WINDOW_MS = 5 * 60 * 1000;

export function getDemoFallbackStatus(): DemoFallbackStatus {
  const lastFiredAt = events[0]?.at ?? null;
  const degraded =
    lastFiredAt !== null && Date.now() - lastFiredAt < DEGRADED_WINDOW_MS;
  return {
    allowed: isDemoFallbackAllowed(),
    totalCount,
    lastFiredAt,
    recent: events.slice(0, 5),
    degraded,
  };
}
