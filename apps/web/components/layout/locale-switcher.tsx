"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * `<LocaleSwitcher />` — toggle minimalista NL/EN en el nav.
 * Cambia el locale preservando el pathname actual.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(target: "nl" | "en") {
    if (target === locale) return;
    router.replace(pathname, { locale: target });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[var(--color-line)] p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => switchTo("nl")}
        className={cn(
          "rounded-full px-2 py-1 transition-all duration-200",
          locale === "nl"
            ? "bg-[var(--color-ink)] text-[var(--color-white)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
        )}
        aria-label="Nederlands"
        aria-pressed={locale === "nl"}
      >
        NL
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={cn(
          "rounded-full px-2 py-1 transition-all duration-200",
          locale === "en"
            ? "bg-[var(--color-ink)] text-[var(--color-white)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
        )}
        aria-label="English"
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
