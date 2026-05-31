"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Search } from "lucide-react";
import { buttonStyles } from "@/components/ui/button-variants";

/**
 * `<HeroSearch />` — campo de búsqueda Stitch (light). En móvil apila input +
 * botón full-width (el placeholder ya no se corta); en sm+ es un pill glass.
 * En Fase 2 hace scroll a la grid (sin 404, locale-safe).
 */
export function HeroSearch() {
  const t = useTranslations("hero.search");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    document.getElementById("schoonmakers")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-2 shadow-[var(--shadow-ambient)] transition-colors focus-within:border-[var(--color-blue)] sm:flex-row sm:items-center sm:rounded-full sm:p-1.5 sm:pl-5"
    >
      <label htmlFor="hero-loc" className="flex flex-1 items-center gap-2.5 px-3 sm:px-0">
        <MapPin className="h-5 w-5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
        <span className="sr-only">{t("label")}</span>
        <input
          id="hero-loc"
          name="loc"
          type="text"
          inputMode="text"
          autoComplete="postal-code"
          placeholder={t("placeholder")}
          className="w-full bg-transparent py-2.5 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className={buttonStyles({ variant: "accent", size: "md", className: "w-full shrink-0 sm:w-auto" })}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        {t("submit")}
      </button>
    </form>
  );
}
