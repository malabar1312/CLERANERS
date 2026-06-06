/**
 * Simple in-memory rate limiter for Server Actions.
 *
 * Uses a sliding window per key (IP + action). Works in Node.js runtime
 * (Server Actions run on Node, not Edge). For multi-instance prod, swap
 * the Map for a Redis/Upstash store — interface stays the same.
 *
 * Usage:
 *   const ok = rateLimit("waitlist", ip, { limit: 5, windowMs: 60_000 });
 *   if (!ok) return { ok: false, error: "rate_limited" };
 */

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

/** Returns true if the request is within the limit, false if rate-limited. */
export function rateLimit(
  action: string,
  identifier: string,
  {
    limit = 10,
    windowMs = 60_000,
  }: { limit?: number; windowMs?: number } = {},
): boolean {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/**
 * Extract a best-effort identifier from request headers.
 * Prefers x-forwarded-for (set by Vercel/proxies), falls back to "unknown".
 * Never use this as a security boundary — only as abuse mitigation.
 */
export function getIdentifier(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
