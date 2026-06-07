"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { User, Mail, Lock, ArrowRight, AlertCircle, Home, Sparkles } from "lucide-react";
import { signUp, type AuthResult } from "@/app/[locale]/_actions/auth";
import { buttonStyles } from "@/components/ui/button-variants";
import { trackSignup } from "@/lib/analytics";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const inputCls =
  "h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] pl-11 pr-4 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition-all duration-200 focus:border-[var(--color-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/25 focus:shadow-[0_0_0_4px_rgb(0_102_255/0.08)]";

type SignupRole = "customer" | "cleaner";

export function SignupForm({ initialRole = "customer" }: { initialRole?: SignupRole }) {
  const t = useTranslations("auth.signup");
  const [role, setRole] = useState<SignupRole>(initialRole);
  const [state, formAction, pending] = useActionState<AuthResult | null, FormData>(
    async (prev, data) => {
      const result = await signUp(prev, data);
      if (result.ok) trackSignup();
      return result;
    },
    null,
  );

  const errorMsg = (() => {
    if (!state || state.ok) return null;
    if (state.error === "email_taken") return t("errorEmailTaken");
    if (state.error === "weak_password") return t("errorWeakPassword");
    if (state.error === "invalid_input") return t("errorInput");
    return t("errorGeneric");
  })();

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="display text-[length:var(--text-headline)] text-[var(--color-ink)]">
          {t("title")}
        </h1>
        <p className="mt-3 text-[var(--color-muted)]">
          {role === "cleaner" ? t("subtitleCleaner") : t("subtitle")}
        </p>
      </div>

      {/* Role toggle — segmented control */}
      <div
        role="tablist"
        aria-label={t("roleLabel")}
        className="mt-7 grid grid-cols-2 gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={role === "customer"}
          onClick={() => setRole("customer")}
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-200",
            role === "customer"
              ? "bg-[var(--color-white)] text-[var(--color-ink)] shadow-[var(--shadow-xs)]"
              : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
          )}
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          {t("roleCustomer")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={role === "cleaner"}
          onClick={() => setRole("cleaner")}
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-200",
            role === "cleaner"
              ? "bg-[var(--color-white)] text-[var(--color-ink)] shadow-[var(--shadow-xs)]"
              : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
          )}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {t("roleCleaner")}
        </button>
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        {/* Role hidden field — sincronizado al toggle */}
        <input type="hidden" name="role" value={role} />

        {/* Honeypot — invisible para humanos, bots lo rellenan.
            `aria-hidden` + `tabIndex=-1` + `autoComplete=off` para que
            password managers no lo toquen. Server Action lo rechaza si tiene valor. */}
        <div className="absolute -left-[10000px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website (laat leeg)</label>
          <input
            id="website"
            name="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            defaultValue=""
          />
        </div>
        <div className="relative">
          <User className="absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]" aria-hidden="true" />
          <input
            name="name"
            type="text"
            required
            minLength={2}
            autoComplete="name"
            placeholder={t("name")}
            className={inputCls}
          />
        </div>

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
            minLength={10}
            autoComplete="new-password"
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
          {pending
            ? t("loading")
            : role === "cleaner"
              ? t("submitCleaner")
              : t("submit")}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium text-[var(--color-blue)] underline-offset-4 hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
