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
 * `<AvatarInitials />` — Noir Editorial: avatares monocromos (sin fotos stock).
 * Superficies en escala de grises noir + iniciales marfil. El único color es
 * el punto "online" en lima ácida. Editorial = contención.
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

  // Monochrome noir surfaces — subtle tonal variety, no hue.
  const tones = [
    "bg-[#1d1d20]",
    "bg-[#242428]",
    "bg-[#16161a]",
    "bg-[#2a2a2f]",
    "bg-[#1a1a1d]",
    "bg-[#202024]",
  ] as const;
  const safeTone = tones[Math.abs(tone) % tones.length] ?? tones[0];

  return (
    <span
      className={cn(
        "relative inline-flex select-none items-center justify-center rounded-full font-semibold text-[var(--color-ivory)]",
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
          className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-[var(--color-acid)] ring-2 ring-[var(--color-noir)]"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
