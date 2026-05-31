import { cva, type VariantProps } from "class-variance-authority";

/**
 * `buttonStyles` — botones Noir Editorial. Voz uniforme: MAYÚSCULAS,
 * tracking abierto, pill. El acid es la jerarquía máxima (CTA primaria).
 *
 * Módulo neutro (sin "use client") → invocable desde Server y Client.
 * NUNCA emojis. Iconos: lucide-react.
 */
export const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold uppercase tracking-[0.06em] text-[13px]",
    "rounded-full select-none transition-all",
    "duration-[var(--dur-base)] ease-[var(--ease-out)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-acid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-noir)]",
    "disabled:pointer-events-none disabled:opacity-45",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        // The CTA — acid block on noir text. Maximum hierarchy.
        primary: [
          "bg-[var(--color-acid)] text-[var(--color-acid-ink)]",
          "hover:bg-[var(--color-acid-2)] hover:shadow-[var(--shadow-acid)]",
        ],
        // Same as primary but with a stronger lift — for hero moments.
        hero: [
          "bg-[var(--color-acid)] text-[var(--color-acid-ink)]",
          "shadow-[var(--shadow-acid)] hover:bg-[var(--color-acid-2)] hover:-translate-y-0.5",
        ],
        // Outline on noir — ivory hairline.
        secondary: [
          "border border-[var(--color-line)] bg-transparent text-[var(--color-ivory)]",
          "hover:border-[var(--color-ivory)] hover:bg-[var(--color-noir-2)]",
        ],
        // Invert: ivory fill, noir text (strong secondary on noir).
        outline: [
          "border border-[var(--color-ivory)] bg-transparent text-[var(--color-ivory)]",
          "hover:bg-[var(--color-ivory)] hover:text-[var(--color-noir)]",
        ],
        ghost: [
          "text-[var(--color-ivory)] hover:bg-[var(--color-noir-2)]",
        ],
        "ghost-on-dark": [
          "border border-[color:rgb(245_243_239/0.18)] bg-[color:rgb(245_243_239/0.06)] text-[var(--color-ivory)] backdrop-blur",
          "hover:bg-[color:rgb(245_243_239/0.12)]",
        ],
        // On paper sections.
        "on-paper": [
          "border border-[var(--color-paper-line)] bg-transparent text-[var(--color-paper-ink)]",
          "hover:bg-[var(--color-paper-ink)] hover:text-[var(--color-paper)]",
        ],
        link: [
          "rounded-none px-0 normal-case tracking-normal text-[15px] font-medium",
          "text-[var(--color-acid)] acid-rule hover:opacity-80 active:scale-100",
        ],
        danger: [
          "bg-[var(--color-danger)] text-[var(--color-noir)] hover:bg-[var(--color-danger-2)]",
        ],
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-[3.25rem] px-7 text-sm",
        xl: "h-16 px-9 text-sm",
        icon: "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonStyles>;
