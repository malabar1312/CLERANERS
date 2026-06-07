import { getTranslations } from "next-intl/server";
import { Star as StarIcon, BadgeCheck } from "lucide-react";
import { Section } from "@/components/ui/section";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { featuredReviews } from "@/lib/mock/reviews";

/**
 * `<Reviews />` — testimonios, sección surface. Comilla gigante fantasma,
 * estrellas azules, cita en tinta.
 */
export async function Reviews() {
  const t = await getTranslations("reviews");

  return (
    <Section variant="white" containerSize="wide" kicker={t("eyebrow")} title={t("title")} lead={t("lead")}>
      <div className="mb-12 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-5 py-2.5 text-sm shadow-sm ring-1 ring-black/5">
        <StarIcon className="h-5 w-5 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
        <strong className="font-bold text-black">4,9</strong>
        <span className="text-black/60">· {t("aggregate")}</span>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featuredReviews.slice(0, 3).map((review, i) => (
          <MotionReveal key={review.id} delay={i * 0.08}>
            <div className="relative flex h-full flex-col justify-between rounded-[2rem] bg-[var(--bg)] p-8 sm:p-10">
              <span
                className="pointer-events-none absolute right-8 top-6 font-display text-8xl leading-none text-black/[0.03] select-none"
                aria-hidden="true"
              >
                &rdquo;
              </span>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1" aria-label={t("starsLabel", { count: review.rating })}>
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <StarIcon key={idx} className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-blue)]/10 px-2.5 py-1 text-xs font-bold text-[var(--color-blue)]">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("verifiedBooking")}
                  </span>
                </div>

                <blockquote className="mt-8 text-lg leading-relaxed text-black/80">
                  &quot;{review.quote}&quot;
                </blockquote>
              </div>

              <figcaption className="mt-8 flex items-center gap-4">
                {review.image ? (
                  <img src={review.image} alt={review.author} className="h-12 w-12 rounded-full object-cover shadow-sm ring-1 ring-black/5" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/10 text-sm font-semibold text-black" aria-hidden="true">
                    {review.author.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")}
                  </span>
                )}
                <div>
                  <p className="font-bold text-black">{review.author}</p>
                  <p className="text-sm text-black/50">
                    {review.hood} · {review.date}
                  </p>
                </div>
              </figcaption>
            </div>
          </MotionReveal>
        ))}
      </div>
    </Section>
  );
}
