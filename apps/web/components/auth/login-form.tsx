"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { signIn, type AuthResult } from "@/app/[locale]/_actions/auth";
import { buttonStyles } from "@/components/ui/button-variants";
import { trackLogin } from "@/lib/analytics";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const inputCls =
  "h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] pl-11 pr-4 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition focus:border-[var(--color-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/25";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const [state, formAction, pending] = useActionState<AuthResult | null, FormData>(
    async (prev, data) => {
      const result = await signIn(prev, data);
      if (result.ok) trackLogin();
      return result;
    },
    null,
  );

  const errorMsg = (() => {
    if (!state || state.ok) return null;
    if (state.error === "invalid_credentials") return t("errorCredentials");
    if (state.error === "invalid_input") return t("errorInput");
    return t("errorGeneric");
  })();

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="display text-[length:var(--text-headline)] text-[var(--color-ink)]">
          {t("title")}
        </h1>
        <p className="mt-3 text-[var(--color-muted)]">{t("subtitle")}</p>
      </div>

      <form action={formAction} className="mt-8 space-y-4">
        <div className="relative">
          <Mail className="absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]" aria-hidden="true" />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("email")}
            className={inputCls}
          />
        </div>

        <div className="relative">
          <Lock className="absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]" aria-hidden="true" />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            placeholder={t("password")}
            className={inputCls}
          />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className={cn(buttonStyles({ variant: "accent", size: "lg", fullWidth: true }), "mt-2")}
        >
          {pending ? t("loading") : t("submit")}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-[var(--color-blue)] underline-offset-4 hover:underline">
          {t("signupLink")}
        </Link>
      </p>
    </div>
  );
}
