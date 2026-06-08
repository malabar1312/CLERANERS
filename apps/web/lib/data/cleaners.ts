import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  featuredCleaners,
  getCleanerProfile as getMockProfile,
  cleanerIds as mockIds,
  type CleanerPreview,
  type CleanerProfile,
} from "@/lib/mock/cleaners";

/**
 * Capa de datos híbrida de cleaners (MOCK ↔ REAL).
 *
 * Auto-detect: si `cleaner_profiles` tiene ≥1 fila visible, esa es la fuente
 * de verdad; si está vacía (o Supabase no configurado), cae al mock. Así la
 * demo actual (12 mock con foto) se mantiene intacta hasta que entre el primer
 * cleaner real — entonces la UI cambia SOLA sin tocar componentes.
 *
 * server-only: usa el admin client (sin cookies → válido en build/SSG y en
 * request). El filtro `visible=true` se aplica explícito.
 */

type Row = {
  slug: string;
  name: string;
  hood: string | null;
  price_per_hour: number;
  bio: string | null;
  languages: string[] | null;
  specialties: string[] | null;
  image: string | null;
  tone: number;
  rating: number;
  reviews_count: number;
  response_mins: number;
  since: number | null;
  online: boolean;
  verified: boolean;
};

const PREVIEW_COLS =
  "slug, name, hood, price_per_hour, specialties, image, tone, rating, reviews_count, verified, online";
const PROFILE_COLS = `${PREVIEW_COLS}, bio, languages, response_mins, since`;

function rowToPreview(r: Row): CleanerPreview {
  return {
    id: r.slug,
    name: r.name,
    hood: r.hood ?? "Amsterdam",
    rating: Number(r.rating),
    reviews: r.reviews_count,
    pricePerHour: Number(r.price_per_hour),
    verified: r.verified,
    online: r.online,
    tone: r.tone,
    specialties: r.specialties ?? [],
    image: r.image ?? undefined,
  };
}

function rowToProfile(r: Row): CleanerProfile {
  return {
    ...rowToPreview(r),
    bio: r.bio ?? "Geverifieerde schoonmaker op het cleaners-platform.",
    languages: r.languages ?? ["Nederlands", "Engels"],
    since: r.since ?? new Date().getFullYear(),
    responseMins: r.response_mins,
  };
}

/** Catálogo público. Reales si existen; mock si no. */
export async function getCleaners(): Promise<CleanerPreview[]> {
  const db = createSupabaseAdminClient();
  if (db) {
    const { data } = await db
      .from("cleaner_profiles")
      .select(PREVIEW_COLS)
      .eq("visible", true)
      .order("rating", { ascending: false });
    if (data && data.length > 0) return (data as Row[]).map(rowToPreview);
  }
  return featuredCleaners;
}

/** Perfil completo por slug. Real si existe; mock como fallback. */
export async function getCleanerProfileById(
  id: string,
): Promise<CleanerProfile | null> {
  const db = createSupabaseAdminClient();
  if (db) {
    const { data } = await db
      .from("cleaner_profiles")
      .select(PROFILE_COLS)
      .eq("slug", id)
      .eq("visible", true)
      .maybeSingle();
    if (data) return rowToProfile(data as Row);
  }
  return getMockProfile(id) ?? null;
}

/** IDs (slugs) para generateStaticParams. Reales si existen; mock si no. */
export async function getCleanerIds(): Promise<string[]> {
  const db = createSupabaseAdminClient();
  if (db) {
    const { data } = await db
      .from("cleaner_profiles")
      .select("slug")
      .eq("visible", true);
    if (data && data.length > 0) return data.map((r: { slug: string }) => r.slug);
  }
  return mockIds();
}
