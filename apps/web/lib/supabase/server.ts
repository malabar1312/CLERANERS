import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertPublicSupabaseEnv } from "@/lib/env";

/**
 * Supabase client for **Server Components, Server Actions, and Route Handlers**.
 * Uses Next.js `cookies()` to read/write the session.
 *
 * Anon key is public by design — RLS in Postgres is the security perimeter.
 * Never import this from a Client Component.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = assertPublicSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch (err) {
          // `cookieStore.set` throws from a Server Component context — the
          // middleware refreshes the session, so this is safe to swallow.
          // In dev we still want visibility; in prod we stay silent.
          if (process.env.NODE_ENV !== "production") {
            console.warn("[supabase/server] cookie set ignored:", err);
          }
        }
      },
    },
  });
}
