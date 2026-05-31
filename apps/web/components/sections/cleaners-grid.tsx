import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { CleanerCard } from "@/components/domain/cleaner-card";
import { buttonStyles } from "@/components/ui/button-variants";
import { featuredCleaners } from "@/lib/mock/cleaners";

/**
 * `<CleanersGrid />` — grid de schoonmakers destacados (mock en Fase 2,
 * Supabase en Fase 4). 1/2/3 columnas responsive.
 */
export async function CleanersGrid() {
  const t = await getTranslations("cleaners");
  const labels = {
    verified: t("card.verified"),
    perHour: t("card.perHour"),
    viewProfile: t("card.viewProfile"),
    reviewsWord: t("card.reviewsWord"),
  };

  return (
    <Section
      id="schoonmakers"
      variant="noir"
      containerSize="wide"
      kicker={t("eyebrow")}
      title={t("title")}
      lead={t("lead")}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {featuredCleaners.map((cleaner, i) => (
          <MotionReveal key={cleaner.id} delay={(i % 4) * 0.06}>
            <CleanerCard cleaner={cleaner} labels={labels} />
          </MotionReveal>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link href="/schoonmakers" className={buttonStyles({ variant: "secondary", size: "lg" })}>
          {t("browseAll")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </Section>
  );
}
