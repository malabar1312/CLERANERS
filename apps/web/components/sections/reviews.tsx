import { getTranslations } from "next-intl/server";
import { Star as StarIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { featuredReviews } from "@/lib/mock/reviews";

/**
 * `<Reviews />` — testimonios. Cada card con estrellas, comilla gigante
 * (Instrument Serif), texto italic y autor con avatar de iniciales.
 */
export async function Reviews() {
  const t = await getTranslations("reviews");

  return (
    <Section variant="soft" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {featuredReviews.slice(0, 3).map((review, i) => (
          <MotionReveal key={review.id} delay={i * 0.08}>
            <Card variant="elevated" padding="lg" className="relative flex h-full flex-col">
              <span
                className="font-display pointer-events-none absolute -top-2 right-5 text-7xl leading-none text-[var(--color-blue-soft)] select-none"
                aria-hidden="true"
              >
                &rdquo;
              </span>

              {/* Stars */}
              <div className="flex gap-0.5" aria-label={t("starsLabel", { count: review.rating })}>
                {Array.from({ length: review.rating }).map((_, idx) => (
                  <StarIcon
                    key={idx}
                    className="h-4 w-4 fill-[var(--color-warning)] text-[var(--color-warning)]"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-display relative mt-4 flex-1 text-pretty text-lg leading-snug text-[var(--color-ink-2)] italic">
                {review.quote}
              </blockquote>

              {/* Author */}
              <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--color-border-soft)] pt-5">
                <AvatarInitials name={review.author} size="md" tone={review.tone} />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{review.author}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {review.hood} · {review.date}
                  </p>
                </div>
              </figcaption>
            </Card>
          </MotionReveal>
        ))}
      </div>
    </Section>
  );
}
