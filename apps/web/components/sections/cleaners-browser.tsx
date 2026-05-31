"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, X } from "lucide-react";
import { CleanerCard } from "@/components/domain/cleaner-card";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { Container } from "@/components/layout/container";
import {
  featuredCleaners,
  filterCleaners,
  cleanerHoods,
  cleanerSpecialties,
  type SortKey,
} from "@/lib/mock/cleaners";
import { cn } from "@/lib/utils";

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 appearance-none rounded-full border border-[var(--color-line)] bg-[var(--color-noir-2)] pr-9 pl-4",
          "text-sm font-medium text-[var(--color-ivory)] transition-colors",
          "hover:border-[color:rgb(245_243_239/0.3)] focus:border-[var(--color-acid)] focus:outline-none",
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[var(--color-ivory-dim)]" aria-hidden="true" />
    </label>
  );
}

/**
 * `<CleanersBrowser />` — listado filtrable de schoonmakers (mock en Fase 2,
 * Supabase en Fase 4). Filtros barrio / especialidad / orden, client-side.
 */
export function CleanersBrowser() {
  const tf = useTranslations("schoonmakersPage");
  const tc = useTranslations("cleaners");
  const [hood, setHood] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");

  const cardLabels = {
    verified: tc("card.verified"),
    perHour: tc("card.perHour"),
    viewProfile: tc("card.viewProfile"),
    reviewsWord: tc("card.reviewsWord"),
  };

  const results = useMemo(
    () => filterCleaners(featuredCleaners, { hood: hood || undefined, specialty: specialty || undefined, sort }),
    [hood, specialty, sort],
  );

  const hasFilters = hood !== "" || specialty !== "" || sort !== "rating";
  const reset = () => {
    setHood("");
    setSpecialty("");
    setSort("rating");
  };

  return (
    <section className="bg-[var(--color-noir)] pb-[var(--space-section-lg)]">
      <Container size="wide">
        {/* Filter bar */}
        <div className="flex flex-col gap-4 border-y border-[var(--color-line)] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <Select label={tf("filters.hood")} value={hood} onChange={setHood}>
              <option value="">{tf("filters.allHoods")}</option>
              {cleanerHoods.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </Select>
            <Select label={tf("filters.specialty")} value={specialty} onChange={setSpecialty}>
              <option value="">{tf("filters.allSpecialties")}</option>
              {cleanerSpecialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Select label={tf("filters.sort")} value={sort} onChange={(v) => setSort(v as SortKey)}>
              <option value="rating">{tf("filters.sortRating")}</option>
              <option value="price-asc">{tf("filters.sortPriceAsc")}</option>
              <option value="price-desc">{tf("filters.sortPriceDesc")}</option>
            </Select>
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[var(--color-ivory-dim)] transition-colors hover:text-[var(--color-acid)]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {tf("filters.clear")}
              </button>
            )}
          </div>
          <p className="kicker text-[var(--color-ivory-dim)]" aria-live="polite">
            {tf("count", { count: results.length })}
          </p>
        </div>

        {/* Grid / empty */}
        {results.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((cleaner, i) => (
              <MotionReveal key={cleaner.id} delay={(i % 4) * 0.05}>
                <CleanerCard cleaner={cleaner} labels={cardLabels} />
              </MotionReveal>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-4 py-16 text-center">
            <p className="headline text-2xl text-[var(--color-ivory)]">{tf("empty")}</p>
            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium text-[var(--color-acid)] underline-offset-4 hover:underline"
            >
              {tf("emptyAction")}
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
