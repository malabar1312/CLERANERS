"use client";

import { Star as StarIcon, BadgeCheck, MapPin, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import type { CleanerPreview } from "@/lib/mock/cleaners";

/**
 * `<CleanerCard />` — tarjeta de schoonmaker. Al hacer clic abre el quick-view
 * modal (`?cleanerId=`) preservando el pathname actual (funciona en la landing
 * y en el listado). El modal ofrece "Bekijk volledig profiel" → /schoonmakers/[id].
 *
 * Client component: necesita router para el quick-view sin perder scroll.
 */
export function CleanerCard({
  cleaner,
  labels,
}: {
  cleaner: CleanerPreview;
  labels: { verified: string; perHour: string; reviewsWord: string; viewProfile: string };
}) {
  const router = useRouter();

  // Leemos query/pathname desde `window` en el handler (runtime, client-only)
  // para preservar params existentes SIN el hook useSearchParams — que forzaría
  // un Suspense boundary y rompería el prerender estático de la landing.
  const openQuickView = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("cleanerId", cleaner.id);
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <button
      type="button"
      onClick={openQuickView}
      className="block w-full rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-2"
      aria-label={cleaner.name}
    >
      <Card as="article" variant="white" padding="md" interactive className="flex h-full flex-col">
        <div className="flex items-start gap-3.5">
          {cleaner.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cleaner.image}
              alt={cleaner.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-black/5"
            />
          ) : (
            <AvatarInitials name={cleaner.name} size="lg" tone={cleaner.tone} online={cleaner.online} />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-[var(--color-ink)]">{cleaner.name}</h3>
              {cleaner.verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--color-blue)]" aria-label={labels.verified} />
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--color-muted)]">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {cleaner.hood}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-sm">
          <StarIcon className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
          <span className="font-semibold text-[var(--color-ink)]">{cleaner.rating.toFixed(1)}</span>
          <span className="text-[var(--color-muted)]">·</span>
          <span className="text-[var(--color-muted)]">
            {cleaner.reviews} {labels.reviewsWord}
          </span>
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {cleaner.specialties.slice(0, 3).map((s) => (
            <li key={s} className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--color-slate)]">
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-end justify-between border-t border-[var(--color-line)] pt-4">
          <p className="text-[var(--color-ink)]">
            <span className="text-xl font-bold">€{cleaner.pricePerHour}</span>
            <span className="text-sm text-[var(--color-muted)]">{labels.perHour}</span>
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition-colors group-hover/card:text-[var(--color-blue)]">
            {labels.viewProfile}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/card:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Card>
    </button>
  );
}
