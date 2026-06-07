"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/ui/section";
import { cn, asArray } from "@/lib/utils";

type FaqItem = { q: string; a: string };

/**
 * `<FAQ />` — acordeón accesible, headless (sin radix → -20KB).
 * Cada item: `<button aria-expanded aria-controls>` + región colapsable.
 * Una sola pregunta abierta a la vez. Animación de altura respeta
 * `prefers-reduced-motion`.
 */
export function FAQ() {
  const t = useTranslations("faq");
  const items = asArray<FaqItem>(t.raw("items"));
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const baseId = useId();

  return (
    <Section id="faq" variant="surface" containerSize="md" kicker={t("eyebrow")} title={t("title")} lead={t("lead")}>
      <ul className="mx-auto mt-12 max-w-3xl divide-y divide-black/10 border-y border-black/10">
        {items.map((item, i) => {
          const isOpen = open === i;
          const btnId = `${baseId}-q-${i}`;
          const panelId = `${baseId}-a-${i}`;
          return (
            <li key={item.q}>
              <h3>
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-[var(--color-blue)]"
                >
                  <span className="text-lg font-bold tracking-tight text-black transition-colors group-hover:text-[var(--color-blue)]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-black/40 transition-transform duration-300 ease-[var(--ease-out)]",
                      isOpen && "rotate-180 text-[var(--color-blue)]",
                    )}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                inert={!isOpen}
                initial={false}
                animate={
                  reduce
                    ? undefined
                    : { height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }
                }
                style={reduce ? { height: isOpen ? "auto" : 0, overflow: "hidden" } : undefined}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
                hidden={reduce ? !isOpen : undefined}
              >
                <div className="pb-6 pr-12">
                  <p className="text-base leading-relaxed text-black/60">
                    {item.a}
                  </p>
                </div>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
