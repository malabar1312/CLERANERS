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
    <Section id="faq" variant="light" containerSize="sm" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")}>
      <ul className="mx-auto max-w-2xl divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
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
                  className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[var(--color-primary)]"
                >
                  <span className="text-[17px] font-semibold tracking-tight text-[var(--color-ink)]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-[var(--color-muted)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)]",
                      isOpen && "rotate-180 text-[var(--color-primary)]",
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
                <p className="pb-5 text-[15px] leading-relaxed text-[var(--color-muted)]">
                  {item.a}
                </p>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
