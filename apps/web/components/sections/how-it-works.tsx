import { getTranslations } from "next-intl/server";
import { Search, UserCheck, CalendarCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
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
    <Section id="hoe-het-werkt" variant="white" containerSize="wide" kicker={t("eyebrow")} title={t("title")} lead={t("lead")}>
      <ol className="mt-12 grid gap-12 lg:grid-cols-3 lg:gap-16">
        {steps.map((step, i) => {
          const Icon = icons[i] ?? Search;
          return (
            <MotionReveal as="li" key={step.number} delay={i * 0.1} className="group relative">
              <div className="flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/[0.03] text-[var(--color-blue)] transition-colors group-hover:bg-[var(--color-blue)] group-hover:text-white">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="font-display text-8xl font-black text-black/[0.03] transition-colors group-hover:text-black/[0.05]" aria-hidden="true">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-black">{step.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-black/60">{step.body}</p>
              </div>
            </MotionReveal>
          );
        })}
      </ol>
    </Section>
  );
}
