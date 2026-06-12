"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getIdentifier } from "@/lib/rate-limit";

// ─── Zod schema ──────────────────────────────────────────────────────────────
const createCleanerProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  hood: z.string().min(1),
  pricePerHour: z.coerce.number().min(15).max(80),
  bio: z.string().trim().min(20).max(1000),
  specialties: z.array(z.string()).min(1).max(8),
  languages: z.array(z.string()).min(1).max(6),
});

export type CleanerProfileResult =
  | { ok: true; slug: string }
  | { ok: false; error: "unauthenticated" | "not_cleaner" | "already_exists" | "invalid_input" | "rate_limited" | "unknown" };

/**
 * Generate a URL-friendly slug from a name.
 * "Eva de Vries" → "eva-de-vries"
 * Handles accents, special chars, deduplication.
 */
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric
    .replace(/\s+/g, "-")           // spaces → hyphens
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .replace(/^-|-$/g, "");         // trim leading/trailing hyphens
}

/**
 * Server Action — Create a cleaner's public profile.
 *
 * Pre-conditions:
 * - User is authenticated
 * - User has role=cleaner in profiles
 * - User does NOT already have a cleaner_profiles row
 *
 * Generates slug from name, deduplicates with suffix if taken.
 * Writes to cleaner_profiles (RLS: own_insert checks auth.uid() = profile_id).
 */
export async function createCleanerProfileAction(
  formData: FormData,
): Promise<CleanerProfileResult> {
  // Rate limit: 5 per 10 minutes
  const hdrs = await headers();
  if (!rateLimit("cleaner_profile", getIdentifier(hdrs), { limit: 5, windowMs: 600_000 })) {
    return { ok: false, error: "rate_limited" };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  // Verify role=cleaner
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "cleaner") {
    return { ok: false, error: "not_cleaner" };
  }

  // Check if already has a cleaner_profiles row.
  // Admin client: los borradores (visible=false) son invisibles para la RLS
  // pública — sin esto el re-submit pasaría el check y moriría en el 23505.
  const adminDb = createSupabaseAdminClient();
  const readDb = adminDb ?? supabase;
  const { data: existing } = await readDb
    .from("cleaner_profiles")
    .select("slug")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "already_exists" };
  }

  // Parse + validate input
  const specialtiesRaw = formData.getAll("specialties").map(String);
  const languagesRaw = formData.getAll("languages").map(String);

  const parsed = createCleanerProfileSchema.safeParse({
    name: formData.get("name"),
    hood: formData.get("hood"),
    pricePerHour: formData.get("pricePerHour"),
    bio: formData.get("bio"),
    specialties: specialtiesRaw,
    languages: languagesRaw,
  });

  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const { name, hood, pricePerHour, bio, specialties, languages } = parsed.data;

  // Generate unique slug
  let baseSlug = slugify(name);
  if (!baseSlug) baseSlug = `cleaner-${user.id.slice(0, 8)}`;

  let slug = baseSlug;
  let attempt = 0;

  // Deduplicate slug (check for existing slugs — admin client: también debe
  // chocar contra slugs de perfiles invisibles).
  while (attempt < 10) {
    const { data: slugCheck } = await readDb
      .from("cleaner_profiles")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (!slugCheck) break; // slug is available

    attempt++;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  if (attempt >= 10) {
    // Fallback: append random suffix
    slug = `${baseSlug}-${user.id.slice(0, 6)}`;
  }

  // Insert into cleaner_profiles.
  // visible=false SIEMPRE en el alta: el catálogo público auto-switchea de
  // mock a real con la PRIMERA fila visible (lib/data/cleaners.ts) — activar
  // un perfil es decisión manual de admin (Antonio), no del signup.
  const { error: insertError } = await supabase.from("cleaner_profiles").insert({
    profile_id: user.id,
    slug,
    name,
    hood,
    price_per_hour: pricePerHour,
    bio,
    specialties,
    languages,
    tone: Math.floor(Math.random() * 6), // random avatar gradient
    since: new Date().getFullYear(),
    online: true,
    visible: false,
    accepts_bookings: true,
  });

  if (insertError) {
    console.error("[createCleanerProfile] insert error:", insertError);
    if (insertError.code === "23505") {
      return { ok: false, error: "already_exists" };
    }
    return { ok: false, error: "unknown" };
  }

  // Revalidate pages that show cleaners
  revalidatePath("/schoonmakers", "page");
  revalidatePath("/", "page");

  return { ok: true, slug };
}
