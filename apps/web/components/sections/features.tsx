import { getTranslations } from "next-intl/server";
import { ShieldCheck, Heart, Lock, CalendarX2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
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
    <Section variant="white" kicker={t("eyebrow")} title={t("title")} lead={t("lead")}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = iconMap[card.icon] ?? ShieldCheck;
          return (
            <MotionReveal key={card.title} delay={i * 0.06}>
              <Card variant="white" padding="lg" interactive className="h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-blue-soft)] text-[var(--color-blue)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="headline mt-6 text-2xl text-[var(--color-ink)]">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{card.body}</p>
              </Card>
            </MotionReveal>
          );
        })}
      </div>
    </Section>
  );
}
