import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CleanerDashboard } from "@/components/domain/dashboard/cleaner/overview";
import {
  CustomerDashboard,
  type LatestBooking,
} from "@/components/domain/dashboard/customer/overview";
import { getCleanerProfileById } from "@/lib/data/cleaners";

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

    // Latest booking — RLS policy "bookings_own_select" matches by user_id OR
    // email. Limited to 1, ordered by created_at desc.
    const { data: bookingRow } = await supabase
      .from("bookings")
      .select(
        "reference, cleaner_id, scheduled_date, scheduled_time, m2, hours, total_cents, status, street, city",
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (bookingRow) {
      const cleaner = await getCleanerProfileById(bookingRow.cleaner_id);
      latestBooking = {
        reference: bookingRow.reference,
        cleanerId: bookingRow.cleaner_id,
        cleanerName: cleaner?.name ?? "Je schoonmaker",
        cleanerTone: cleaner?.tone ?? 0,
        cleanerHood: cleaner?.hood ?? bookingRow.city ?? null,
        rating: cleaner?.rating ?? null,
        scheduledDate: bookingRow.scheduled_date,
        scheduledTime: bookingRow.scheduled_time,
        m2: bookingRow.m2,
        hours: bookingRow.hours,
        totalCents: bookingRow.total_cents,
        status: bookingRow.status,
        street: bookingRow.street,
      };
    }
  } catch {
    // Dev fallback when Supabase is not configured
    if (process.env.NODE_ENV === "production") {
      redirect(getPathname({ href: "/login", locale }));
    }
  }

  return (
    <div className="w-full">
      {profile.role === "cleaner" ? (
        <CleanerDashboard profile={profile} />
      ) : (
        <CustomerDashboard profile={profile} latestBooking={latestBooking} />
      )}
    </div>
  );
}
