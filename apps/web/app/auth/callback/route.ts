import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth callback — exchanges the Supabase PKCE `code` for a session.
 *
 * Flow: User clicks email link → Supabase verifies → redirects here with
 * `?code=xxx`. We exchange the code for a session (sets cookies) and redirect
 * to the intended destination.
 *
 * This route is NOT under `[locale]` so the next-intl middleware doesn't
 * interfere. The middleware matcher excludes `auth/` paths.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type"); // "signup" | "recovery" | "invite" | etc.

  if (!code) {
    // No code — redirect to home with error hint
    return NextResponse.redirect(`${origin}/?auth_error=missing_code`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("[auth/callback] Supabase env vars missing");
    return NextResponse.redirect(`${origin}/?auth_error=config`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(`${origin}/?auth_error=exchange_failed`);
  }

  // For signup confirmations: determine where to redirect based on role
  if (type === "signup" || next === "/") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const role = (user.user_metadata?.role as string) ?? "customer";

      if (role === "cleaner") {
        // Check if cleaner already has a profile
        const { data: cleanerProfile } = await supabase
          .from("cleaner_profiles")
          .select("slug")
          .eq("profile_id", user.id)
          .maybeSingle();

        if (!cleanerProfile) {
          return NextResponse.redirect(`${origin}/onboarding/schoonmaker`);
        }
      }
    }
  }

  // For password recovery: redirect to reset page
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/login/forgot?reset=true`);
  }

  // Default: redirect to dashboard (authenticated users land there)
  const finalDest = next === "/" ? "/dashboard" : next;
  const destination = finalDest.startsWith("/") ? `${origin}${finalDest}` : `${origin}/dashboard`;
  return NextResponse.redirect(destination);
}
