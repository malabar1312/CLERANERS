"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitContact, type ContactResult } from "@/app/[locale]/_actions/contact";
import { buttonStyles } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const inputCls =
  "h-12 w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] px-4 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition-all duration-200 focus:border-[var(--color-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/25 focus:shadow-[0_0_0_4px_rgb(0_102_255/0.08)]";

export function ContactForm() {
  const t = useTranslations("contactPage.form");
  const [state, formAction, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);

  if (state?.ok) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-[var(--color-ink)]">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
        <p>{t("success")}</p>
      </div>
    );
  }

  const errorMsg = state && !state.ok ? (state.error === "invalid_input" ? t("errorInput") : t("errorGeneric")) : null;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" type="text" required minLength={2} placeholder={t("name")} className={inputCls} autoComplete="name" />
        <input name="email" type="email" required placeholder={t("email")} className={inputCls} autoComplete="email" />
      </div>
      <input name="subject" type="text" required minLength={2} placeholder={t("subject")} className={inputCls} />
      <textarea name="message" required minLength={10} maxLength={2000} rows={5} placeholder={t("message")} className={cn(inputCls, "h-auto py-3")} />

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {errorMsg}
        </div>
      )}

      <button type="submit" disabled={pending} className={buttonStyles({ variant: "accent", size: "lg" })}>
        {pending ? t("sending") : t("submit")}
        {!pending && <Send className="h-4 w-4" aria-hidden="true" />}
      </button>
    </form>
  );
}
