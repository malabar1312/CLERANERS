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
} from "lucide-react";
import { isSameDay } from "date-fns";

import { CalendarView } from "./calendar-view";
import { EarningsView } from "./earnings-view";
import { SettingsView } from "./settings-view";
import { ServiceModal } from "./service-modal";
import {
  getMockServicesForCleaner,
  type CleanerService,
} from "@/lib/data/cleaner-services";

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
  services,
}: {
  profile: { first_name: string; role?: string };
  /** Real services del cleaner. Si no se pasa o llega vacío, usa mock BETA. */
  services?: CleanerService[];
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

  // BETA fallback: si no llegan services reales (o llegan vacíos), usar mock.
  // Cuando cleaner_profiles + linking exista, page.tsx pasará el array real.
  const allServices = useMemo<CleanerService[]>(
    () => (services && services.length > 0 ? services : getMockServicesForCleaner()),
    [services],
  );

  const todayServices = allServices.filter((s) =>
    isSameDay(s.date, new Date()),
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
              €1.240
            </h3>
            <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
            {t("vsLastMonth", { pct: "12" })}
          </p>
        </button>

        <button
          onClick={() =>
            todayServices[0] && setSelectedService(todayServices[0])
          }
          className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 text-left shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)] hover:shadow-[var(--shadow-ambient)] sm:p-6"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-blue)]/5 blur-3xl transition-all group-hover:bg-[var(--color-blue)]/10" />
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("nextService")}
          </p>
          <h3 className="font-display text-xl font-bold leading-none text-[var(--color-ink)] sm:text-2xl">
            14:00
          </h3>
          <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
            {t("deepClean", { hours: "4" })}
          </p>
        </button>

        <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-ambient)] sm:p-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("rating")}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-2xl font-bold leading-none text-[var(--color-ink)] sm:text-3xl">
              4,9
            </h3>
            <Star className="h-4 w-4 fill-[#F5A623] text-[#F5A623]" />
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-slate)] sm:mt-2">
            {t("basedOnReviews", { count: "86" })}
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-ambient)] sm:p-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] sm:mb-3 sm:text-[11px]">
            {t("progress")}
          </p>
          <h3 className="font-display text-2xl font-bold leading-none text-[var(--color-ink)] sm:text-3xl">
            18/20
          </h3>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)] sm:mt-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "90%" }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-[var(--color-success)]"
            />
          </div>
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
            <div className="flex flex-col gap-3">
              {[
                {
                  name: "Lisa M.",
                  msg: "Voorzichtig met de...",
                  time: "10 min",
                  unread: true,
                },
                {
                  name: "Jeroen B.",
                  msg: "Alles perfect gisteren, bedankt.",
                  time: "Gisteren",
                  unread: false,
                },
              ].map((msg, i) => (
                <div
                  key={i}
                  className="group relative flex cursor-pointer gap-3 rounded-xl border border-transparent p-2 transition-all hover:bg-[var(--color-surface-2)] hover:border-[var(--color-line)]"
                >
                  {msg.unread && (
                    <span className="absolute right-2 top-3 h-1.5 w-1.5 rounded-full bg-[var(--color-blue)]" />
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-3)] text-xs font-bold text-[var(--color-ink)]">
                    {msg.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm font-bold ${msg.unread ? "text-[var(--color-ink)]" : "text-[var(--color-slate)]"}`}
                      >
                        {msg.name}
                      </p>
                      <span className="text-[10px] font-medium text-[var(--color-muted)]">
                        {msg.time}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 line-clamp-1 text-xs ${msg.unread ? "text-[var(--color-ink)] font-medium" : "text-[var(--color-muted)]"}`}
                    >
                      {msg.msg}
                    </p>
                  </div>
                </div>
              ))}
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
        {view === "calendar" && (
          <CalendarView
            services={allServices}
            onSelectService={setSelectedService}
          />
        )}
        {view === "earnings" && <EarningsView />}
        {view === "settings" && <SettingsView profile={profile} />}
      </AnimatePresence>

      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </>
  );
}
