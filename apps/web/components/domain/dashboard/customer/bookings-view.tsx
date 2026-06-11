"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Calendar, Clock, MapPin, Sparkles, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatEur } from "@/lib/booking/pricing";
import { cancelBooking } from "@/app/[locale]/_actions/booking-manage";
import { cn } from "@/lib/utils";

/** Fila de la lista — la arma el server (`dashboard/page.tsx`) vía RLS. */
export type BookingListItem = {
  id: string;
  reference: string;
  cleanerName: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  hours: number | null;
  m2: number | null;
  totalCents: number | null;
  status: string;
  city: string | null;
  /** Regla >24h + status cancelable, calculada server-side. */
  cancellable: boolean;
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-[#F5A623]/10 text-[#B47A00]",
  paid: "bg-[var(--color-blue)]/10 text-[var(--color-blue)]",
  accepted: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  in_progress: "bg-[var(--color-blue)]/10 text-[var(--color-blue)]",
  completed: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  reviewed: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  rejected: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  refunded: "bg-[var(--color-surface-2)] text-[var(--color-slate)]",
  canceled: "bg-[var(--color-surface-2)] text-[var(--color-slate)]",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function BookingsView({ bookings }: { bookings: BookingListItem[] }) {
  const t = useTranslations("dashboard.customer");
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onCancel = (id: string) => {
    setErrorId(null);
    startTransition(async () => {
      const res = await cancelBooking(id);
      if (res.ok) {
        setConfirmingId(null);
        router.refresh();
      } else {
        setErrorId(id);
        setConfirmingId(null);
      }
    });
  };

  const slotLabel = (slot: string | null) => {
    if (slot === "morning") return t("slots.morning");
    if (slot === "afternoon") return t("slots.afternoon");
    if (slot === "evening") return t("slots.evening");
    return slot ?? "—";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      key="bookings"
      className="w-full"
    >
      <h2 className="mb-2 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        {t("myBookings")}
      </h2>
      <p className="mb-6 text-sm text-[var(--color-slate)]">
        {t("cancelPolicy")}
      </p>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
              <Sparkles className="h-8 w-8 text-[var(--color-muted)]" />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-[var(--color-ink)]">
              {t("bookingsEmpty")}
            </h3>
            <p className="mb-6 max-w-sm text-sm text-[var(--color-slate)]">
              {t("bookingsEmptyBody")}
            </p>
            <Link
              href="/schoonmakers"
              className="rounded-full bg-[var(--color-blue)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-xs)] transition-all hover:bg-[var(--color-blue-2)] hover:shadow-[var(--shadow-blue)]"
            >
              {t("bookFirst")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)]/30 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-2)] font-display text-base font-bold text-[var(--color-blue)]">
                    {b.cleanerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-[var(--color-ink)] sm:text-base">
                      {b.cleanerName}
                    </p>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-muted)]" translate="no">
                      {b.reference}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-slate)] sm:text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    {formatDate(b.scheduledDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {slotLabel(b.scheduledTime)}
                    {b.hours ? ` · ${b.hours} uur` : ""}
                  </span>
                  {b.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {b.city}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      STATUS_TONE[b.status] ?? "bg-[var(--color-surface-2)] text-[var(--color-slate)]",
                    )}
                  >
                    {t(`status.${b.status}`)}
                  </span>
                  <span className="font-display text-base font-bold text-[var(--color-ink)]">
                    {b.totalCents != null ? formatEur(b.totalCents) : "—"}
                  </span>
                </div>
              </div>

              {(b.cancellable || errorId === b.id) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] pt-3">
                  {b.cancellable && confirmingId !== b.id && (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(b.id)}
                      className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-[var(--color-danger)] transition-all hover:bg-[var(--color-danger-soft)]"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                      {t("cancelAction")}
                    </button>
                  )}
                  {b.cancellable && confirmingId === b.id && (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onCancel(b.id)}
                        className="flex h-8 items-center rounded-full bg-[var(--color-danger)] px-4 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {pending ? t("cancelling") : t("confirmCancel")}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setConfirmingId(null)}
                        className="flex h-8 items-center rounded-full border border-[var(--color-line)] px-4 text-xs font-semibold text-[var(--color-ink)] transition-all hover:bg-[var(--color-surface-2)]"
                      >
                        {t("keepBooking")}
                      </button>
                    </>
                  )}
                  {errorId === b.id && (
                    <span className="text-xs font-medium text-[var(--color-danger)]" role="alert">
                      {t("cancelFailed")}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
