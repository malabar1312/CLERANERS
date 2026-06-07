"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * `<CookieBanner>` — GDPR-compliant cookie consent banner.
 * Slides up from bottom-left after 1.5s delay.
 * Stores consent in localStorage as "accepted" | "declined".
 * Text is i18n-ized via the `cookieBanner` namespace.
 */
export function CookieBanner() {
  const t = useTranslations("cookieBanner");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg sm:bottom-6 sm:left-6 sm:right-auto"
        >
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-ambient)] sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-start gap-3 sm:items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-soft)] text-[var(--color-blue)]">
                <Cookie className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm leading-relaxed text-[var(--color-slate)]">
                {t("message")}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={decline}
                className="rounded-xl px-3.5 py-2 text-sm font-medium text-[var(--color-slate)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
              >
                {t("decline")}
              </button>
              <button
                onClick={accept}
                className="rounded-xl bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-xs)] transition-colors hover:bg-[var(--color-blue)]"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
