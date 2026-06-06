"use server";

import { revalidatePath } from "next/cache";
import { toggleFavorite } from "@/lib/data/favorites";
export type { FavoriteResult } from "@/lib/data/favorites";

/**
 * Server Action — toggle favorite y revalida el perfil para que el botón
 * se actualice sin reload completo.
 */
export async function toggleFavoriteAction(cleanerId: string) {
  const result = await toggleFavorite(cleanerId);
  if (result.ok) {
    revalidatePath(`/schoonmakers/${cleanerId}`);
  }
  return result;
}
