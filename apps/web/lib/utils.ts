import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` — merge Tailwind class names with conditional logic.
 * Combines `clsx` (conditional) + `tailwind-merge` (deduplication of
 * conflicting utility classes, e.g. `px-4 px-6` → `px-6`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
