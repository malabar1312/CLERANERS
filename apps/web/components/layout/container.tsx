import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * `<Container />` — wrapper de ancho máximo + padding lateral consistente.
 * Default `max-w-6xl` (1152px) ≈ ancho cómodo para Airbnb/Booking-grade.
 * Para hero/landings full-bleed con contenido centrado usar `wide`.
 */
export function Container({
  children,
  className,
  size = "md",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "wide";
  as?: ElementType;
}) {
  const max = {
    sm: "max-w-3xl",
    md: "max-w-6xl",
    wide: "max-w-7xl",
  }[size];

  return (
    <Tag className={cn("mx-auto w-full px-5 sm:px-6 lg:px-8", max, className)}>
      {children}
    </Tag>
  );
}
