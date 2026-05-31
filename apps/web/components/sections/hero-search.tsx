"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Search } from "lucide-react";
import { buttonStyles } from "@/components/ui/button-variants";

/**
 * `<HeroSearch />` — barra de búsqueda del hero.
 *
 * En Fase 2 no existe aún la página de listado (`/schoonmakers` llega en
 * Fase 4), así que el submit hace scroll suave a la grid de schoonmakers
 * de la propia landing (`#schoonmakers`). Esto evita un 404 y mantiene el
 * locale (no navega). Cuando exista el listado real, cambiar `onSubmit`
 * por `router.push({ pathname: "/schoonmakers", query: { loc } })`.
 */
export function HeroSearch() {
  const t = useTranslations("hero.search");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = document.getElementById("schoonmakers");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-9 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-white/12 bg-white/[0.07] p-2 backdrop-blur-md sm:flex-row sm:items-center sm:rounded-full sm:pl-5"
    >
      <label htmlFor="hero-loc" className="flex flex-1 items-center gap-2.5">
        <MapPin className="h-5 w-5 shrink-0 text-[var(--color-blue-light)]" aria-hidden="true" />
        <span className="sr-only">{t("label")}</span>
        <input
          id="hero-loc"
          name="loc"
          type="text"
          inputMode="text"
          autoComplete="postal-code"
          placeholder={t("placeholder")}
          className="w-full bg-transparent py-2.5 text-[15px] text-white placeholder:text-white/45 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className={buttonStyles({ variant: "hero", size: "md", className: "rounded-full sm:px-6" })}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        {t("submit")}
      </button>
    </form>
  );
}
