"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { submitWaitlist, type WaitlistResult } from "@/app/[locale]/_actions/waitlist";
import { buttonStyles } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

/**
 * `<HeroWaitlist />` — captura de demanda en el hero (waitlist-first).
 *
 * Un solo campo (email) = mínima fricción = máxima conversión (principio CRO).
 * Reutiliza el Server Action `submitWaitlist` existente (cero cambios al
 * backend → compatibilidad total). El booking sigue funcionando intacto en los
 * perfiles. Honeypot anti-spam heredado del action. Sin JS pesado: un único
 * island cliente, igual de liviano que el `<HeroSearch>` que reemplaza.
 */
export function HeroWaitlist({
  onFocus,
  onBlur,
}: {
  onFocus?: () => void;
  onBlur?: () => void;
} = {}) {
  const t = useTranslations("hero.waitlist");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<WaitlistResult | null, FormData>(
    submitWaitlist,
    null,
  );

  // En dev (sin Supabase) el action devuelve `config_missing`; lo tratamos como
  // éxito suave para un demo limpio. En PRODUCCIÓN mal configurado, `config_missing`
  // cae en error fuerte (nunca tragamos emails en silencio). Con Supabase OK no dispara.
  const isDev = process.env.NODE_ENV !== "production";
  const softSuccess =
    state != null &&
    !state.ok &&
    (state.error === "duplicate" || (state.error === "config_missing" && isDev));
  const success = state?.ok === true || softSuccess;

  const errorMsg = (() => {
    if (!state || state.ok) return null;
    if (state.error === "duplicate") return null; // ya está → éxito suave
    if (state.error === "config_missing" && isDev) return null; // dev → éxito suave
    if (state.error === "invalid_email") return t("errorEmail");
    return t("errorGeneric"); // incl. config_missing en producción
  })();

  if (success) {
    return (
      <div className="mt-8 flex w-full max-w-md items-center gap-2.5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] px-4 py-3.5 text-sm text-[var(--color-ink)] shadow-[var(--shadow-soft)]">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
        {t("success")}
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-md">
      <form
        action={formAction}
        className="flex w-full flex-col gap-2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-2 shadow-[var(--shadow-ambient)] transition-colors focus-within:border-[var(--color-blue)] sm:flex-row sm:items-center sm:rounded-full sm:p-1.5 sm:pl-5"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="source" value="hero" />
        {/* Honeypot — invisible, fuera del tab order */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <label htmlFor="hero-waitlist-email" className="flex-1 px-3 sm:px-0">
          <span className="sr-only">{t("placeholder")}</span>
          <input
            id="hero-waitlist-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("placeholder")}
            aria-invalid={errorMsg ? true : undefined}
            onFocus={onFocus}
            onBlur={onBlur}
            className="w-full bg-transparent py-2.5 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none"
          />
        </label>
        <MagneticWrapper>
          <button
            type="submit"
            disabled={pending}
            className={buttonStyles({ variant: "accent", size: "md", className: "w-full shrink-0 sm:w-auto" })}
          >
            {pending ? t("submitting") : t("cta")}
            {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </MagneticWrapper>
      </form>

      <p className={cn("mt-2.5 px-1 text-sm", errorMsg ? "text-[var(--color-danger)]" : "text-[var(--color-muted)]")} role={errorMsg ? "alert" : undefined}>
        {errorMsg ?? t("micro")}
      </p>
    </div>
  );
}
