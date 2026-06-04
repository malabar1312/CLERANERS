import type { ReactNode } from "react";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * `<EmptyState />` — Stitch Quiet-Luxury. Centered, quiet, con icono y acción.
 * Para listados vacíos, búsquedas sin resultados, secciones sin datos.
 */
export function EmptyState({
  icon: Icon = SearchX,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4 py-16 text-center", className)}>
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
        <Icon className="h-6 w-6 text-[var(--color-muted)]" aria-hidden="true" />
      </span>
      <h3 className="headline text-xl text-[var(--color-ink)]">{title}</h3>
      {body && <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">{body}</p>}
      {action}
    </div>
  );
}
