import { getTranslations } from "next-intl/server";
import { ShieldCheck, Heart, Lock, CalendarX2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { MotionReveal } from "@/components/ui/motion-reveal";
import { asArray } from "@/lib/utils";

type FeatureCard = { icon: string; title: string; body: string };

const iconMap: Record<string, LucideIcon> = { ShieldCheck, Heart, Lock, CalendarX2 };

/**
 * `<Features />` — 4 garantías. Sección white. Cards blancas con icono
 * en cuadro azul tenue.
 */
export async function Features() {
  const t = await getTranslations("features");
  const cards = asArray<FeatureCard>(t.raw("cards"));

  return (
    <Section variant="surface" containerSize="wide" kicker={t("eyebrow")} title={t("title")} lead={t("lead")}>
      <div className="mt-12 grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = iconMap[card.icon] ?? ShieldCheck;
          return (
            <MotionReveal key={card.title} delay={i * 0.08} className="flex flex-col">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5 text-[var(--color-blue)]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-black">{card.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-black/60">{card.body}</p>
            </MotionReveal>
          );
        })}
      </div>
    </Section>
  );
}
