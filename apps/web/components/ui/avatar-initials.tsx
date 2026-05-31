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
 * `<AvatarInitials />` — avatar circular con iniciales sobre gradiente brand.
 *
 * Estrategia anti-stock: en lugar de fotos AI-flavored, usamos avatares
 * de iniciales tipo Linear/Notion. El gradiente se elige con una variante
 * acotada a la paleta brand para que ninguno se vea ajeno.
 *
 * Si tenemos URL real (Fase 4), una `<AvatarPhoto>` separada renderiza la
 * foto y este componente queda para fallbacks.
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
  /** 0-5; un hash del id del cleaner mapea a uno de los 6 gradientes brand. */
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

  // 6 gradientes brand-safe — navy/blue/indigo/violet rotation.
  // Tupla `as const` (no vacía) → indexar el módulo da `string`, no `string | undefined`.
  const tones = [
    "from-[#1a56db] to-[#4f46e5]",   // blue → indigo
    "from-[#4f46e5] to-[#8b5cf6]",   // indigo → violet
    "from-[#1648c0] to-[#4f46e5]",   // deep blue → indigo
    "from-[#3b6fe6] to-[#8b5cf6]",   // mid blue → violet
    "from-[#13203a] to-[#1a56db]",   // navy → blue
    "from-[#6359ec] to-[#a479f8]",   // indigo soft → violet soft
  ] as const;
  const safeTone = tones[Math.abs(tone) % tones.length] ?? tones[0];

  return (
    <span
      className={cn(
        "relative inline-flex select-none items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
        "ring-2 ring-white/70",
        safeTone,
        sizeStyles[size],
        className,
      )}
      aria-label={name}
    >
      <span aria-hidden="true">{initials || "?"}</span>
      {online && (
        <span
          className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-[var(--color-success)] ring-2 ring-white"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
