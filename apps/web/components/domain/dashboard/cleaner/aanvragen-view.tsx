"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Calendar, Check, Clock, Inbox, MapPin, X } from "lucide-react";
import { formatEur } from "@/lib/booking/pricing";
import { respondToBooking } from "@/app/[locale]/_actions/cleaner-bookings";
import { cn } from "@/lib/utils";

/** Fila de aanvraag — la arma el server (`dashboard/page.tsx`) con admin
 * client tras verificar que cleaner_id = slug del cleaner logueado. */
export type CleanerAanvraag = {
  id: string;
  reference: string;
  clientName: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  hours: number | null;
  m2: number | null;
  /** Subtotal (tarifa × horas) — lo que corresponde al trabajo, sin fee cliente. */
  amountCents: number | null;
  status: string;
  city: string | null;
};

const STATUS_TONE: Record<string, string> = {
  paid: "bg-[#F5A623]/10 text-[#B47A00]",
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

export function AanvragenView({ aanvragen }: { aanvragen: CleanerAanvraag[] }) {
  const t = useTranslations("dashboard.cleaner.aanvragen");
  const router = useRouter();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const respond = (id: string, decision: "accept" | "reject") => {
    setErrorId(null);
    setBusyId(id);
    startTransition(async () => {
      const res = await respondToBooking(id, decision);
      setBusyId(null);
      setRejectingId(null);
      if (res.ok) {
        router.refresh();
      } else {
        setErrorId(id);
      }
    });
  };

  const slotLabel = (slot: string | null) => {
    if (slot === "morning") return t("slots.morning");
    if (slot === "afternoon") return t("slots.afternoon");
    if (slot === "evening") return t("slots.evening");
    return slot ?? "—";
  };

  const open = aanvragen.filter((a) => a.status === "paid");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      key="aanvragen"
      className="w-full"
    >
      <h2 className="mb-2 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        {t("title")}
      </h2>
      <p className="mb-6 text-sm text-[var(--color-slate)]">
        {open.length > 0 ? t("openCount", { count: open.length }) : t("subtitle")}
      </p>

      {aanvragen.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
              <Inbox className="h-8 w-8 text-[var(--color-muted)]" />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-[var(--color-ink)]">
              {t("empty")}
            </h3>
            <p className="max-w-sm text-sm text-[var(--color-slate)]">
              {t("emptyBody")}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {aanvragen.map((a) => {
            const actionable = a.status === "paid";
            const busy = busyId === a.id;
            return (
              <div
                key={a.id}
                className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)]/30 sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-2)] font-display text-base font-bold text-[var(--color-blue)]">
                      {a.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-[var(--color-ink)] sm:text-base">
                        {a.clientName}
                      </p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-muted)]" translate="no">
                        {a.reference}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-slate)] sm:text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      {formatDate(a.scheduledDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {slotLabel(a.scheduledTime)}
                      {a.hours ? ` · ${a.hours} uur` : ""}
                      {a.m2 ? ` · ${a.m2} m²` : ""}
                    </span>
                    {a.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {a.city}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold",
                        STATUS_TONE[a.status] ?? "bg-[var(--color-surface-2)] text-[var(--color-slate)]",
                      )}
                    >
                      {t(`status.${a.status}`)}
                    </span>
                    <span className="font-display text-base font-bold text-[var(--color-ink)]">
                      {a.amountCents != null ? formatEur(a.amountCents) : "—"}
                    </span>
                  </div>
                </div>

                {(actionable || errorId === a.id) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] pt-3">
                    {actionable && rejectingId !== a.id && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => respond(a.id, "accept")}
                          className="flex h-9 items-center gap-1.5 rounded-full bg-[var(--color-success)] px-4 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden />
                          {busy ? t("working") : t("accept")}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setRejectingId(a.id)}
                          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-[var(--color-danger)] transition-all hover:bg-[var(--color-danger-soft)] disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden />
                          {t("reject")}
                        </button>
                      </>
                    )}
                    {actionable && rejectingId === a.id && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => respond(a.id, "reject")}
                          className="flex h-9 items-center rounded-full bg-[var(--color-danger)] px-4 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        >
                          {busy ? t("working") : t("confirmReject")}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setRejectingId(null)}
                          className="flex h-9 items-center rounded-full border border-[var(--color-line)] px-4 text-xs font-semibold text-[var(--color-ink)] transition-all hover:bg-[var(--color-surface-2)]"
                        >
                          {t("back")}
                        </button>
                      </>
                    )}
                    {errorId === a.id && (
                      <span className="text-xs font-medium text-[var(--color-danger)]" role="alert">
                        {t("failed")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
