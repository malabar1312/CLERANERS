import { getTranslations } from "next-intl/server";
import { Search, UserCheck, CalendarCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { asArray } from "@/lib/utils";

type Step = { number: string; title: string; body: string };

const icons: LucideIcon[] = [Search, UserCheck, CalendarCheck];

/**
 * `<HowItWorks />` — 3 pasos: Zoek → Kies → Boek. Cada paso con número
 * grande (Instrument Serif), icono y descripción. Reveal escalonado.
 */
export async function HowItWorks() {
  const t = await getTranslations("howItWorks");
  const steps = asArray<Step>(t.raw("steps"));

  return (
    <Section
      id="hoe-het-werkt"
      variant="soft"
      eyebrow={t("eyebrow")}
      title={t("title")}
      lead={t("lead")}
    >
      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = icons[i] ?? Search;
          return (
            <MotionReveal as="li" key={step.number} delay={i * 0.08}>
              <div className="relative h-full overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-white p-7 shadow-[var(--shadow-card)]">
                <span
                  className="font-display absolute -top-2 right-4 text-7xl leading-none text-[var(--color-bg-2)] select-none"
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-blue-soft)] text-[var(--color-primary)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="relative mt-6 text-xl font-bold tracking-tight text-[var(--color-ink)]">
                  {step.title}
                </h3>
                <p className="relative mt-2.5 text-[15px] leading-relaxed text-[var(--color-muted)]">
                  {step.body}
                </p>
              </div>
            </MotionReveal>
          );
        })}
      </ol>
    </Section>
  );
}
