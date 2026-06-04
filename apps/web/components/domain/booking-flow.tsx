"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { X, ArrowLeft, ArrowRight, ShieldCheck, Lock, Check, CalendarCheck } from "lucide-react";
import { buttonStyles } from "@/components/ui/button-variants";
import { trackBookingStart, trackBookingPay } from "@/lib/analytics";
import { computePrice, formatEur, minBookingDate, hoursForArea } from "@/lib/booking/pricing";
import { createBookingCheckout } from "@/app/[locale]/_actions/booking";
import { cn } from "@/lib/utils";

type CleanerLite = { id: string; name: string; pricePerHour: number; hood: string; tone: number };
type TimeSlot = "morning" | "afternoon" | "evening";
type Frequency = "once" | "weekly" | "biweekly";

const inputCls =
  "h-11 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-white)] px-3.5 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition-all duration-200 focus:border-[var(--color-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/25 focus:shadow-[0_0_0_4px_rgb(0_102_255/0.08)]";

/** `<BookingButton />` — CTA que abre el flujo de reserva (Server → Client). */
export function BookingButton({ cleaner, className }: { cleaner: CleanerLite; className?: string }) {
  const t = useTranslations("booking");
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); trackBookingStart(cleaner.id); }}
        className={cn(buttonStyles({ variant: "accent", size: "lg", fullWidth: true }), className)}
      >
        {t("open")}
      </button>
      {open && <BookingModal cleaner={cleaner} onClose={() => setOpen(false)} />}
    </>
  );
}

