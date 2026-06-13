"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  Star,
  Clock,
  MapPin,
  Info,
  Circle,
  CheckCircle,
  Navigation,
} from "lucide-react";
import type { CleanerService } from "@/lib/data/cleaner-services";

/** @deprecated — usar `CleanerService` de `@/lib/data/cleaner-services`. */
export type MockService = CleanerService;

const popUp = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  show: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { scale: 0.95, opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export function ServiceModal({
  service,
  onClose,
}: {
  service: MockService | null;
  onClose: () => void;
}) {
  const t = useTranslations("dashboard.cleaner.modal");
  const [tasks, setTasks] = useState([
    { id: 1, text: "Ramen binnenkant schoonmaken", done: false },
    { id: 2, text: "2 overhemden strijken", done: false },
    { id: 3, text: "Keuken grondig reinigen", done: true },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <AnimatePresence>
      {service && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--color-ink)]/30 backdrop-blur-sm"
          />
          <motion.div
            variants={popUp}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative z-50 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-4 bg-white">
              <h3 className="font-display text-xl font-bold text-[var(--color-ink)]">
                {t("serviceDetail")}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[var(--color-slate)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Client profile */}
              <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-xs)]">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xl font-bold text-[var(--color-ink)]">
                    {service.client.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-[var(--color-ink)]">
                      {service.client.name}
                    </h4>
                    {service.client.reviews > 0 && (
                      <p className="flex items-center gap-1 text-sm font-medium text-[var(--color-slate)]">
                        <Star className="h-4 w-4 fill-[#F5A623] text-[#F5A623]" />
                        {service.client.rating} ({service.client.reviews}{" "}
                        reviews)
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-xl bg-[var(--color-blue-soft)] py-2 text-sm font-bold text-[var(--color-blue)] hover:bg-[var(--color-blue)] hover:text-white transition-colors">
                    {t("message")}
                  </button>
                  <button className="flex-1 rounded-xl border border-[var(--color-line)] py-2 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">
                    {t("call")}
                  </button>
                </div>
              </div>

              {/* Service details + Notes */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-xs)] flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-base font-bold text-[var(--color-ink)]">
                        {service.type}
                      </h4>
                      <p className="text-sm text-[var(--color-slate)] flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4" /> {service.time}
                      </p>
                    </div>
                    <span className="font-display text-xl font-bold text-[var(--color-blue)]">
                      {service.price}
                    </span>
                  </div>
                  <div className="h-24 w-full rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center border border-[var(--color-line)] shadow-inner mb-3">
                    <MapPin className="h-6 w-6 text-[var(--color-muted)] opacity-50" />
                  </div>
                  <p className="text-sm text-[var(--color-ink)] font-medium mt-auto">
                    {service.address}
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {service.notes && (
                    <div className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/5 p-5 flex-1">
                      <div className="flex items-center gap-2 mb-2 text-[#D08B1E]">
                        <Info className="h-5 w-5" />
                        <h4 className="font-bold text-sm">
                          {t("specialInstructions")}
                        </h4>
                      </div>
                      <p className="text-sm text-[#A66E16] leading-relaxed">
                        {service.notes}
                      </p>
                    </div>
                  )}
                  <button className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-ink)] py-3 text-sm font-bold text-white shadow-[var(--shadow-xs)] hover:bg-[var(--color-blue)] transition-colors">
                    <Navigation className="h-4 w-4" /> {t("openGPS")}
                  </button>
                </div>
              </div>

              {/* Checklist */}
              <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-xs)]">
                <h4 className="font-display text-base font-bold text-[var(--color-ink)] mb-4">
                  {t("taskChecklist")}
                </h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="flex items-start gap-3 w-full text-left group"
                    >
                      {task.done ? (
                        <CheckCircle className="h-5 w-5 text-[var(--color-success)] shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-[var(--color-muted)] group-hover:text-[var(--color-blue)] shrink-0 mt-0.5 transition-colors" />
                      )}
                      <span
                        className={`text-sm ${task.done ? "text-[var(--color-muted)] line-through" : "text-[var(--color-ink)] font-medium"}`}
                      >
                        {task.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--color-line)] p-6 bg-white">
              <button className="w-full rounded-full bg-[var(--color-blue)] py-3.5 text-sm font-bold text-white shadow-[var(--shadow-blue)] hover:bg-[var(--color-blue-2)] transition-all">
                {t("startWork")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
