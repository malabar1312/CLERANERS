"use client";

import { useActionState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { submitWaitlist, type WaitlistResult } from "@/app/[locale]/_actions/waitlist";
import { buttonStyles } from "@/components/ui/button-variants";
import { trackWaitlistSignup } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * `<HostLeadForm />` — captura de lead para hosts de Airbnb / vakantieverhuur.
 *
 * Variante CLARA (la página `/voor-verhuurders` es fondo blanco) del waitlist
 * form. Usa el MISMO Server Action real (`submitWaitlist`) pero con
 * `source="airbnb-host"`, de modo que estos leads se segmentan en Supabase y
 * el equipo los atiende 1:1 (loop concierge: el host deja su email → respuesta
 * directa para agendar la turnover). No depende de Stripe ni del catálogo.
 */
export function HostLeadForm() {
  const t = useTranslations("landlords.lead");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<WaitlistResult | null, FormData>(
    submitWaitlist,
    null,
  );

  const isDev = process.env.NODE_ENV !== "production";
  const softSuccess =
    state != null &&
    !state.ok &&
    (state.error === "duplicate" || (state.error === "config_missing" && isDev));
  const success = state?.ok === true || softSuccess;

  useEffect(() => {
    if (state?.ok === true) trackWaitlistSignup("airbnb-host");
  }, [state]);

  const errorMsg = (() => {
    if (!state || state.ok) return null;
    if (state.error === "duplicate") return null;
    if (state.error === "config_missing" && isDev) return null;
    if (state.error === "invalid_email") return t("errorEmail");
    return t("errorGeneric");
  })();

  if (success) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-blue-soft)] px-4 py-3.5 text-sm text-[var(--color-ink)]">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
        {t("success")}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2.5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value="airbnb-host" />
      {/* Honeypot — visually hidden, off the tab order, ignored by humans. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="host-lead-email" className="flex-1">
          <span className="sr-only">{t("placeholder")}</span>
          <input
            id="host-lead-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("placeholder")}
            aria-invalid={errorMsg ? true : undefined}
            className={cn(
              "h-12 w-full rounded-full border bg-[var(--color-white)] px-5 text-[15px] text-[var(--color-ink)]",
              "transition placeholder:text-[var(--color-muted)]",
              "focus:border-[var(--color-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/30",
              errorMsg ? "border-[var(--color-danger)]" : "border-[var(--color-line)]",
            )}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className={buttonStyles({ variant: "accent", size: "lg", className: "shrink-0" })}
        >
          {pending ? t("submitting") : t("submit")}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {errorMsg && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {errorMsg}
        </p>
      )}
      <p className="text-xs leading-relaxed text-[var(--color-muted)]">{t("note")}</p>
    </form>
  );
}
