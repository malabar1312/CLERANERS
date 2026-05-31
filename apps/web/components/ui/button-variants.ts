import { cva, type VariantProps } from "class-variance-authority";

/**
 * `buttonStyles` — la fuente única de las clases de botón.
 *
 * Vive en un módulo **neutro** (sin `"use client"`) para que tanto Server
 * Components (que renderizan `<Link className={buttonStyles(...)}>`) como
 * Client Components (`<Button>`) puedan invocarla. Mover esto a un módulo
 * cliente rompe el build (no se puede llamar una función de cliente desde
 * el server).
 *
 * NUNCA emojis. Iconos: <Icon className="h-4 w-4" /> de `lucide-react`.
 */
export const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "rounded-xl select-none transition-all",
    "duration-[var(--dur-base)] ease-[var(--ease-out)]",
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
        hero: [
          "bg-[var(--color-primary)] text-white",
          "shadow-[var(--shadow-hero-cta)]",
          "hover:bg-[var(--color-primary-hover)] hover:-translate-y-px",
        ],
        secondary: [
          "border border-[var(--color-border)] bg-white text-[var(--color-ink)]",
          "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
        ],
        outline: [
          "border border-[var(--color-ink)] bg-transparent text-[var(--color-ink)]",
          "hover:bg-[var(--color-ink)] hover:text-white",
        ],
        ghost: ["text-[var(--color-primary)] hover:bg-[var(--color-blue-soft)]"],
        "ghost-on-dark": [
          "border border-white/20 bg-white/10 text-white backdrop-blur",
          "hover:bg-white/15 hover:border-white/30",
        ],
        link: [
          "text-[var(--color-primary)] underline-offset-4",
          "hover:underline active:scale-100 px-0",
        ],
        danger: [
          "bg-[var(--color-danger)] text-white",
          "hover:bg-[var(--color-danger-hover)]",
        ],
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-7 text-lg",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
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
