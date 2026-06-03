import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Cliente Supabase con **service-role** — bypassa RLS. SOLO en el servidor
 * (webhook de Stripe, tareas admin). NUNCA importar desde un Client Component
 * ni exponer la key al bundle del navegador.
 *
 * Devuelve `null` si las env vars no están presentes (dev local sin Supabase),
 * para que los callers degraden con gracia en lugar de romper.
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
