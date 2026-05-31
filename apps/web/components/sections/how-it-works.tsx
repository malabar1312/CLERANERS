import { getTranslations } from "next-intl/server";
import { Search, UserCheck, CalendarCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { asArray } from "@/lib/utils";

type Step = { number: string; title: string; body: string };

const icons: LucideIcon[] = [Search, UserCheck, CalendarCheck];

/**
 * `<HowItWorks />` — sección surface (off-white). 3 pasos con número gigante
 * fantasma, icono en cuadro azul tenue.
 */
export async function HowItWorks() {
  const t = await getTranslations("howItWorks");
  const steps = asArray<Step>(t.raw("steps"));

  return (
    <Section id="hoe-het-werkt" variant="surface" kicker={t("eyebrow")} title={t("title")} lead={t("lead")}>
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = icons[i] ?? Search;
          return (
            <MotionReveal as="li" key={step.number} delay={i * 0.08}>
              <Card variant="white" padding="lg" interactive className="h-full">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-blue-soft)] text-[var(--color-blue)]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="font-display text-6xl leading-none text-[var(--color-surface-3)] select-none" aria-hidden="true">
                    {step.number}
                  </span>
                </div>
                <h3 className="headline mt-7 text-3xl text-[var(--color-ink)]">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">{step.body}</p>
              </Card>
            </MotionReveal>
          );
        })}
      </ol>
    </Section>
  );
}
