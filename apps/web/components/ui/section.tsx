import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type Variant = "white" | "surface" | "dark";
type Spacing = "sm" | "md";
type ContainerSize = "sm" | "md" | "wide";

/**
 * `<Section />` — Stitch Quiet-Luxury. Variantes white / surface (off-white) /
 * dark. Header: label kicker (azul) + headline Geist + lead. Whitespace
 * generoso (section gap ~120px).
 */
export function Section({
  id,
  variant = "white",
  spacing = "md",
  containerSize = "md",
  kicker,
  title,
  lead,
  children,
  className,
  align = "center",
}: {
  id?: string;
  variant?: Variant;
  spacing?: Spacing;
  containerSize?: ContainerSize;
  kicker?: string;
  title?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
  align?: "center" | "left";
}) {
  const padding: Record<Spacing, string> = {
    sm: "py-[var(--space-section-sm)]",
    md: "py-[var(--space-section)]",
  };
  const surface: Record<Variant, string> = {
    white: "bg-[var(--color-white)] text-[var(--color-ink)]",
    surface: "bg-[var(--color-surface)] text-[var(--color-ink)]",
    dark: "bg-[var(--color-dark)] text-[var(--color-dark-ink)]",
  };
  const leadColor: Record<Variant, string> = {
    white: "text-[var(--color-muted)]",
    surface: "text-[var(--color-muted)]",
    dark: "text-[var(--color-dark-muted)]",
  };
  const isLeft = align === "left";

  return (
    <section id={id} className={cn("relative", surface[variant], padding[spacing], className)}>
      <Container size={containerSize}>
        {(kicker || title || lead) && (
          <header className={cn("mb-12 max-w-2xl sm:mb-16", isLeft ? "text-left" : "mx-auto text-center")}>
            {kicker && <p className="label text-[var(--color-blue)]">{kicker}</p>}
            {title && (
              <h2 className="headline mt-3 text-balance text-[length:var(--text-headline)]">{title}</h2>
            )}
            {lead && (
              <p className={cn("mt-4 text-pretty text-[length:var(--text-lead)] leading-relaxed", isLeft ? "" : "mx-auto", leadColor[variant])}>
                {lead}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
