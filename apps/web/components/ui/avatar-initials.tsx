import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeStyles: Record<Size, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-2xl",
};

/**
 * `<AvatarInitials />` — Stitch Quiet-Luxury. Avatares neutros claros
 * (placeholder hasta foto real en Fase 4): superficie gris suave + iniciales
 * en tinta + punto online azul. Sin AI-stock.
 */
export function AvatarInitials({
  name,
  size = "md",
  tone = 0,
  online = false,
  className,
}: {
  name: string;
  size?: Size;
  tone?: number;
  online?: boolean;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Subtle light neutrals — no hue (the only color is the online dot).
  const tones = [
    "bg-[#eef0f2]",
    "bg-[#e9ebee]",
    "bg-[#f1f2f4]",
    "bg-[#e6e9ec]",
    "bg-[#edeef0]",
    "bg-[#e8eaed]",
  ] as const;
  const safeTone = tones[Math.abs(tone) % tones.length] ?? tones[0];

  return (
    <span
      className={cn(
        "relative inline-flex select-none items-center justify-center rounded-full font-display font-semibold text-[var(--color-ink-2)]",
        "ring-1 ring-[var(--color-line)]",
        safeTone,
        sizeStyles[size],
        className,
      )}
      aria-label={name}
    >
      <span aria-hidden="true">{initials || "?"}</span>
      {online && (
        <span
          className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-[var(--color-blue)] ring-2 ring-[var(--color-white)]"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
