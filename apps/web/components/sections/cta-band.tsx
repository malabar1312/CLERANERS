import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { MotionReveal } from "@/components/ui/motion-reveal";

/**
 * `<CtaBand />` — bloque OSCURO de cierre. El golpe de máximo impacto antes del
 * footer: titular gigante sobre fondo oscuro + botón azul eléctrico. Una sola
 * vez en toda la página — por eso pega.
 */
export async function CtaBand() {
  const t = await getTranslations("cta");

  return (
    <Section variant="dark" spacing="md" align="center">
      <MotionReveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="label text-[var(--color-blue)]">{t("kicker")}</span>
        <h2 className="headline mt-5 text-balance text-[length:var(--text-display)] text-[var(--color-dark-ink)]">
          {t("title")}
        </h2>
        <Link
          href="/schoonmakers"
          className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] px-8 font-display font-medium text-[var(--color-blue-ink)] transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] hover:bg-[var(--color-blue-2)] active:scale-[0.97]"
        >
          {t("button")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </MotionReveal>
    </Section>
  );
}
