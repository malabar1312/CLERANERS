import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "elevated" | "outline" | "soft" | "navy";
type Padding = "sm" | "md" | "lg";

/**
 * `<Card />` — primitive base de tarjeta. Las cards específicas (cleaner-card,
 * feature-card, review-card) componen este base y agregan contenido propio.
 *
 * El detalle firma: en hover, la barra gradiente arriba aparece (scaleX 0→1
 * por overlay) cuando `interactive`. Es la firma visual del MVP — no
 * borrar sin razón explícita.
 */
export function Card({
  variant = "elevated",
  padding = "md",
  interactive = false,
  className,
  children,
  as: Tag = "div",
}: {
  variant?: Variant;
  padding?: Padding;
  /** Aplicar hover translate-y + sombra hover + barra gradiente top. */
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
  as?: "div" | "article" | "section" | "li";
}) {
  const surface: Record<Variant, string> = {
    elevated: "bg-white border border-[var(--color-border-soft)] shadow-[var(--shadow-card)]",
    outline: "bg-white border border-[var(--color-border)]",
    soft: "bg-[var(--color-bg)] border border-[var(--color-border-soft)]",
    navy: "bg-[var(--color-navy-2)] text-white border border-white/10",
  };
  const pads: Record<Padding, string> = {
    sm: "p-5",
    md: "p-6 sm:p-7",
    lg: "p-7 sm:p-9",
  };

  return (
    <Tag
      className={cn(
        "group/card relative isolate rounded-2xl",
        "transition-all duration-[var(--dur-mid)] ease-[var(--ease-out)]",
        surface[variant],
        pads[padding],
        interactive &&
          "hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      {interactive && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-5 top-0 h-px origin-left scale-x-0",
            "bg-[image:var(--gradient-iris)] transition-transform",
            "duration-[var(--dur-slow)] ease-[var(--ease-out)]",
            "group-hover/card:scale-x-100",
          )}
        />
      )}
      {children}
    </Tag>
  );
}
