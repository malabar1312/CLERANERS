import { cn } from "@/lib/utils";
import { Star } from "./star";
import { Wordmark } from "./wordmark";

/**
 * `<Logo />` — lockup: estrella (con gradiente azul→índigo→violeta) +
 * wordmark "cleaners". Sirve tanto sobre fondo claro como oscuro: pasar
 * `tone="onDark"` invierte el color del wordmark.
 */
export function Logo({
  className,
  tone = "onLight",
  size = "md",
}: {
  className?: string;
  tone?: "onLight" | "onDark";
  size?: "sm" | "md" | "lg";
}) {
  const star = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" }[size];
  const text = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Star gradient className={star} />
      <Wordmark
        className={cn(
          text,
          tone === "onDark" ? "text-white" : "text-[var(--color-ink)]",
        )}
      />
    </span>
  );
}
