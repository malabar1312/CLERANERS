import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CleanerDashboard } from "@/components/domain/dashboard/cleaner/overview";
import {
  CustomerDashboard,
  type LatestBooking,
} from "@/components/domain/dashboard/customer/overview";
import type { BookingListItem } from "@/components/domain/dashboard/customer/bookings-view";
import type { CleanerAanvraag } from "@/components/domain/dashboard/cleaner/aanvragen-view";
import { getCleanerProfileById } from "@/lib/data/cleaners";

/** Regla de cancelación (>24h antes del inicio de la franja) — espejo de
 * `_actions/booking-manage.ts`, que la re-valida server-side al ejecutar. */
const CANCELLABLE_STATUSES = new Set(["pending", "paid", "accepted"]);
const SLOT_START_HOUR: Record<string, number> = { morning: 8, afternoon: 12, evening: 17 };

function isCancellable(status: string, date: string | null, slot: string | null): boolean {
  if (!CANCELLABLE_STATUSES.has(status) || !date) return false;
  const hour = SLOT_START_HOUR[slot ?? ""] ?? 8;
  const start = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
  return !Number.isNaN(start.getTime()) && start.getTime() - Date.now() > 24 * 60 * 60 * 1000;
}

/**
 * Dashboard page — routes to CleanerDashboard or CustomerDashboard
 * based on the user's profile role. Fetches the user's most recent booking
 * (RLS-scoped) and passes it down so the customer view can render real data
 * when available; falls back to BETA mock UI when there are no bookings yet.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; view?: string }>;
}) {
  const { role: urlRole } = await searchParams;
  const locale = await getLocale();

  let profile = {
    role: urlRole ?? "customer",
    first_name: "Gebruiker",
  };
  let latestBooking: LatestBooking | null = null;
  let bookings: BookingListItem[] = [];
  let aanvragen: CleanerAanvraag[] = [];

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(getPathname({ href: "/login", locale }));
    }

    // Profile (role, first_name). NOTE: `profiles` table may not exist yet in
    // BETA — query failure degrades silently to defaults. (Tracked: Bloque 2.)
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("role, first_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileRow) {
      profile = {
        role: profileRow.role ?? urlRole ?? "customer",
        first_name: profileRow.first_name ?? "Gebruiker",
      };
    }

    // Bookings del usuario — RLS "bookings_own_select" matchea por user_id O
    // email. Lista completa (cap 50) para la vista "mijn boekingen"; la
    // primera fila alimenta la card de "active booking" de la overview.
    const { data: bookingRows } = await supabase
      .from("bookings")
      .select(
        "id, reference, cleaner_id, scheduled_date, scheduled_time, m2, hours, total_cents, status, street, city",
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (bookingRows && bookingRows.length > 0) {
      // Resolver nombres de cleaner una sola vez por id único.
      const uniqueIds = [...new Set(bookingRows.map((r) => r.cleaner_id))];
      const cleanerById = new Map(
        await Promise.all(
          uniqueIds.map(async (cid) => [cid, await getCleanerProfileById(cid)] as const),
        ),
      );

      bookings = bookingRows.map((r) => ({
        id: r.id,
        reference: r.reference,
        cleanerName: cleanerById.get(r.cleaner_id)?.name ?? "Je schoonmaker",
        scheduledDate: r.scheduled_date,
        scheduledTime: r.scheduled_time,
        hours: r.hours,
        m2: r.m2,
        totalCents: r.total_cents,
        status: r.status,
        city: r.city,
        cancellable: isCancellable(r.status, r.scheduled_date, r.scheduled_time),
      }));

      const first = bookingRows[0];
      if (first) {
        const cleaner = cleanerById.get(first.cleaner_id);
        latestBooking = {
          reference: first.reference,
          cleanerId: first.cleaner_id,
          cleanerName: cleaner?.name ?? "Je schoonmaker",
          cleanerTone: cleaner?.tone ?? 0,
          cleanerHood: cleaner?.hood ?? first.city ?? null,
          rating: cleaner?.rating ?? null,
          scheduledDate: first.scheduled_date,
          scheduledTime: first.scheduled_time,
          m2: first.m2,
          hours: first.hours,
          totalCents: first.total_cents,
          status: first.status,
          street: first.street,
        };
      }
    }

    // Rama cleaner: aanvragen asignadas a SU slug. bookings no tiene policy
    // de SELECT para cleaners (llega en hardening) → admin client tras
    // resolver el slug propio vía RLS own_select. Server-only, sin fuga:
    // solo se consultan filas con cleaner_id = slug verificado.
    if (profile.role === "cleaner") {
      const { data: ownCleanerProfile } = await supabase
        .from("cleaner_profiles")
        .select("slug")
        .eq("profile_id", user.id)
        .maybeSingle();

      const adminDb = createSupabaseAdminClient();
      if (ownCleanerProfile && adminDb) {
        const { data: rows } = await adminDb
          .from("bookings")
          .select(
            "id, reference, client_name, scheduled_date, scheduled_time, m2, hours, subtotal_cents, total_cents, status, city",
          )
          .eq("cleaner_id", ownCleanerProfile.slug)
          .order("created_at", { ascending: false })
          .limit(50);

        aanvragen = (rows ?? []).map((r) => ({
          id: r.id,
          reference: r.reference,
          clientName: r.client_name ?? "Klant",
          scheduledDate: r.scheduled_date,
          scheduledTime: r.scheduled_time,
          hours: r.hours,
          m2: r.m2,
          amountCents: r.subtotal_cents ?? r.total_cents,
          status: r.status,
          city: r.city,
        }));
      }
    }
  } catch (err) {
    // Re-throw Next.js redirect/notFound errors — they use special throw signals
    if (err && typeof err === "object" && "digest" in err) throw err;
    // Dev fallback when Supabase is not configured
    if (process.env.NODE_ENV === "production") {
      redirect(getPathname({ href: "/login", locale }));
    }
  }

  return (
    <div className="w-full">
      {profile.role === "cleaner" ? (
        <CleanerDashboard profile={profile} aanvragen={aanvragen} />
      ) : (
        <CustomerDashboard
          profile={profile}
          latestBooking={latestBooking}
          bookings={bookings}
        />
      )}
    </div>
  );
}
