"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";

/**
 * `<MagneticWrapper>` — Subtle magnetic hover effect.
 * Wraps any element; moves it toward the cursor on hover (max 15% displacement).
 * Respects reduced-motion automatically (spring uses transform).
 */
export function MagneticWrapper({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 20, mass: 0.5 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
