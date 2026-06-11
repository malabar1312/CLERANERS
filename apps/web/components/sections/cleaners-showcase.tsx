import { getTranslations } from "next-intl/server";
import { getCleaners } from "@/lib/data/cleaners";
import { CleanerCarousel } from "./cleaner-carousel";

/**
 * `<CleanersShowcase />` — server wrapper that fetches cleaner data
 * and i18n labels, then renders the client-side 3D carousel.
 * Replaces the old `<CleanersGrid />` on the landing page.
 */
export async function CleanersShowcase() {
  const t = await getTranslations("cleaners");
  const cleaners = (await getCleaners()).slice(0, 8);

  const labels = {
    verified: t("card.verified"),
    perHour: t("card.perHour"),
    viewProfile: t("card.viewProfile"),
    reviewsWord: t("card.reviewsWord"),
    eyebrow: t("eyebrow"),
    title: t("title"),
    lead: t("lead"),
    browseAll: t("browseAll"),
  };

  return <CleanerCarousel cleaners={cleaners} labels={labels} />;
}
