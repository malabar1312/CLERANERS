import { headers } from "next/headers";

/**
 * Canonical site URL — resolved from env or request headers.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL (explicit, for production)
 *  2. VERCEL_PROJECT_PRODUCTION_URL (auto-set by Vercel)
 *  3. VERCEL_URL (preview deploys)
 *  4. Request host header (fallback, works in dev)
 *  5. localhost:3000
 *
 * Always returns a full URL with protocol, no trailing slash.
 * Used for Supabase `emailRedirectTo`, OG URLs, sitemaps.
 */
export function getSiteUrl(): string {
  // 1. Explicit env (best)
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  // 2. Vercel production URL
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) return `https://${vercelProd}`;

  // 3. Vercel preview URL
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  // 4. localhost fallback
  return "http://localhost:3000";
}

/**
 * Same as getSiteUrl but tries to read the request host header first.
 * Only use inside Server Actions / Route Handlers where `headers()` is available.
 */
export async function getSiteUrlFromRequest(): Promise<string> {
  try {
    const hdrs = await headers();
    const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
    const proto = hdrs.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() not available (build time, etc.)
  }
  return getSiteUrl();
}
