"use client";

import { useId, type SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * `<Star />` — el logomark de cleaners. Estrella de 4 puntas con esquinas suaves.
 * Acepta `className` para tinte vía `text-*` y un flag `gradient` que inyecta
 * un `<linearGradient>` con id único por instancia (vía `useId`) — soporta
 * varias estrellas con gradient en la misma página sin colisión SSR/Safari.
 */
export function Star({
  className,
  gradient = false,
  ...props
}: SVGProps<SVGSVGElement> & { gradient?: boolean }) {
  const reactId = useId();
  // useId returns ":r0:" style — strip colons for valid SVG ids.
  const gradId = `star-grad-${reactId.replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("inline-block", className)}
      fill={gradient ? `url(#${gradId})` : "currentColor"}
      {...props}
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A56DB" />
            <stop offset="55%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      )}
      <path d="M12 1.5c.55 0 1.04.34 1.23.86l1.8 4.92a3 3 0 0 0 1.79 1.79l4.92 1.8a1.31 1.31 0 0 1 0 2.46l-4.92 1.8a3 3 0 0 0-1.79 1.79l-1.8 4.92a1.31 1.31 0 0 1-2.46 0l-1.8-4.92a3 3 0 0 0-1.79-1.79l-4.92-1.8a1.31 1.31 0 0 1 0-2.46l4.92-1.8a3 3 0 0 0 1.79-1.79l1.8-4.92c.19-.52.68-.86 1.23-.86Z" />
    </svg>
  );
}
