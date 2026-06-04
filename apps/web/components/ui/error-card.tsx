import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * `<ErrorCard />` — inline error display Stitch Quiet-Luxury.
 * Para errores recuperables (fetch fail, timeout). No reemplaza error.tsx.
 */
export function ErrorCard({
  title,
  body,
  retry,
  className,
}: {
  title: string;
  body?: string;
  retry?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] p-6 text-center", className)}>
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
        <AlertTriangle className="h-6 w-6 text-[var(--color-danger)]" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)]">{title}</h3>
      {body && <p className="mt-2 text-sm text-[var(--color-muted)]">{body}</p>}
      {retry && (
        <button
          type="button"
          onClick={retry.onClick}
          className="mt-4 text-sm font-medium text-[var(--color-blue)] underline-offset-4 hover:underline"
        >
          {retry.label}
        </button>
      )}
    </div>
  );
}
