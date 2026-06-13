"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { formatEur } from "@/lib/booking/pricing";
import {
  getConnectStatus,
  startCleanerOnboarding,
  type ConnectStatus,
} from "@/app/[locale]/_actions/cleaner-connect";

/**
 * `<ConnectPayouts />` — tarjeta de uitbetalingen del cleaner.
 *
 * Auto-contenida: lee su estado vía server action (sin prop drilling) y arranca
 * el onboarding Connect al pulsar. El saldo real (Stripe Balance API) llega
 * después; hoy muestra €0 + el estado de la cuenta, que es lo accionable.
 */
export function ConnectPayouts() {
  const t = useTranslations("dashboard.cleaner.earnings.connect");
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getConnectStatus().then(setStatus).catch(() => setStatus({ enabled: true, hasAccount: false, chargesEnabled: false }));
  }, []);

  function onActivate() {
    setError(false);
    startTransition(async () => {
      const res = await startCleanerOnboarding();
      if (res.ok) window.location.href = res.url;
      else setError(true);
    });
  }

  const active = status?.chargesEnabled === true;
  const pendingVerify = status?.hasAccount === true && !active;
  const disabled = status?.enabled === false;

  const body = disabled
    ? t("bodyDisabled")
    : active
      ? t("bodyActive")
      : pendingVerify
        ? t("bodyPending")
        : t("bodyNone");

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)] p-6 text-white shadow-xl">
      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[var(--color-muted-2)]">
          {t("title")}
          {active && <CheckCircle2 className="h-4 w-4 text-[var(--color-blue)]" aria-hidden="true" />}
        </p>
        <h3 className="mb-3 font-display text-4xl font-bold text-white sm:text-5xl">
          {formatEur(0)}
        </h3>
        <p className="text-xs leading-relaxed text-[var(--color-muted-2)]">
          {status == null ? t("loading") : body}
        </p>
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-danger)]" role="alert">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {t("error")}
          </p>
        )}
      </div>

      {status != null && !disabled && !active && (
        <button
          type="button"
          onClick={onActivate}
          disabled={pending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[var(--color-ink)] shadow-lg transition hover:bg-white/90 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              {pendingVerify ? t("ctaResume") : t("ctaStart")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
