import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

/**
 * Composed middleware:
 *  1. next-intl handles locale negotiation and returns the response with the
 *     correct locale routing applied.
 *  2. Supabase session refresh runs over that response, preserving headers.
 *
 * If env vars for Supabase aren't set, `updateSession` is a no-op and just
 * returns the intl response unchanged.
 */
export default async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  return updateSession(request, intlResponse);
}

export const config = {
  /**
   * Match everything except:
   *  - `api/` and `trpc/` (server routes — handle their own auth)
   *  - `auth/` (Supabase callback/confirm routes — no locale negotiation)
   *  - `_next/` and `_vercel/` (Next/Vercel internals)
   *  - Files with an extension (assets like /sitemap.xml, /robots.txt, /og-image.png).
   *    We DO still want middleware on the locale-prefixed asset paths but the
   *    static asset pipeline serves these directly without a middleware roundtrip.
   */
  matcher: ["/((?!api|auth|trpc|_next|_vercel|.*\\..*).*)"],
};
