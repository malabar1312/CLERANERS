"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * `<MotionReveal />` — wrapper para fade+rise on-scroll, equivalente al
 * `.rv` del MVP. Animación canónica del proyecto:
 *   - `opacity: 0 → 1`
 *   - `y: 24 → 0`
 *   - `duration: 600ms`, `ease: --ease-out`
 *   - dispara una vez (`once: true`), threshold ~15%.
 *
 * Si el usuario tiene `prefers-reduced-motion`, salta la animación.
 */
export function MotionReveal({
  children,
  delay = 0,
  className,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "header";
} & Omit<HTMLMotionProps<"div">, "ref">) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px -10% 0px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
