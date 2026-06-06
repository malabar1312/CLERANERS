import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FavoriteResult =
  | { ok: true; favorited: boolean }
  | { ok: false; error: "unauthenticated" | "unknown" };

/** Toggle favorite — insert or delete. Returns new state. */
export async function toggleFavorite(cleanerId: string): Promise<FavoriteResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "unauthenticated" };

    // Check if already favorited.
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("client_user_id", user.id)
      .eq("cleaner_id", cleanerId)
      .maybeSingle();

    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
      return { ok: true, favorited: false };
    } else {
      await supabase.from("favorites")
        .insert({ client_user_id: user.id, cleaner_id: cleanerId });
      return { ok: true, favorited: true };
    }
  } catch {
    return { ok: false, error: "unknown" };
  }
}

/** Get all favorited cleaner IDs for the current user. */
export async function getFavoriteIds(): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("favorites")
      .select("cleaner_id")
      .eq("client_user_id", user.id);

    return (data ?? []).map((r: { cleaner_id: string }) => r.cleaner_id);
  } catch {
    return [];
  }
}
