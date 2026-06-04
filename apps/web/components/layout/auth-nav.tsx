import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Nav } from "./nav";
import { env } from "@/lib/env";

/**
 * `<AuthNav />` — Server Component que lee la sesión de Supabase y pasa
 * el usuario actual al `<Nav />` (client). Si Supabase no está configurado
 * (dev sin keys), renderiza el Nav sin usuario (como antes).
 */
export async function AuthNav() {
  let user: { name: string; role: "client" | "cleaner" } | null = null;

  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const meta = data.user.user_metadata ?? {};
        user = {
          name: (meta.full_name as string) ?? data.user.email?.split("@")[0] ?? "User",
          role: (meta.role as "client" | "cleaner") ?? "client",
        };
      }
    } catch {
      // Supabase unreachable — degrade silently, Nav shows unauthenticated.
    }
  }

  return <Nav initialUser={user} />;
}
