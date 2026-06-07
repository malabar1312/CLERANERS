"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ArrowRight,
  Ban,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
} from "date-fns";
import { nl, enUS } from "date-fns/locale";
import type { MockService } from "./service-modal";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export function CalendarView({
  services,
  onSelectService,
}: {
  services: MockService[];
  onSelectService: (s: MockService) => void;
}) {
  const t = useTranslations("dashboard.cleaner.calendar");
  const locale = useLocale();
  const dateFnsLocale = locale === "nl" ? nl : enUS;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getServicesForDate = (date: Date) =>
    services.filter((s) => isSameDay(s.date, date));

  const selectedDateServices = getServicesForDate(selectedDate);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      key="calendar"
      className="w-full"
    >
      <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        {t("title")}
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar grid */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="font-display font-bold text-lg text-[var(--color-ink)] capitalize sm:text-xl">
              {format(currentMonth, "MMMM yyyy", { locale: dateFnsLocale })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="rounded-lg border border-[var(--color-line)] p-2 text-sm hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="rounded-lg border border-[var(--color-line)] p-2 text-sm hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[var(--color-muted)] mb-3 sm:gap-2">
            {(t.raw("weekDays") as string[]).map((d: string) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {daysInterval.map((day, i) => {
              const dayServices = getServicesForDate(day);
              const hasServices = dayServices.length > 0;
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square relative rounded-xl flex items-center justify-center text-sm font-medium transition-all border ${
                    !isCurrentMonth
                      ? "text-[var(--color-muted-2)] bg-transparent border-transparent"
                      : isSelected
                        ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-md scale-105 z-10"
                        : hasServices
                          ? "bg-[var(--color-blue-soft)] text-[var(--color-blue)] border-[var(--color-blue-soft)] hover:border-[var(--color-blue)]"
                          : "bg-white text-[var(--color-ink)] border-[var(--color-line)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
                  }`}
                >
                  {format(day, "d")}
                  {hasServices && (
                    <div
                      className={`absolute bottom-1.5 h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-[var(--color-blue)]"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-soft)] flex flex-col h-full sm:p-6">
          <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-1 sm:text-xl">
            {isSameDay(selectedDate, new Date())
              ? t("today")
              : format(selectedDate, "EEEE, d MMMM", {
                  locale: dateFnsLocale,
                })}
          </h3>
          <p className="text-sm text-[var(--color-slate)] mb-6">
            {t("scheduled", { count: selectedDateServices.length })}
          </p>

          <div className="flex-1 space-y-3">
            <AnimatePresence mode="popLayout">
              {selectedDateServices.length > 0 ? (
                selectedDateServices.map((srv, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.1 }}
                    key={srv.id}
                    onClick={() => onSelectService(srv)}
                    className="rounded-xl bg-white p-4 border border-[var(--color-line)] cursor-pointer hover:border-[var(--color-blue)] hover:shadow-[var(--shadow-ambient)] transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-[var(--color-blue)] bg-[var(--color-blue-soft)] px-2 py-1 rounded-md">
                        {srv.time}
                      </span>
                      <ArrowRight className="h-4 w-4 text-[var(--color-slate)] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </div>
                    <h4 className="font-bold text-sm text-[var(--color-ink)] mb-1">
                      {srv.type}
                    </h4>
                    <p className="text-xs text-[var(--color-slate)] flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" />{" "}
                      {srv.address.split(",")[0]}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[9px] font-bold text-[var(--color-ink)]">
                        {srv.client.name.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-[var(--color-ink)]">
                        {srv.client.name}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center py-10"
                >
                  <div className="h-16 w-16 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center mb-4">
                    <CalendarIcon className="h-8 w-8 text-[var(--color-muted)]" />
                  </div>
                  <h4 className="font-bold text-[var(--color-ink)] mb-2">
                    {t("dayOff")}
                  </h4>
                  <p className="text-sm text-[var(--color-slate)] mb-6 max-w-[200px]">
                    {t("noServices")}
                  </p>
                  <button className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-bold text-[var(--color-ink)] shadow-sm transition-all hover:bg-[var(--color-surface-2)]">
                    <Ban className="h-4 w-4" /> {t("markUnavailable")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
