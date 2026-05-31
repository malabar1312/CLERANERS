import { cn } from "@/lib/utils";
import { Star } from "./star";
import { Wordmark } from "./wordmark";

type Size = "sm" | "md" | "lg" | "xl";

/**
 * `<Logo />` — lockup: estrella (gradient azul→índigo→violeta) + wordmark.
 * Funciona sobre claro u oscuro (`tone="onDark"`). Para el icono solo (sin
 * wordmark), usar `iconOnly` — útil en favicons, app icons, loading states.
 */
export function Logo({
  className,
  tone = "onLight",
  size = "md",
  iconOnly = false,
}: {
  className?: string;
  tone?: "onLight" | "onDark";
  size?: Size;
  iconOnly?: boolean;
}) {
  const star: Record<Size, string> = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
    xl: "h-10 w-10",
  };
  const text: Record<Size, string> = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  };
  const weight: Record<Size, "semibold" | "bold" | "extrabold"> = {
    sm: "semibold",
    md: "semibold",
    lg: "bold",
    xl: "extrabold",
  };

  if (iconOnly) {
    return <Star gradient className={cn(star[size], className)} aria-label="cleaners" />;
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Star gradient className={star[size]} />
      <Wordmark
        weight={weight[size]}
        className={cn(
          text[size],
          tone === "onDark" ? "text-white" : "text-[var(--color-ink)]",
        )}
      />
    </span>
  );
}
