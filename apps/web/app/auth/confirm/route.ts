import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Email confirmation via token_hash — fallback for non-PKCE flows.
 *
 * Some Supabase email templates use a direct `token_hash` + `type` instead
 * of the PKCE code flow. This route handles that case.
 *
 * Link format: /auth/confirm?token_hash=xxx&type=signup&next=/
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "signup"
    | "email"
    | "recovery"
    | "invite"
    | "email_change"
    | null;
  const next = searchParams.get("next") ?? "/";

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/?auth_error=missing_token`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("[auth/confirm] Supabase env vars missing");
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

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.error("[auth/confirm] verifyOtp error:", error.message);
    return NextResponse.redirect(`${origin}/?auth_error=verification_failed`);
  }

  // Same role-based redirect logic as callback
  if (type === "signup") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const role = (user.user_metadata?.role as string) ?? "customer";
      if (role === "cleaner") {
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

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/login/forgot?reset=true`);
  }

  const destination = next.startsWith("/") ? `${origin}${next}` : `${origin}/`;
  return NextResponse.redirect(destination);
}
