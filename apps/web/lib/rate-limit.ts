/**
 * Simple in-memory rate limiter for Server Actions.
 *
 * Uses a sliding window per key. Works in Node.js runtime (Server Actions run
 * on Node, not Edge).
 *
 * ⚠️ LIMITACIÓN MULTI-INSTANCE (AUTO-CYCLE 4 doc):
 *   En Vercel multi-instance / cold-start, cada lambda tiene su propio `Map`.
 *   Un atacante puede repartir requests entre instancias y exceder el límite
 *   real. Hoy es una capa anti-abuse OPORTUNISTA, no un security boundary.
 *
 *   TODO(BLOQUE 2): reemplazar `Map` por Upstash Redis (`@upstash/ratelimit`)
 *   conservando esta misma interfaz. Tier free 10k req/día alcanza para BETA.
 *
 * Mejora aplicada en AUTO-CYCLE 4: la key incluye un hash del User-Agent
 * además del IP, encareciendo el bypass con rotación de IP (botnet usa UA
 * coherente; rotación de IPs requiere también variar UA).
 *
 * Usage:
 *   const ok = rateLimit("waitlist", getIdentifier(headers), { limit: 5, windowMs: 60_000 });
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
 * Prefers x-forwarded-for (set by Vercel/proxies), incluye un hash del UA
 * para encarecer IP rotation. Never use as security boundary — abuse mitigation.
 */
export function getIdentifier(headers: Headers): string {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown";
  const ua = headers.get("user-agent") ?? "";
  // Hash 32-bit barato del UA (no crypto, solo dispersión). Mantenemos la key
  // legible para debug: `ip:uaHash`.
  let h = 0;
  for (let i = 0; i < ua.length; i++) {
    h = ((h << 5) - h + ua.charCodeAt(i)) | 0;
  }
  return `${ip}:${(h >>> 0).toString(36)}`;
}