function BookingModal({ cleaner, onClose }: { cleaner: CleanerLite; onClose: () => void }) {
  const t = useTranslations("booking");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [m2, setM2] = useState(70);
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [date, setDate] = useState("");
  const [time, setTime] = useState<TimeSlot | "">("");
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("Amsterdam");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const price = computePrice(cleaner.pricePerHour, m2);

  // scroll lock + Esc + focus trap (a11y)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // auto-focus el primer focusable del panel
    panelRef.current
      ?.querySelector<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const step2Valid =
    date >= minBookingDate() && time !== "" && street.trim().length >= 2 && postcode.trim().length >= 4 && city.trim().length >= 2;
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const step3Valid = name.trim().length >= 2 && emailValid;

  async function pay() {
    setError(null);
    if (!step3Valid) {
      setError(emailValid ? "errorGeneric" : "errorEmail");
      return;
    }
    setPending(true);
    trackBookingPay(cleaner.id, price.totalCents);
    const res = await createBookingCheckout({
      cleanerId: cleaner.id,
      m2,
      date,
      time,
      frequency,
      street,
      postcode,
      city,
      notes: notes || undefined,
      email,
      name,
    });
    if (res.ok) {
      window.location.href = res.url;
    } else {
      setPending(false);
      setError(res.error === "invalid_input" ? "errorEmail" : "errorGeneric");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="booking-title">
      <div className="absolute inset-0 bg-[color:rgb(10_10_10/0.45)] backdrop-blur-sm" onClick={onClose} role="presentation" />
      <div
        ref={panelRef}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[var(--color-line)] bg-[var(--color-white)] shadow-[var(--shadow-glass)] sm:rounded-3xl"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-4">
          <div>
            <h2 id="booking-title" className="headline text-lg text-[var(--color-ink)]">
              {t("title", { name: cleaner.name })}
            </h2>
            <Stepper step={step} labels={[t("steps.details"), t("steps.when"), t("steps.confirm")]} />
          </div>
          <button type="button" onClick={onClose} aria-label={t("close")} className="rounded-full p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]">
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Escrow trust strip — persistente en los 3 pasos */}
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-blue-soft)] px-6 py-2.5 text-xs font-medium text-[var(--color-blue)]">
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("escrowStrip")}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="space-y-5">
              <Field label={t("m2Label")} help={t("m2Help")}>
                <div className="flex flex-wrap gap-2">
                  {[45, 70, 100, 130].map((v) => (
                    <Chip key={v} active={m2 === v} onClick={() => setM2(v)}>{v} m²</Chip>
                  ))}
                  <input type="number" min={10} max={500} value={m2} onChange={(e) => setM2(Math.max(10, Math.min(500, Number(e.target.value) || 0)))} className={cn(inputCls, "w-24")} aria-label={t("m2Label")} />
                </div>
                <p className="mt-2 text-sm font-medium text-[var(--color-blue)]">{t("hoursEstimate", { hours: hoursForArea(m2) })}</p>
              </Field>
              <Field label={t("frequencyLabel")}>
                <div className="grid grid-cols-3 gap-2">
                  {(["once", "weekly", "biweekly"] as const).map((f) => (
                    <Chip key={f} active={frequency === f} onClick={() => setFrequency(f)} block>{t(`frequency.${f}`)}</Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("dateLabel")}>
                  <input type="date" min={minBookingDate()} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                </Field>
                <Field label={t("timeLabel")}>
                  <select value={time} onChange={(e) => setTime(e.target.value as TimeSlot)} className={cn(inputCls, "appearance-none")}>
                    <option value="" disabled>—</option>
                    {(["morning", "afternoon", "evening"] as const).map((s) => (
                      <option key={s} value={s}>{t(`time.${s}`)}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label={t("addressLabel")}>
                <div className="space-y-2">
                  <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder={t("street")} className={inputCls} autoComplete="address-line1" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder={t("postcode")} className={inputCls} autoComplete="postal-code" />
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("city")} className={inputCls} autoComplete="address-level2" />
                  </div>
                </div>
              </Field>
              <Field label={t("notes")}>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={cn(inputCls, "h-auto py-2.5")} maxLength={500} />
              </Field>
              <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                {t("cancelNote")}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                <p className="label text-[var(--color-muted)]">{t("summary")}</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <Row label={t("subtotal", { hours: price.hours })} value={formatEur(price.subtotalCents)} />
                  <Row label={t("serviceFee")} value={formatEur(price.feeCents)} />
                  <div className="my-2 border-t border-[var(--color-line)]" />
                  <Row label={t("total")} value={formatEur(price.totalCents)} bold />
                </dl>
                <p className="mt-3 text-xs text-[var(--color-muted)]">{t("feeNote")}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={t("name")}>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoComplete="name" />
                </Field>
                <Field label={t("email")}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" aria-invalid={email !== "" && !emailValid} />
                </Field>
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                  {t("secure")}
                </p>
                <p className="text-xs leading-relaxed text-[var(--color-muted)]">
                  {t("nextStep", { name: cleaner.name })}
                </p>
              </div>
              {error && <p className="text-sm text-[var(--color-danger)]" role="alert">{t(error)}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-[var(--color-line)] px-6 py-4">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className={buttonStyles({ variant: "ghost", size: "md" })}>
              <ArrowLeft className="h-4 w-4" /> {t("back")}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-blue)]" aria-hidden="true" />
              {formatEur(price.totalCents)}
            </span>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && !step2Valid}
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              {t("next")} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={pay} disabled={pending || !step3Valid} className={buttonStyles({ variant: "accent", size: "md" })}>
              {pending ? t("paying") : <><Check className="h-4 w-4" /> {t("pay")} · {formatEur(price.totalCents)}</>}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  const current = labels[step - 1];
  return (
    <div className="mt-1.5 flex items-center gap-2.5">
      <div className="flex items-center gap-1.5">
        {labels.map((l, i) => (
          <span
            key={l}
            className={cn(
              "h-1 w-6 rounded-full transition-colors duration-[var(--dur-base)]",
              i + 1 <= step ? "bg-[var(--color-blue)]" : "bg-[var(--color-surface-3)]",
            )}
            aria-current={i + 1 === step ? "step" : undefined}
          />
        ))}
      </div>
      {current && <span className="text-xs font-medium text-[var(--color-muted)]">{current}</span>}
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-ink)]">{label}</label>
      {help && <p className="mt-0.5 text-xs text-[var(--color-muted)]">{help}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children, block }: { active: boolean; onClick: () => void; children: ReactNode; block?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm font-medium transition",
        block && "w-full",
        active
          ? "border-[var(--color-blue)] bg-[var(--color-blue-soft)] text-[var(--color-blue)]"
          : "border-[var(--color-line)] bg-[var(--color-white)] text-[var(--color-slate)] hover:border-[var(--color-ink)]",
      )}
    >
      {children}
    </button>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", bold ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]")}>
      <dt className={bold ? "font-semibold" : ""}>{label}</dt>
      <dd className={bold ? "text-base font-bold" : "font-medium text-[var(--color-ink)]"}>{value}</dd>
    </div>
  );
}
