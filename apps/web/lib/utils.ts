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

/**
 * Safely coerce a value (typically `t.raw("key")` from next-intl, which is
 * untyped `any`) into a typed array. Returns `[]` if the value isn't an
 * array — so a missing/malformed i18n key degrades gracefully instead of
 * throwing `TypeError` mid-render in a Server Component.
 */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
