import { Star as StarIcon, BadgeCheck, MapPin, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import type { CleanerPreview } from "@/lib/mock/cleaners";

/**
 * `<CleanerCard />` — tarjeta de schoonmaker, Stitch Quiet-Luxury (blanca). La
 * tarjeta entera es un link al perfil (`/schoonmakers/[id]`).
 */
export function CleanerCard({
  cleaner,
  labels,
}: {
  cleaner: CleanerPreview;
  labels: { verified: string; perHour: string; reviewsWord: string; viewProfile: string };
}) {
  return (
    <Link href={`/schoonmakers/${cleaner.id}`} className="block focus:outline-none" aria-label={cleaner.name}>
      <Card as="article" variant="white" padding="md" interactive className="flex h-full flex-col">
        <div className="flex items-start gap-3.5">
          <AvatarInitials name={cleaner.name} size="lg" tone={cleaner.tone} online={cleaner.online} />
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
    </Link>
  );
}
