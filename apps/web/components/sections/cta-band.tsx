import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { MotionReveal } from "@/components/ui/motion-reveal";

/**
 * `<CtaBand />` — bloque LIMA ÁCIDA. El golpe de máximo impacto antes del
 * footer: titular negro gigante sobre ácido + botón negro. Una sola vez en
 * toda la página — por eso pega.
 */
export async function CtaBand() {
  const t = await getTranslations("cta");

  return (
    <Section variant="acid" spacing="lg" align="center">
      <MotionReveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="kicker text-[var(--color-acid-ink)]/70">{t("kicker")}</span>
        <h2 className="headline mt-5 text-balance text-[length:var(--text-display-1)] text-[var(--color-acid-ink)]">
          {t("title")}
        </h2>
        <Link
          href="/schoonmakers"
          className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--color-noir)] px-8 text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--color-ivory)] transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] hover:bg-[#1a1a1d] active:scale-[0.97]"
        >
          {t("button")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </MotionReveal>
    </Section>
  );
}
