"use client";

import { Children, cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement, type Ref } from "react";
import { Loader2 } from "lucide-react";
import { buttonStyles, type ButtonVariantProps } from "./button-variants";
import { cn } from "@/lib/utils";

// Re-export for convenience so callers can `import { buttonStyles } from ".../button"`.
// Note: Server Components must import from `./button-variants` directly.
export { buttonStyles } from "./button-variants";

/**
 * `<Button />` — el único primitive de botón interactivo. Variantes y tamaños
 * viven en `button-variants.ts` (módulo neutro). Extras:
 *   - `loading` — reemplaza children con spinner + auto-disable
 *   - `asChild` — clona el primer child (e.g. `<Link>`) aplicándole los estilos
 */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  asChild?: boolean;
  loading?: boolean;
}

type AsChildEl = ReactElement<{ className?: string; children?: React.ReactNode }>;

function isAsChildElement(node: unknown): node is AsChildEl {
  return isValidElement(node);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    type = "button",
    asChild = false,
    loading = false,
    disabled,
    children,
    ...props
  },
  ref,
) {
  const styles = cn(buttonStyles({ variant, size, fullWidth }), className);

  if (asChild) {
    const child = Children.only(children);
    if (!isAsChildElement(child)) return null;
    return cloneElement(child, {
      ...props,
      className: cn(styles, child.props.className),
      children: loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : child.props.children,
    } as never);
  }

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      className={styles}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Bezig…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});
