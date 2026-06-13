"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Star,
  TrendingUp,
  ArrowRight,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { isSameDay } from "date-fns";

import { CalendarView } from "./calendar-view";
import { EarningsView } from "./earnings-view";
import { SettingsView } from "./settings-view";
import { ServiceModal } from "./service-modal";
import { AanvragenView, type CleanerAanvraag } from "./aanvragen-view";
import { aanvragenToServices, type CleanerService } from "@/lib/data/cleaner-services";
import { formatEur } from "@/lib/booking/pricing";

/** KPIs del cleaner, derivados server-side de SUS aanvragen + perfil reales. */
export type CleanerStats = {
  revenueMonthCents: number;
  acceptedUpcoming: number;
  completedCount: number;
  /** Rating real del perfil; null = sin reviews aún ("Nieuw"). */
  rating: number | null;
  reviewCount: number;
};

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

export function CleanerDashboard({
  profile,
  aanvragen = [],
  stats = { revenueMonthCents: 0, acceptedUpcoming: 0, completedCount: 0, rating: null, reviewCount: 0 },
}: {
  profile: { first_name: string; role?: string };
  /** Bookings reales asignadas al cleaner (vista "Mijn Boekingen"). */
  aanvragen?: CleanerAanvraag[];
  /** KPIs derivados server-side. Todo 0/null si el cleaner es nuevo. */
  stats?: CleanerStats;
}) {
  const t = useTranslations("dashboard.cleaner");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "overview";

  const [selectedService, setSelectedService] = useState<CleanerService | null>(
    null,
  );

  const navigateTo = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Agenda real del cleaner — derivada de SUS aanvragen. Sin aanvragen → vacía.
  const allServices = useMemo<CleanerService[]>(
    () => aanvragenToServices(aanvragen),
    [aanvragen],
  );

  const todayServices = allServices.filter((s) =>
    isSameDay(s.date, new Date()),
  );
  const nextService = allServices
    .filter((s) => s.date.getTime() >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

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
            <p className="flex items-center gap-2 text-sm text-[var(--color-slate)] sm:text-base">
              {t("todayServices", { count: todayServices.length })}
            </p>
          </div>
          <button className="group flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-4 py-2 shadow-[var(--shadow-xs)] transition-all hover:border-[var(--color-blue)]/30 hover:shadow-[var(--shadow-soft)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-success)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-success)]" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-[var(--color-ink)]">
              {t("available")}
            </span>
          </button>
        </div>
      </motion.section>

      {/* KPI Cards */}
      <motion.section
        variants={fadeUp}
        className="mb-8 grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4"
      >
        <button
          onClick={() => navigateTo("earnings")}
          className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 text-left shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)] hover:shadow-[var(--shadow-ambient)] sm:p-6"
        >
          <div className="absolute right-3 top-3 text-[var(--color-slate)] opacity-0 transition-opacity group-hover:opacity-100 sm:right-4 sm:top-4">
            <ArrowRight className="h-4 w-4" />
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("revenueMonth")}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-2xl font-bold leading-none text-[var(--color-ink)] sm:text-3xl">
              {formatEur(stats.revenueMonthCents)}
            </h3>
            {stats.revenueMonthCents > 0 && (
              <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
            )}
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
            {t("thisMonth")}
          </p>
        </button>

        <button
          onClick={() => nextService && setSelectedService(nextService)}
          className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 text-left shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)] hover:shadow-[var(--shadow-ambient)] sm:p-6"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-blue)]/5 blur-3xl transition-all group-hover:bg-[var(--color-blue)]/10" />
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("nextService")}
          </p>
          {nextService ? (
            <>
              <h3 className="font-display text-xl font-bold leading-none text-[var(--color-ink)] sm:text-2xl">
                {nextService.time.split(" ")[0]}
              </h3>
              <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
                {nextService.type}
              </p>
            </>
          ) : (
            <>
              <h3 className="font-display text-xl font-bold leading-none text-[var(--color-muted)] sm:text-2xl">
                —
              </h3>
              <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
                {t("noServicesScheduled")}
              </p>
            </>
          )}
        </button>

        <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-ambient)] sm:p-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("rating")}
          </p>
          {stats.rating != null ? (
            <>
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-2xl font-bold leading-none text-[var(--color-ink)] sm:text-3xl">
                  {stats.rating.toFixed(1)}
                </h3>
                <Star className="h-4 w-4 fill-[#F5A623] text-[#F5A623]" />
              </div>
              <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
                {t("basedOnReviews", { count: stats.reviewCount })}
              </p>
            </>
          ) : (
            <>
              <h3 className="font-display text-2xl font-bold leading-none text-[var(--color-ink)] sm:text-3xl">
                {t("newCleaner")}
              </h3>
              <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
                {t("noReviewsYet")}
              </p>
            </>
          )}
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-ambient)] sm:p-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("completedLabel")}
          </p>
          <h3 className="font-display text-2xl font-bold leading-none text-[var(--color-ink)] sm:text-3xl">
            {stats.completedCount}
          </h3>
          <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
            {t("upcomingAccepted", { count: stats.acceptedUpcoming })}
          </p>
        </div>
      </motion.section>

      {/* Service queue + Inbox */}
      <motion.div
        variants={fadeUp}
        className="grid gap-6 lg:grid-cols-12"
      >
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6 lg:p-8">
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <h4 className="font-display text-lg font-bold tracking-tight text-[var(--color-ink)] sm:text-xl">
                {t("serviceQueue")}
              </h4>
              <button
                onClick={() => navigateTo("calendar")}
                className="text-[var(--color-blue)] hover:underline text-xs font-semibold"
              >
                {t("viewSchedule")}
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {todayServices.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-10 text-center">
                  <p className="text-sm text-[var(--color-slate)]">
                    {t("noServicesToday")}
                  </p>
                </div>
              )}
              {todayServices.map((srv, idx) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={`group relative flex cursor-pointer flex-col justify-between gap-3 rounded-2xl p-4 transition-all hover:border-[var(--color-blue)] hover:shadow-[var(--shadow-ambient)] sm:flex-row sm:items-center sm:gap-4 sm:p-5 ${
                    idx === 0
                      ? "border-2 border-[var(--color-blue)]/20 bg-[var(--color-blue-soft)]"
                      : "border border-[var(--color-line)] bg-white hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-base font-bold sm:h-14 sm:w-14 sm:text-lg ${
                        idx === 0
                          ? "bg-white shadow-[var(--shadow-xs)] text-[var(--color-blue)]"
                          : "bg-[var(--color-surface-2)] text-[var(--color-slate)] group-hover:bg-white group-hover:shadow-[var(--shadow-xs)]"
                      }`}
                    >
                      {srv.time.split(" ")[0]}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[var(--color-ink)] sm:text-lg">
                        {srv.type}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-slate)] sm:text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{" "}
                          {srv.address.split(",")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                  {idx === 0 && (
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-9 items-center justify-center rounded-full bg-[var(--color-blue)] px-4 text-xs font-semibold text-white shadow-[var(--shadow-xs)] transition-all hover:bg-[var(--color-blue-2)] hover:shadow-[var(--shadow-blue)] sm:h-10 sm:text-sm"
                    >
                      {t("startRoute")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inbox */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6">
            <h4 className="mb-4 font-display text-lg font-bold tracking-tight text-[var(--color-ink)] sm:text-xl">
              {t("inbox")}
            </h4>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                <MessageCircle className="h-6 w-6 text-[var(--color-muted)]" />
              </div>
              <p className="text-sm text-[var(--color-slate)]">{t("inboxEmpty")}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {view === "overview" && renderOverview()}
        {view === "bookings" && (
          <AanvragenView key="aanvragen" aanvragen={aanvragen} />
        )}
        {view === "calendar" && (
          <CalendarView
            services={allServices}
            onSelectService={setSelectedService}
          />
        )}
        {view === "earnings" && <EarningsView aanvragen={aanvragen} stats={stats} />}
        {view === "settings" && <SettingsView profile={profile} />}
      </AnimatePresence>

      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </>
  );
}
