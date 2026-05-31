import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type Variant = "light" | "navy" | "soft" | "mesh" | "dots";
type Spacing = "sm" | "md" | "lg";
type ContainerSize = "sm" | "md" | "wide";

/**
 * `<Section />` — wrapper estandarizado para cada sección de la landing.
 *
 * Resuelve de un solo sitio: padding vertical (tokenizado), background
 * (claro / navy / soft / mesh / dots), eyebrow pill, h2 con `<em>`, lead.
 * Si una sección quiere un layout custom, pasar `children` y omitir
 * `title` / `lead`.
 */
export function Section({
  id,
  variant = "light",
  spacing = "md",
  containerSize = "md",
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  id?: string;
  variant?: Variant;
  spacing?: Spacing;
  containerSize?: ContainerSize;
  /** Texto del eyebrow pill (encima del h2). */
  eyebrow?: string;
  /** Título de la sección. Acepta ReactNode para inyectar `<em className="text-gradient-iris">`. */
  title?: ReactNode;
  /** Subtítulo bajo el h2. */
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const padding: Record<Spacing, string> = {
    sm: "py-[var(--space-section-sm)]",
    md: "py-[var(--space-section-md)]",
    lg: "py-[var(--space-section-lg)]",
  };

  const surface: Record<Variant, string> = {
    light: "bg-white",
    soft: "bg-[var(--color-bg)]",
    navy: "bg-[var(--color-navy)] text-white",
    mesh: "bg-white bg-trust-mesh",
    dots: "bg-white bg-dots",
  };

  return (
    <section
      id={id}
      className={cn("relative overflow-hidden", surface[variant], padding[spacing], className)}
    >
      <Container size={containerSize}>
        {(eyebrow || title || lead) && (
          <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            {eyebrow && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
                  "text-[length:var(--text-eyebrow)] font-medium uppercase",
                  "tracking-[var(--text-tracking-eyebrow)]",
                  variant === "navy"
                    ? "border border-white/15 bg-white/5 text-white/80 backdrop-blur"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-muted)]",
                )}
              >
                <span
                  className="h-1 w-1 rounded-full bg-[var(--color-primary)]"
                  aria-hidden="true"
                />
                {eyebrow}
              </span>
            )}
            {title && (
              <h2
                className={cn(
                  "font-display mt-5 text-balance leading-[1.06]",
                  "text-[length:var(--text-display-2)]",
                  variant === "navy" ? "text-white" : "text-[var(--color-foreground)]",
                )}
              >
                {title}
              </h2>
            )}
            {lead && (
              <p
                className={cn(
                  "mt-5 text-pretty",
                  "text-[length:var(--text-lead)] leading-relaxed",
                  variant === "navy" ? "text-white/70" : "text-[var(--color-muted)]",
                )}
              >
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
