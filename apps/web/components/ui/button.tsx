"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * `<Button />` — el único primitive de botón. Variantes:
 *   - primary       → CTA azul cleaners (sobre claro)
 *   - secondary     → outline azul (sobre claro)
 *   - ghost         → texto azul sin borde (sobre claro)
 *   - ghost-on-dark → glass / outline blanco (sobre hero oscuro)
 *
 * NO usar emojis. Iconos: <Icon className="h-4 w-4" /> de `lucide-react`.
 */
const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "rounded-xl select-none transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-primary)] text-white",
          "hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-glow)]",
        ],
        secondary: [
          "border border-[var(--color-border)] bg-white text-[var(--color-ink)]",
          "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
        ],
        ghost: [
          "text-[var(--color-primary)] hover:bg-[var(--color-blue-soft)]",
        ],
        "ghost-on-dark": [
          "border border-white/20 bg-white/10 text-white backdrop-blur",
          "hover:bg-white/15 hover:border-white/30",
        ],
        danger: [
          "bg-[var(--color-danger)] text-white hover:opacity-90",
        ],
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-7 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonStyles({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonStyles };
