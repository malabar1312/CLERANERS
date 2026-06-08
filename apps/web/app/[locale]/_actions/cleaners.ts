"use server";

import { getCleanerProfileById } from "@/lib/data/cleaners";
import type { CleanerProfile } from "@/lib/mock/cleaners";

/**
 * Server Action — perfil de cleaner por slug. Lo consume el quick-view modal
 * (client component) para hidratar datos reales o mock vía la capa híbrida.
 */
export async function getCleanerProfileAction(
  id: string,
): Promise<CleanerProfile | null> {
  return getCleanerProfileById(id);
}
