import { cn } from "@/lib/utils";
import { Star } from "./star";
import { Wordmark } from "./wordmark";

type Size = "sm" | "md" | "lg" | "xl";

/**
 * `<Logo />` — lockup: estrella (lima ácida) + wordmark "cleaners".
 * Noir editorial: la estrella es el único toque de color en el lockup.
 * `tone="onDark"` → wordmark marfil; `tone="onLight"` → wordmark tinta sobre papel.
 */
export function Logo({
  className,
  tone = "onDark",
  size = "md",
  iconOnly = false,
}: {
  className?: string;
  tone?: "onDark" | "onLight";
  size?: Size;
  iconOnly?: boolean;
}) {
  const star: Record<Size, string> = {
    sm: "h-4 w-4",
    md: "h-[1.15rem] w-[1.15rem]",
    lg: "h-6 w-6",
    xl: "h-9 w-9",
  };
  const text: Record<Size, string> = {
    sm: "text-[15px]",
    md: "text-[17px]",
    lg: "text-xl",
    xl: "text-3xl",
  };

  if (iconOnly) {
    return <Star gradient className={cn(star[size], className)} aria-label="cleaners" />;
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Star gradient className={star[size]} />
      <Wordmark
        weight="semibold"
        className={cn(
          text[size],
          "lowercase",
          tone === "onDark" ? "text-[var(--color-ivory)]" : "text-[var(--color-paper-ink)]",
        )}
      />
    </span>
  );
}
