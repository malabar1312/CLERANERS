import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on every request and forwards the
 * updated cookies. The returned `NextResponse` carries the refreshed session
 * cookies and any prior headers attached upstream (e.g. by next-intl).
 *
 * Use from the root `middleware.ts` composed alongside locale negotiation.
 */
export async function updateSession(request: NextRequest, response = NextResponse.next({ request })) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Mutate cookies on the *current* request and response. We keep the
        // same `response` instance the caller passed in so any headers it
        // set upstream (locale routing, csp nonces, …) survive.
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Touch the user to trigger a session refresh; swallow network errors so
  // a transient Supabase outage doesn't 500 every page.
  try {
    await supabase.auth.getUser();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[supabase/middleware] getUser failed:", err);
    }
  }

  return response;
}
