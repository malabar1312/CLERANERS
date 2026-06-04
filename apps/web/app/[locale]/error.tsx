"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui/button-variants";
import { Link } from "@/i18n/navigation";

/**
 * Global error boundary — catches unhandled rendering errors.
 * Stitch Quiet-Luxury: quiet, centered, no blame, clear actions.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Log to console in dev; in prod this would go to Sentry/etc.
    if (process.env.NODE_ENV !== "production") {
      console.error("[error boundary]", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[var(--color-white)] text-[var(--color-ink)]">
      <Container size="sm" className="flex flex-col items-center py-20 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-danger-soft)]">
          <AlertTriangle className="h-8 w-8 text-[var(--color-danger)]" aria-hidden="true" />
        </span>
        <h1 className="display mt-6 text-[length:var(--text-headline)] text-[var(--color-ink)]">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-md text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
          {t("body")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className={buttonStyles({ variant: "accent", size: "lg" })}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t("retry")}
          </button>
          <Link href="/" className={buttonStyles({ variant: "outline", size: "lg" })}>
            <Home className="h-4 w-4" aria-hidden="true" />
            {t("home")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
