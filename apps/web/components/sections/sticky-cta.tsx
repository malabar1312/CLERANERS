"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { buttonStyles } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

/**
 * `<StickyMobileCta />` — barra fija inferior (solo mobile) que aparece
 * cuando el hero sale del viewport. Observa `#hero-end-sentinel`.
 */
export function StickyMobileCta() {
  const t = useTranslations("stickyCta");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("hero-end-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Mostrar cuando el final del hero ya pasó por encima del viewport.
        setVisible(!!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { rootMargin: "0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 lg:hidden",
        "border-t border-[var(--color-line)] bg-[color:rgb(10_10_11/0.9)] backdrop-blur-xl",
        "px-4 pt-3 pb-[calc(0.75rem+var(--safe-area-bottom))]",
        "transition-all duration-[var(--dur-mid)] ease-[var(--ease-out)]",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <Link
        href="/schoonmakers"
        className={buttonStyles({ variant: "primary", size: "lg", fullWidth: true })}
      >
        {t("label")}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
