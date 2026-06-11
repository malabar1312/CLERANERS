"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, X } from "lucide-react";
import { CleanerCard } from "@/components/domain/cleaner-card";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { Container } from "@/components/layout/container";
import {
  filterCleaners,
  type SortKey,
  type CleanerPreview,
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
          "h-11 appearance-none rounded-full border border-[var(--color-line)] bg-[var(--color-white)] pr-9 pl-4",
          "text-sm font-medium text-[var(--color-ink)] transition-colors",
          "hover:border-[var(--color-ink)] focus:border-[var(--color-blue)] focus:outline-none",
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[var(--color-muted)]" aria-hidden="true" />
    </label>
  );
}

/**
 * `<CleanersBrowser />` — listado filtrable de schoonmakers (mock en Fase 2,
 * Supabase en Fase 4). Filtros barrio / especialidad / orden, client-side.
 */
export function CleanersBrowser({
  cleaners,
  initialHood,
  searchDate,
  searchTime,
}: {
  cleaners: CleanerPreview[];
  /** Barrio ya validado contra el catálogo (viene de la búsqueda del hero). */
  initialHood?: string;
  /** Contexto de búsqueda (ISO yyyy-mm-dd) — chip informativo hasta que el filtro real exista. */
  searchDate?: string;
  searchTime?: string;
}) {
  const tf = useTranslations("schoonmakersPage");
  const tc = useTranslations("cleaners");
  const [hood, setHood] = useState(initialHood ?? "");
  const [specialty, setSpecialty] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");
  const [showContext, setShowContext] = useState(Boolean(searchDate || searchTime));

  const contextLabel = [
    searchDate
      ? new Date(`${searchDate}T00:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })
      : null,
    searchTime ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  const cardLabels = {
    verified: tc("card.verified"),
    perHour: tc("card.perHour"),
    viewProfile: tc("card.viewProfile"),
    reviewsWord: tc("card.reviewsWord"),
  };

  // Filtros derivados del catálogo recibido (real o mock).
  const cleanerHoods = useMemo(
    () => Array.from(new Set(cleaners.map((c) => c.hood))).sort(),
    [cleaners],
  );
  const cleanerSpecialties = useMemo(
    () => Array.from(new Set(cleaners.flatMap((c) => c.specialties))).sort(),
    [cleaners],
  );

  const results = useMemo(
    () => filterCleaners(cleaners, { hood: hood || undefined, specialty: specialty || undefined, sort }),
    [cleaners, hood, specialty, sort],
  );

  const hasFilters = hood !== "" || specialty !== "" || sort !== "rating";
  const reset = () => {
    setHood("");
    setSpecialty("");
    setSort("rating");
  };

  return (
    <section className="bg-[var(--color-white)] pb-[var(--space-section)]">
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
            {showContext && contextLabel && (
              <span className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--color-blue)]/30 bg-[var(--color-blue)]/5 px-4 text-sm font-medium text-[var(--color-blue)]">
                {contextLabel}
                <button
                  type="button"
                  onClick={() => setShowContext(false)}
                  aria-label={tf("filters.clear")}
                  className="-mr-1 rounded-full p-0.5 transition-colors hover:bg-[var(--color-blue)]/10"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-blue)]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {tf("filters.clear")}
              </button>
            )}
          </div>
          <p className="label text-[var(--color-muted)]" aria-live="polite">
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
          <div className="mt-8">
            <EmptyState
              title={tf("empty")}
              body={tf("emptyBody")}
              action={
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm font-medium text-[var(--color-blue)] underline-offset-4 hover:underline"
                >
                  {tf("emptyAction")}
                </button>
              }
            />
          </div>
        )}
      </Container>
    </section>
  );
}
