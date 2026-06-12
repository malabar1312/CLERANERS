"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getIdentifier } from "@/lib/rate-limit";

/**
 * Aanvragen del cleaner: aceptar / rechazar una reserva pagada.
 *
 * Autorización en dos pasos (bookings no tiene policy de SELECT para
 * cleaners — se añadirá en el sprint de hardening; mientras, el servidor
 * demuestra la propiedad explícitamente):
 *  1. El user client lee cleaner_profiles → slug propio (RLS own_select).
 *  2. El admin client lee la booking y exige booking.cleaner_id === slug.
 *
 * Transición de estado: solo paid → accepted | rejected. El UPDATE repite
 * el filtro de status (guard de carrera: dos clicks o cancelación del
 * cliente en paralelo no pisan estados).
 */

export type RespondToBookingResult =
  | { ok: true; status: "accepted" | "rejected" }
  | {
      ok: false;
      error:
        | "unauthenticated"
        | "not_cleaner"
        | "not_found"
        | "not_actionable"
        | "rate_limited"
        | "unknown";
    };

const inputSchema = z.object({
  bookingId: z.string().uuid(),
  decision: z.enum(["accept", "reject"]),
});

export async function respondToBooking(
  rawBookingId: unknown,
  rawDecision: unknown,
): Promise<RespondToBookingResult> {
  const parsed = inputSchema.safeParse({ bookingId: rawBookingId, decision: rawDecision });
  if (!parsed.success) return { ok: false, error: "not_found" };
  const { bookingId, decision } = parsed.data;

  const hdrs = await headers();
  if (!rateLimit("respond-booking", getIdentifier(hdrs), { limit: 20, windowMs: 60_000 })) {
    return { ok: false, error: "rate_limited" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "unauthenticated" };

    // Slug propio vía RLS own_select (el cleaner ve su fila aunque sea draft).
    const { data: cleanerProfile } = await supabase
      .from("cleaner_profiles")
      .select("slug")
      .eq("profile_id", user.id)
      .maybeSingle();
    if (!cleanerProfile) return { ok: false, error: "not_cleaner" };

    const admin = createSupabaseAdminClient();
    if (!admin) return { ok: false, error: "unknown" };

    const { data: booking } = await admin
      .from("bookings")
      .select("id, cleaner_id, status")
      .eq("id", bookingId)
      .maybeSingle();

    // No revelar existencia de bookings ajenas: mismo error que inexistente.
    if (!booking || booking.cleaner_id !== cleanerProfile.slug) {
      return { ok: false, error: "not_found" };
    }
    if (booking.status !== "paid") {
      return { ok: false, error: "not_actionable" };
    }

    const newStatus = decision === "accept" ? ("accepted" as const) : ("rejected" as const);
    const { data: updated, error } = await admin
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId)
      .eq("status", "paid")
      .select("id");

    if (error || !updated || updated.length === 0) {
      return { ok: false, error: error ? "unknown" : "not_actionable" };
    }

    // TODO(sprint-9): si rejected → refund Stripe + email al cliente.

    revalidatePath("/dashboard");
    return { ok: true, status: newStatus };
  } catch {
    return { ok: false, error: "unknown" };
  }
}
