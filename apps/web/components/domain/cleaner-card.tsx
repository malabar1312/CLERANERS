import { Star as StarIcon, BadgeCheck, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import type { CleanerPreview } from "@/lib/mock/cleaners";

/**
 * `<CleanerCard />` — tarjeta de schoonmaker, noir editorial. CTA real llega
 * en Fase 3; por ahora chip `soon` para no sugerir flujo roto.
 */
export function CleanerCard({
  cleaner,
  labels,
}: {
  cleaner: CleanerPreview;
  labels: { verified: string; perHour: string; soon: string; reviewsWord: string };
}) {
  return (
    <Card as="article" variant="noir" padding="md" interactive className="flex h-full flex-col">
      <div className="flex items-start gap-3.5">
        <AvatarInitials name={cleaner.name} size="lg" tone={cleaner.tone} online={cleaner.online} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold text-[var(--color-ivory)]">{cleaner.name}</h3>
            {cleaner.verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--color-acid)]" aria-label={labels.verified} />
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--color-ivory-dim)]">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {cleaner.hood}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-sm">
        <StarIcon className="h-4 w-4 fill-[var(--color-acid)] text-[var(--color-acid)]" aria-hidden="true" />
        <span className="font-semibold text-[var(--color-ivory)]">{cleaner.rating.toFixed(1)}</span>
        <span className="text-[var(--color-ivory-dim)]">·</span>
        <span className="text-[var(--color-ivory-dim)]">
          {cleaner.reviews} {labels.reviewsWord}
        </span>
      </div>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {cleaner.specialties.slice(0, 3).map((s) => (
          <li key={s} className="rounded-full border border-[var(--color-line)] bg-[var(--color-noir-3)] px-2.5 py-1 text-xs font-medium text-[var(--color-ivory-2)]">
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-end justify-between border-t border-[var(--color-line)] pt-4">
        <p className="text-[var(--color-ivory)]">
          <span className="text-xl font-bold">€{cleaner.pricePerHour}</span>
          <span className="text-sm text-[var(--color-ivory-dim)]">{labels.perHour}</span>
        </p>
        <span className="kicker rounded-full border border-[var(--color-line)] px-3 py-1.5 text-[var(--color-ivory-dim)]">
          {labels.soon}
        </span>
      </div>
    </Card>
  );
}
