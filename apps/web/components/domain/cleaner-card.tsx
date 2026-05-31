import { Star as StarIcon, BadgeCheck, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import type { CleanerPreview } from "@/lib/mock/cleaners";

/**
 * `<CleanerCard />` — tarjeta de un schoonmaker en el grid de la landing.
 *
 * El CTA "Bekijk profiel" está deshabilitado hasta Fase 3 (booking real):
 * mostramos el copy `soon` para no sugerir un flujo roto.
 */
export function CleanerCard({
  cleaner,
  labels,
}: {
  cleaner: CleanerPreview;
  labels: { verified: string; perHour: string; soon: string; reviewsWord: string };
}) {
  return (
    <Card as="article" variant="elevated" padding="md" interactive className="flex h-full flex-col">
      <div className="flex items-start gap-3.5">
        <AvatarInitials name={cleaner.name} size="lg" tone={cleaner.tone} online={cleaner.online} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-bold tracking-tight text-[var(--color-ink)]">
              {cleaner.name}
            </h3>
            {cleaner.verified && (
              <BadgeCheck
                className="h-4 w-4 shrink-0 text-[var(--color-primary)]"
                aria-label={labels.verified}
              />
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--color-muted)]">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {cleaner.hood}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="mt-4 flex items-center gap-1.5 text-sm">
        <StarIcon className="h-4 w-4 fill-[var(--color-warning)] text-[var(--color-warning)]" aria-hidden="true" />
        <span className="font-semibold text-[var(--color-ink)]">{cleaner.rating.toFixed(1)}</span>
        <span className="text-[var(--color-muted-2)]">·</span>
        <span className="text-[var(--color-muted)]">
          {cleaner.reviews} {labels.reviewsWord}
        </span>
      </div>

      {/* Specialties */}
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {cleaner.specialties.slice(0, 3).map((s) => (
          <li
            key={s}
            className="rounded-full bg-[var(--color-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-3)]"
          >
            {s}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-5 flex items-end justify-between border-t border-[var(--color-border-soft)] pt-4">
        <p className="text-[var(--color-ink)]">
          <span className="text-xl font-bold">€{cleaner.pricePerHour}</span>
          <span className="text-sm text-[var(--color-muted)]">{labels.perHour}</span>
        </p>
        <span className="rounded-full bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)]">
          {labels.soon}
        </span>
      </div>
    </Card>
  );
}
