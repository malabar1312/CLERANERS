"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getIdentifier } from "@/lib/rate-limit";

/**
 * Gestión de reservas del cliente (post-pago).
 *
 * Patrón de autorización: la LECTURA se hace con el cliente del usuario
 * (la RLS `bookings_own_select` demuestra la propiedad — matchea por
 * client_user_id o por email del JWT); el UPDATE se hace con service-role
 * (bookings no tiene policy de UPDATE: escribir es privilegio del servidor).
 */

/** Estados desde los que el cliente puede cancelar. */
const CANCELLABLE_STATUSES = new Set(["pending", "paid", "accepted"]);

/** Hora de inicio de cada franja — para la regla de las 24 horas. */
const SLOT_START_HOUR: Record<string, number> = {
  morning: 8,
  afternoon: 12,
  evening: 17,
};

const MS_24H = 24 * 60 * 60 * 1000;

export type CancelBookingResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "unauthenticated"
        | "not_found"
        | "not_cancellable"
        | "too_late"
        | "rate_limited"
        | "unknown";
    };

const idSchema = z.string().uuid();

/** True si el inicio programado está a más de 24h del ahora. */
function startsInMoreThan24h(date: string | null, slot: string | null): boolean {
  if (!date) return false; // sin fecha no podemos garantizar la regla → no cancelable
  const hour = SLOT_START_HOUR[slot ?? ""] ?? 8;
  const start = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
  if (Number.isNaN(start.getTime())) return false;
  return start.getTime() - Date.now() > MS_24H;
}

export async function cancelBooking(rawId: unknown): Promise<CancelBookingResult> {
  const parsed = idSchema.safeParse(rawId);
  if (!parsed.success) return { ok: false, error: "not_found" };
  const bookingId = parsed.data;

  const hdrs = await headers();
  if (!rateLimit("cancel-booking", getIdentifier(hdrs), { limit: 10, windowMs: 60_000 })) {
    return { ok: false, error: "rate_limited" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "unauthenticated" };

    // Lectura RLS-scoped: si la fila vuelve, ES del usuario.
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, scheduled_date, scheduled_time")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) return { ok: false, error: "not_found" };
    if (!CANCELLABLE_STATUSES.has(booking.status)) {
      return { ok: false, error: "not_cancellable" };
    }
    if (!startsInMoreThan24h(booking.scheduled_date, booking.scheduled_time)) {
      return { ok: false, error: "too_late" };
    }

    const admin = createSupabaseAdminClient();
    if (!admin) return { ok: false, error: "unknown" };

    // Guard de carrera: solo cancela si el status sigue siendo cancelable.
    const { data: updated, error } = await admin
      .from("bookings")
      .update({ status: "canceled" })
      .eq("id", bookingId)
      .in("status", [...CANCELLABLE_STATUSES])
      .select("id");

    if (error || !updated || updated.length === 0) {
      return { ok: false, error: error ? "unknown" : "not_cancellable" };
    }

    // TODO(sprint-6): refund automático vía Stripe cuando status era 'paid'
    // (refund revierte cargo; hoy queda como proceso manual en test mode).

    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}
