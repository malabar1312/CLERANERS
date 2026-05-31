import { getTranslations } from "next-intl/server";
import { Star as StarIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { featuredReviews } from "@/lib/mock/reviews";

/**
 * `<Reviews />` — testimonios, sección PAPEL. Comilla gigante Anton, estrellas
 * ácidas, cita en tinta.
 */
export async function Reviews() {
  const t = await getTranslations("reviews");

  return (
    <Section variant="paper" kicker={t("eyebrow")} title={t("title")} lead={t("lead")}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {featuredReviews.slice(0, 3).map((review, i) => (
          <MotionReveal key={review.id} delay={i * 0.08}>
            <Card variant="paper" padding="lg" className="relative flex h-full flex-col">
              <span
                className="font-display pointer-events-none absolute top-3 right-5 text-7xl leading-none text-[var(--color-paper-2)] select-none"
                aria-hidden="true"
              >
                &rdquo;
              </span>

              <div className="flex gap-0.5" aria-label={t("starsLabel", { count: review.rating })}>
                {Array.from({ length: review.rating }).map((_, idx) => (
                  <StarIcon key={idx} className="h-4 w-4 fill-[var(--color-paper-ink)] text-[var(--color-paper-ink)]" aria-hidden="true" />
                ))}
              </div>

              <blockquote className="relative mt-5 flex-1 text-pretty text-[17px] leading-relaxed text-[var(--color-paper-ink)]">
                {review.quote}
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--color-paper-line)] pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-paper-ink)] text-sm font-semibold text-[var(--color-paper)]" aria-hidden="true">
                  {review.author.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-paper-ink)]">{review.author}</p>
                  <p className="text-xs text-[var(--color-paper-dim)]">
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
