import { cn } from "@/lib/utils";

/**
 * `<Wordmark />` — la palabra "cleaners" como marca registrada.
 *
 * REGLA LOCKED del proyecto: `translate="no"` SIEMPRE. Google Translate y
 * otros traductores automáticos no deben tocar nunca el wordmark, ni en
 * inglés ni en holandés ni en ningún otro idioma. No remover este atributo.
 */
export function Wordmark({
  className,
  as: Tag = "span",
}: {
  className?: string;
  as?: "span" | "strong" | "h1" | "h2";
}) {
  return (
    <Tag translate="no" className={cn("font-semibold tracking-tight", className)}>
      cleaners
    </Tag>
  );
}
