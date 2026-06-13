"use client";

import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Star,
  Calendar,
  CreditCard,
  Sparkles,
  ChevronRight,
  MapPin,
  Clock,
  Check,
  ArrowRight,
} from "lucide-react";
import { formatEur } from "@/lib/booking/pricing";
import { BookingsView, type BookingListItem } from "./bookings-view";

/**
 * Shape of the customer's most recent booking — read in `dashboard/page.tsx`
 * via RLS and passed down. NULL means BETA fallback (mock UI). When real,
 * the active-booking card replaces hardcoded "Maria S." with actual data.
 */
export type LatestBooking = {
  reference: string;
  cleanerId: string;
  cleanerName: string;
  cleanerTone: number;
  cleanerHood: string | null;
  rating: number | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  m2: number | null;
  hours: number | null;
  totalCents: number | null;
  status: string;
  street: string | null;
};

/** KPIs del cliente, derivados server-side de SUS reservas reales. */
export type CustomerStats = {
  completedCount: number;
  spentMonthCents: number;
  spentYearCents: number;
};

const ACTIVE_BOOKING_STATUSES = new Set(["pending", "paid", "accepted", "in_progress"]);

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export function CustomerDashboard({
  profile,
  latestBooking = null,
  bookings = [],
  stats = { completedCount: 0, spentMonthCents: 0, spentYearCents: 0 },
}: {
  profile: { first_name: string; role?: string };
  latestBooking?: LatestBooking | null;
  bookings?: BookingListItem[];
  stats?: CustomerStats;
}) {
  const t = useTranslations("dashboard.customer");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "overview";

  const navigateTo = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`${pathname}?${params.toString()}`);
  };

  const slotLabel = (slot: string | null) =>
    slot === "morning" || slot === "afternoon" || slot === "evening"
      ? t(`slots.${slot}`)
      : "—";
  const formatDay = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime())
      ? null
      : d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  };

  // ¿Hay una reserva activa? Si no, el cliente es nuevo → estados vacíos.
  const hasActiveBooking =
    latestBooking != null && ACTIVE_BOOKING_STATUSES.has(latestBooking.status);
  const nextDay = hasActiveBooking ? formatDay(latestBooking!.scheduledDate) : null;
  // Pagos reales: reservas con cobro efectivo (no pending/canceled).
  const paidBookings = bookings.filter((b) =>
    ["paid", "accepted", "in_progress", "completed", "reviewed"].includes(b.status),
  );

  const renderOverview = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      key="overview"
      className="w-full"
    >
      {/* Header */}
      <motion.section variants={fadeUp} className="mb-8 sm:mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-2 font-display text-2xl font-bold leading-tight tracking-tight text-[var(--color-ink)] sm:text-3xl">
              {t("greeting", { name: profile.first_name })}
            </h2>
            <p className="text-sm text-[var(--color-slate)] sm:text-base">
              {hasActiveBooking ? t("homeInGoodHands") : t("welcomeSubtitle")}
            </p>
          </div>
          <button className="group flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-4 py-2 shadow-[var(--shadow-xs)] transition-all hover:border-[var(--color-blue)]/30 hover:shadow-[var(--shadow-soft)]">
            <Sparkles className="h-4 w-4 text-[var(--color-blue)]" />
            <span className="text-xs font-semibold tracking-wide text-[var(--color-ink)]">
              {t("premiumSupport")}
            </span>
          </button>
        </div>
      </motion.section>

      {/* KPI Cards */}
      <motion.section
        variants={fadeUp}
        className="mb-8 grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4"
      >
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)] hover:shadow-[var(--shadow-ambient)] sm:p-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-blue)]/5 blur-3xl transition-all group-hover:bg-[var(--color-blue)]/10" />
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("nextCleaning")}
          </p>
          {nextDay ? (
            <>
              <h3 className="font-display text-xl font-bold capitalize leading-none text-[var(--color-ink)] sm:text-2xl">
                {nextDay}
              </h3>
              <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
                {slotLabel(latestBooking!.scheduledTime)}
              </p>
            </>
          ) : (
            <>
              <h3 className="font-display text-xl font-bold leading-none text-[var(--color-muted)] sm:text-2xl">
                —
              </h3>
              <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
                {t("noUpcoming")}
              </p>
            </>
          )}
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-ambient)] sm:p-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("yourProfessional")}
          </p>
          {hasActiveBooking && latestBooking ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-bold text-[var(--color-ink)]">
                  {latestBooking.cleanerName.charAt(0)}
                </div>
                <h3 className="font-display text-lg font-bold leading-none text-[var(--color-ink)] sm:text-xl">
                  {latestBooking.cleanerName}
                </h3>
              </div>
              {latestBooking.rating != null && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-slate)] sm:mt-2">
                  <Star className="h-3 w-3 fill-[#F5A623] text-[#F5A623]" />
                  {latestBooking.rating.toFixed(1)}
                </p>
              )}
            </>
          ) : (
            <>
              <h3 className="font-display text-lg font-bold leading-none text-[var(--color-muted)] sm:text-xl">
                —
              </h3>
              <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
                {t("noProfessionalYet")}
              </p>
            </>
          )}
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-ambient)] sm:p-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("completedServices")}
          </p>
          <h3 className="font-display text-2xl font-bold leading-none text-[var(--color-ink)] sm:text-3xl">
            {stats.completedCount}
          </h3>
          <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
            {t("thisYear")}
          </p>
        </div>

        <button
          onClick={() => navigateTo("payments")}
          className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 text-left shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)] hover:shadow-[var(--shadow-ambient)] sm:p-6"
        >
          <div className="absolute right-3 top-3 text-[var(--color-slate)] opacity-0 transition-opacity group-hover:opacity-100 sm:right-4 sm:top-4">
            <ArrowRight className="h-4 w-4" />
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("monthlySpending")}
          </p>
          <h3 className="font-display text-2xl font-bold leading-none text-[var(--color-ink)] sm:text-3xl">
            {formatEur(stats.spentMonthCents)}
          </h3>
          <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
            {t("yearlyTotal")}: {formatEur(stats.spentYearCents)}
          </p>
        </button>
      </motion.section>

      {/* Active Booking + Quick Access */}
      <motion.div
        variants={fadeUp}
        className="grid gap-6 lg:grid-cols-12"
      >
        {/* Active booking */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6 lg:p-8">
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <h4 className="font-display text-lg font-bold tracking-tight text-[var(--color-ink)] sm:text-xl">
                {t("activeBooking")}
              </h4>
              {hasActiveBooking && latestBooking && (
                <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-success)]/10 px-3 py-1 text-xs font-bold text-[var(--color-success)]">
                  <Check className="h-3 w-3" />
                  {t(`status.${latestBooking.status}`)}
                </span>
              )}
            </div>

            {hasActiveBooking && latestBooking ? (
              <div className="rounded-2xl border-2 border-[var(--color-blue)]/20 bg-[var(--color-blue-soft)] p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white font-display text-base font-bold text-[var(--color-blue)] shadow-[var(--shadow-xs)] sm:h-14 sm:w-14 sm:text-lg">
                        {latestBooking.cleanerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--color-ink)] sm:text-lg">
                          {t("cleaningService")}
                        </h3>
                        <p className="text-sm text-[var(--color-slate)]">
                          {latestBooking.cleanerName}
                          {latestBooking.rating != null && (
                            <> · ★ {latestBooking.rating.toFixed(1)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-[var(--color-slate)] sm:text-sm">
                      {nextDay && (
                        <span className="flex items-center gap-1 capitalize">
                          <Calendar className="h-3.5 w-3.5" />
                          {nextDay} · {slotLabel(latestBooking.scheduledTime)}
                        </span>
                      )}
                      {latestBooking.hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {latestBooking.hours} uur
                        </span>
                      )}
                      {latestBooking.cleanerHood && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {latestBooking.cleanerHood}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {latestBooking.totalCents != null && (
                      <p className="font-display text-2xl font-bold text-[var(--color-blue)]">
                        {formatEur(latestBooking.totalCents)}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]" translate="no">
                      {latestBooking.reference}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-blue)]/10 pt-4">
                  <button
                    onClick={() => navigateTo("bookings")}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-[var(--color-blue)] px-4 text-xs font-semibold text-white shadow-[var(--shadow-xs)] transition-all hover:bg-[var(--color-blue-2)] hover:shadow-[var(--shadow-blue)]"
                  >
                    {t("details")}
                  </button>
                  <button
                    onClick={() => navigateTo("bookings")}
                    className="flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-[var(--color-danger)] transition-all hover:bg-[var(--color-danger-soft)]"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-blue-soft)]">
                  <Sparkles className="h-7 w-7 text-[var(--color-blue)]" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-[var(--color-ink)]">
                  {t("noActiveBooking")}
                </h3>
                <p className="mb-6 max-w-sm text-sm text-[var(--color-slate)]">
                  {t("noActiveBookingBody")}
                </p>
                <button
                  onClick={() => router.push("/schoonmakers")}
                  className="rounded-full bg-[var(--color-blue)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-xs)] transition-all hover:bg-[var(--color-blue-2)] hover:shadow-[var(--shadow-blue)]"
                >
                  {t("bookFirst")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick access */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6">
            <h4 className="mb-4 font-display text-lg font-bold tracking-tight text-[var(--color-ink)] sm:text-xl">
              {t("quickAccess")}
            </h4>
            <div className="flex flex-col gap-2">
              {[
                {
                  icon: Sparkles,
                  label: t("newBooking"),
                  onClick: () => router.push("/schoonmakers"),
                  accent: true,
                },
                {
                  icon: Calendar,
                  label: t("myBookings"),
                  onClick: () => navigateTo("bookings"),
                  accent: false,
                },
                {
                  icon: CreditCard,
                  label: t("paymentMethods"),
                  onClick: () => navigateTo("payments"),
                  accent: false,
                },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.onClick}
                  className={`group flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                    item.accent
                      ? "bg-[var(--color-blue-soft)] hover:bg-[var(--color-blue)] hover:text-white"
                      : "hover:bg-[var(--color-surface-2)]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      item.accent
                        ? "bg-[var(--color-blue)] text-white group-hover:bg-white group-hover:text-[var(--color-blue)]"
                        : "bg-[var(--color-surface-2)] text-[var(--color-slate)] group-hover:bg-white group-hover:shadow-[var(--shadow-xs)]"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-sm font-bold ${item.accent ? "text-[var(--color-blue)] group-hover:text-white" : "text-[var(--color-ink)]"}`}
                  >
                    {item.label}
                  </span>
                  <ChevronRight className="ml-auto h-4 w-4 text-[var(--color-muted)] transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderCalendar = () => (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      key="calendar"
      className="w-full"
    >
      <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        {t("bookingCalendar")}
      </h2>
      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
            <Calendar className="h-8 w-8 text-[var(--color-muted)]" />
          </div>
          <h3 className="mb-2 font-display text-lg font-bold text-[var(--color-ink)]">
            {t("bookingCalendar")}
          </h3>
          <p className="text-sm text-[var(--color-slate)]">
            {t("dayDetails")}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      key="payments"
      className="w-full"
    >
      <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        {t("paymentHistory")}
      </h2>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <h3 className="mb-6 font-display text-lg font-bold text-[var(--color-ink)]">
            {t("paymentHistory")}
          </h3>
          {paidBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                <CreditCard className="h-6 w-6 text-[var(--color-muted)]" />
              </div>
              <p className="text-sm text-[var(--color-slate)]">{t("paymentsEmpty")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paidBookings.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-line)] p-4 transition-all hover:border-[var(--color-blue)]/30 hover:shadow-[var(--shadow-xs)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-bold text-[var(--color-ink)]">
                      {p.cleanerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-ink)]">
                        {p.cleanerName}
                      </p>
                      <p className="text-xs text-[var(--color-slate)]">
                        <span translate="no">{p.reference}</span>
                        {p.scheduledDate && <> · {formatDay(p.scheduledDate)}</>}
                      </p>
                    </div>
                  </div>
                  <span className="font-display text-base font-bold text-[var(--color-ink)]">
                    {p.totalCents != null ? formatEur(p.totalCents) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)] p-6 shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div>
            <p className="text-sm font-medium text-[var(--color-muted-2)] uppercase tracking-wider mb-2">
              {t("monthlySpending")}
            </p>
            <h3 className="font-display text-4xl font-bold text-white mb-1 sm:text-5xl">
              {formatEur(stats.spentMonthCents)}
            </h3>
            <p className="text-sm text-[var(--color-muted-2)] mb-4">
              {t("yearlyTotal")}: {formatEur(stats.spentYearCents)}
            </p>
          </div>
          <button
            disabled={paidBookings.length === 0}
            className="w-full rounded-xl bg-white py-3 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors shadow-lg mt-4 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("downloadInvoices")}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {view === "overview" && renderOverview()}
      {view === "bookings" && <BookingsView key="bookings" bookings={bookings} />}
      {view === "calendar" && renderCalendar()}
      {view === "payments" && renderPayments()}
    </AnimatePresence>
  );
}
