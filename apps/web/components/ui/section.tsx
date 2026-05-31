import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type Variant = "noir" | "paper" | "acid";
type Spacing = "sm" | "md" | "lg";
type ContainerSize = "sm" | "md" | "wide";

/**
 * `<Section />` — wrapper estandarizado. Noir Editorial:
 *  - `noir`  → fondo casi-negro, texto marfil (default)
 *  - `paper` → fondo papel cálido, texto tinta (sección invertida, ritmo)
 *  - `acid`  → bloque lima ácida, texto noir (declaración / statement)
 *
 * Header: kicker (label en mayúsculas con tracking) + headline (Anton,
 * mayúsculas, escala brutal) + lead.
 */
export function Section({
  id,
  variant = "noir",
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
    md: "py-[var(--space-section-md)]",
    lg: "py-[var(--space-section-lg)]",
  };

  const surface: Record<Variant, string> = {
    noir: "bg-[var(--color-noir)] text-[var(--color-ivory)]",
    paper: "bg-[var(--color-paper)] text-[var(--color-paper-ink)]",
    acid: "bg-[var(--color-acid)] text-[var(--color-acid-ink)]",
  };

  const kickerColor: Record<Variant, string> = {
    noir: "text-[var(--color-acid)]",
    paper: "text-[var(--color-paper-dim)]",
    acid: "text-[var(--color-acid-ink)]/70",
  };

  const leadColor: Record<Variant, string> = {
    noir: "text-[var(--color-ivory-dim)]",
    paper: "text-[var(--color-paper-dim)]",
    acid: "text-[var(--color-acid-ink)]/75",
  };

  const isLeft = align === "left";

  return (
    <section
      id={id}
      className={cn("relative overflow-hidden", surface[variant], padding[spacing], className)}
    >
      <Container size={containerSize}>
        {(kicker || title || lead) && (
          <header
            className={cn(
              "mb-12 max-w-3xl sm:mb-16",
              isLeft ? "text-left" : "mx-auto text-center",
            )}
          >
            {kicker && (
              <p className={cn("kicker flex items-center gap-2", isLeft ? "" : "justify-center", kickerColor[variant])}>
                {variant === "noir" && (
                  <span className="h-1.5 w-1.5 bg-[var(--color-acid)]" aria-hidden="true" />
                )}
                {kicker}
              </p>
            )}
            {title && (
              <h2 className="headline mt-5 text-balance text-[length:var(--text-display-2)]">
                {title}
              </h2>
            )}
            {lead && (
              <p className={cn("mt-5 max-w-2xl text-pretty text-[length:var(--text-lead)] leading-relaxed", isLeft ? "" : "mx-auto", leadColor[variant])}>
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
