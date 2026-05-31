import { cva, type VariantProps } from "class-variance-authority";

/**
 * `buttonStyles` — Stitch Quiet-Luxury. Primary = negro sólido; accent = azul
 * eléctrico (conversión); secondary = gray-wash; rounded-full, Geist medium,
 * scale-down al presionar. Módulo neutro (server + client). NUNCA emojis.
 */
export const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-display font-medium",
    "rounded-full select-none transition-all",
    "duration-[var(--dur-base)] ease-[var(--ease-out)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-45",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        // Solid black — default primary.
        primary: [
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
          "hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-ambient)]",
        ],
        // Electric blue — high-conversion CTA (Book, Continue).
        accent: [
          "bg-[var(--color-blue)] text-[var(--color-blue-ink)]",
          "hover:bg-[var(--color-blue-2)] hover:shadow-[var(--shadow-blue)]",
        ],
        // Subtle gray-wash secondary.
        secondary: [
          "bg-[var(--color-surface-3)] text-[var(--color-ink)]",
          "hover:bg-[var(--color-surface-4)]",
        ],
        // Hairline outline.
        outline: [
          "border border-[var(--color-line)] bg-[var(--color-white)] text-[var(--color-ink)]",
          "hover:border-[var(--color-ink)]",
        ],
        ghost: ["text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"],
        // On dark sections.
        "on-dark": [
          "bg-[var(--color-white)] text-[var(--color-ink)]",
          "hover:bg-[var(--color-surface-2)]",
        ],
        "ghost-on-dark": [
          "border border-[var(--color-dark-line)] bg-[color:rgb(255_255_255/0.06)] text-[var(--color-dark-ink)]",
          "hover:bg-[color:rgb(255_255_255/0.12)]",
        ],
        link: [
          "rounded-none px-0 text-[var(--color-blue)] underline-offset-4",
          "hover:underline active:scale-100",
        ],
        danger: ["bg-[var(--color-danger)] text-white hover:opacity-90"],
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-[3.25rem] px-7 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonStyles>;
