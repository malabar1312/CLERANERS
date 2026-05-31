"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { submitWaitlist, type WaitlistResult } from "@/app/[locale]/_actions/waitlist";
import { buttonStyles } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

/**
 * `<FooterWaitlistForm />` — captura email para la wachtlijst vía Server Action.
 * Estado con `useActionState` (React 19). Si Supabase no está configurado en
 * el entorno, el action devuelve `config_missing` y mostramos error suave.
 */
export function FooterWaitlistForm() {
  const t = useTranslations("footer.waitlist");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<WaitlistResult | null, FormData>(
    submitWaitlist,
    null,
  );

  const success = state?.ok === true;

  const errorMsg = (() => {
    if (!state || state.ok) return null;
    if (state.error === "invalid_email") return t("errorEmail");
    if (state.error === "duplicate") return t("success"); // ya está → tratamos como éxito suave
    return t("errorGeneric");
  })();

  if (success || (state && !state.ok && state.error === "duplicate")) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success-soft)] px-4 py-3.5 text-sm text-[var(--color-ink)]">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
        {t("success")}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2.5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value="footer" />
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
        <label htmlFor="waitlist-email" className="flex-1">
          <span className="sr-only">{t("placeholder")}</span>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("placeholder")}
            aria-invalid={errorMsg ? true : undefined}
            className={cn(
              "h-11 w-full rounded-xl border bg-white px-4 text-[15px] text-[var(--color-ink)]",
              "shadow-[var(--shadow-input)] transition placeholder:text-[var(--color-muted-2)]",
              "focus:border-[var(--color-primary)] focus:shadow-[var(--shadow-input-focus)] focus:outline-none",
              errorMsg ? "border-[var(--color-danger)]" : "border-[var(--color-border)]",
            )}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className={buttonStyles({ variant: "primary", size: "md", className: "shrink-0" })}
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
    </form>
  );
}
