import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Lee el count real de la tabla waitlist. Devuelve 0 si Supabase no está
 * configurado o hay error (degrada con gracia — nunca rompe el render).
 *
 * Usa el admin client (service-role) porque la waitlist no tiene policy
 * de SELECT para anon (los emails son privados).
 */
export async function getWaitlistCount(): Promise<number> {
  const db = createSupabaseAdminClient();
  if (!db) return 0;

  try {
    const { count, error } = await db
      .from("waitlist")
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
