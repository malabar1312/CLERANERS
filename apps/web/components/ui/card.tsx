import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "white" | "surface" | "dark";
type Padding = "sm" | "md" | "lg";

/**
 * `<Card />` — Stitch Quiet-Luxury. Blanco puro, 1px border, sombra ambient,
 * rounded-2xl. Variante `dark` para secciones oscuras. Hover: lift suave.
 */
export function Card({
  variant = "white",
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
    white: "bg-[var(--color-white)] border border-[var(--color-line)] shadow-[var(--shadow-ambient)]",
    surface: "bg-[var(--color-surface)] border border-[var(--color-line)]",
    dark: "bg-[var(--color-dark-2)] border border-[var(--color-dark-line)] text-[var(--color-dark-ink)] shadow-[var(--shadow-dark-card)]",
  };
  const pads: Record<Padding, string> = {
    sm: "p-5",
    md: "p-6",
    lg: "p-7 sm:p-8",
  };

  return (
    <Tag
      className={cn(
        "group/card relative isolate rounded-2xl",
        "transition-all duration-[var(--dur-mid)] ease-[var(--ease-out)]",
        surface[variant],
        pads[padding],
        interactive &&
          (variant === "dark"
            ? "hover:-translate-y-1 hover:border-[color:rgb(255_255_255/0.18)]"
            : "hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"),
        className,
      )}
    >
      {children}
    </Tag>
  );
}
