import { getTranslations } from "next-intl/server";
import { Search, UserCheck, CalendarCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { asArray } from "@/lib/utils";

type Step = { number: string; title: string; body: string };

const icons: LucideIcon[] = [Search, UserCheck, CalendarCheck];

/**
 * `<HowItWorks />` — 3-step section.
 * Desktop: 3-column grid with ghost numbers.
 * Mobile: horizontal scroll-snap carousel — compact cards,
 * peek next card, connected step line.
 */
export async function HowItWorks() {
  const t = await getTranslations("howItWorks");
  const steps = asArray<Step>(t.raw("steps"));

  return (
    <Section
      id="hoe-het-werkt"
      variant="white"
      containerSize="wide"
      kicker={t("eyebrow")}
      title={t("title")}
      lead={t("lead")}
    >
      {/* ── Desktop: 3-column grid (lg+) ───────────────── */}
      <ol className="mt-12 hidden gap-16 lg:grid lg:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = icons[i] ?? Search;
          return (
            <MotionReveal
              as="li"
              key={step.number}
              delay={i * 0.1}
              className="group relative"
            >
              <div className="flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/[0.03] text-[var(--color-blue)] transition-colors group-hover:bg-[var(--color-blue)] group-hover:text-white">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span
                    className="font-display text-8xl font-black text-black/[0.03] transition-colors group-hover:text-black/[0.05]"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-black">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-black/60">
                  {step.body}
                </p>
              </div>
            </MotionReveal>
          );
        })}
      </ol>

      {/* ── Mobile: horizontal scroll-snap carousel (<lg) ─ */}
      <div className="mt-8 lg:hidden">
        {/* Connected step indicator */}
        <div className="mx-auto mb-6 flex max-w-[280px] items-center justify-center gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-blue)] text-xs font-bold text-white shadow-sm">
                {step.number}
              </span>
              {i < steps.length - 1 && (
                <span className="h-[2px] w-12 bg-[var(--color-blue)]/20" />
              )}
            </div>
          ))}
        </div>

        {/* Scrollable cards */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {steps.map((step, i) => {
            const Icon = icons[i] ?? Search;
            return (
              <article
                key={step.number}
                className="flex w-[80vw] min-w-[280px] max-w-[320px] flex-none snap-center flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                {/* Header row: icon + step number */}
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-blue)]/[0.08] text-[var(--color-blue)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-blue)]">
                    Stap {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-4 text-lg font-bold tracking-tight text-[var(--color-ink)]">
                  {step.title}
                </h3>

                {/* Body */}
                <p className="mt-2 text-sm leading-relaxed text-black/55">
                  {step.body}
                </p>
              </article>
            );
          })}
        </div>

        {/* Scroll hint — subtle dots */}
        <div className="mt-4 flex justify-center gap-1.5">
          {steps.map((step, i) => (
            <span
              key={step.number}
              className={`h-1.5 rounded-full transition-all ${
                i === 0
                  ? "w-6 bg-[var(--color-blue)]"
                  : "w-1.5 bg-black/10"
              }`}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
