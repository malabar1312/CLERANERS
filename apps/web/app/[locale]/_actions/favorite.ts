"use server";

import { revalidatePath } from "next/cache";
import { toggleFavorite, getFavoriteIds } from "@/lib/data/favorites";
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

/**
 * Server Action — lee los IDs favoritos del usuario actual. Usado por el
 * quick-view modal (client) para hidratar el estado inicial del corazón.
 * Degrada a [] si no hay sesión (RLS-scoped).
 */
export async function getFavoriteIdsAction(): Promise<string[]> {
  return getFavoriteIds();
}
