import { cn } from "@/lib/utils";

/**
 * `<Wordmark />` — la palabra "cleaners" como marca.
 *
 * REGLA LOCKED: `translate="no"` SIEMPRE. Google Translate y otros traductores
 * automáticos no deben tocar nunca el wordmark, ni en inglés, holandés ni
 * cualquier idioma. **Nunca remover este atributo.**
 *
 * El weight crece con el tamaño visual para que el wordmark mantenga peso
 * de marca en hero/footer (donde compite con texto grande) sin verse muscular
 * inline en navegación.
 */
export function Wordmark({
  className,
  as: Tag = "span",
  weight = "auto",
}: {
  className?: string;
  as?: "span" | "strong" | "h1" | "h2";
  /** `auto` deriva el peso del contexto tipográfico; override explícito si hace falta. */
  weight?: "auto" | "semibold" | "bold" | "extrabold";
}) {
  const weightClass = {
    auto: "font-semibold",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  }[weight];

  return (
    <Tag translate="no" className={cn(weightClass, "tracking-tight", className)}>
      cleaners
    </Tag>
  );
}
