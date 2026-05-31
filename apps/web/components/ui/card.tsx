import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "noir" | "paper" | "outline-noir";
type Padding = "sm" | "md" | "lg";

/**
 * `<Card />` — Noir Editorial. La firma: en hover, una regla de lima ácida
 * aparece arriba (scaleX 0→1) + lift sutil. Bordes hairline, radios chicos.
 */
export function Card({
  variant = "noir",
  padding = "md",
  interactive = false,
  className,
  children,
  as: Tag = "div",
}: {
  variant?: Variant;
  padding?: Padding;
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
  as?: "div" | "article" | "section" | "li";
}) {
  const surface: Record<Variant, string> = {
    noir: "bg-[var(--color-noir-2)] border border-[var(--color-line)] text-[var(--color-ivory)]",
    "outline-noir": "bg-transparent border border-[var(--color-line)] text-[var(--color-ivory)]",
    paper: "bg-[var(--color-paper)] border border-[var(--color-paper-line)] text-[var(--color-paper-ink)]",
  };
  const pads: Record<Padding, string> = {
    sm: "p-5",
    md: "p-6 sm:p-7",
    lg: "p-7 sm:p-9",
  };

  return (
    <Tag
      className={cn(
        "group/card relative isolate rounded-lg",
        "transition-all duration-[var(--dur-mid)] ease-[var(--ease-out)]",
        surface[variant],
        pads[padding],
        interactive &&
          "hover:-translate-y-1 hover:border-[color:rgb(245_243_239/0.28)] hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      {interactive && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0",
            "bg-[var(--color-acid)] transition-transform",
            "duration-[var(--dur-slow)] ease-[var(--ease-out)]",
            "group-hover/card:scale-x-100",
          )}
        />
      )}
      {children}
    </Tag>
  );
}
