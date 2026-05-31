"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { MapPin, ArrowRight } from "lucide-react";
import { buttonStyles } from "@/components/ui/button-variants";

/**
 * `<HeroSearch />` — campo de búsqueda noir editorial. Hairline, transparente,
 * submit en lima ácida. En Fase 2 hace scroll a la grid de schoonmakers
 * (sin 404, locale-safe). Fase 4: router.push a /schoonmakers.
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
      className="mt-10 flex w-full max-w-xl items-center gap-2 rounded-full border border-[var(--color-line)] bg-[color:rgb(245_243_239/0.03)] p-1.5 pl-5 backdrop-blur-sm transition-colors focus-within:border-[color:rgb(245_243_239/0.35)]"
    >
      <label htmlFor="hero-loc" className="flex flex-1 items-center gap-2.5">
        <MapPin className="h-5 w-5 shrink-0 text-[var(--color-acid)]" aria-hidden="true" />
        <span className="sr-only">{t("label")}</span>
        <input
          id="hero-loc"
          name="loc"
          type="text"
          inputMode="text"
          autoComplete="postal-code"
          placeholder={t("placeholder")}
          className="w-full bg-transparent py-2.5 text-[15px] text-[var(--color-ivory)] placeholder:text-[var(--color-ivory-dim)] focus:outline-none"
        />
      </label>
      <button type="submit" className={buttonStyles({ variant: "primary", size: "md", className: "shrink-0" })}>
        {t("submit")}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
