"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { requestPasswordReset, type ResetResult } from "@/app/[locale]/_actions/auth";
import { buttonStyles } from "@/components/ui/button-variants";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const inputCls =
  "h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] pl-11 pr-4 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition-all duration-200 focus:border-[var(--color-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/25 focus:shadow-[0_0_0_4px_rgb(0_102_255/0.08)]";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [state, formAction, pending] = useActionState<ResetResult | null, FormData>(requestPasswordReset, null);

  if (state?.ok) {
    return (
      <div className="w-full max-w-sm text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--color-blue)]" />
        <h2 className="headline mt-4 text-xl text-[var(--color-ink)]">{t("sentTitle")}</h2>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{t("sentBody")}</p>
        <Link href="/login" className={cn(buttonStyles({ variant: "outline", size: "lg" }), "mt-6")}>
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  const errorMsg = state && !state.ok ? t("errorGeneric") : null;

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="display text-[length:var(--text-headline)] text-[var(--color-ink)]">{t("title")}</h1>
        <p className="mt-3 text-[var(--color-muted)]">{t("subtitle")}</p>
      </div>

      <form action={formAction} className="mt-8 space-y-4">
        <div className="relative">
          <Mail className="absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]" aria-hidden="true" />
          <input name="email" type="email" required autoComplete="email" placeholder={t("email")} className={inputCls} />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {errorMsg}
          </div>
        )}

        <button type="submit" disabled={pending} className={cn(buttonStyles({ variant: "accent", size: "lg", fullWidth: true }), "mt-2")}>
          {pending ? t("loading") : t("submit")}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        <Link href="/login" className="font-medium text-[var(--color-blue)] underline-offset-4 hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
