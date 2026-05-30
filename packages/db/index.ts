/**
 * `@cleaners/db` — Supabase generated types + shared DB helpers.
 *
 * Once we point at the real Supabase project, regenerate via:
 *   pnpm --filter @cleaners/db gen
 *
 * Until then, this is a thin placeholder so app code can already import
 * the canonical names without a refactor when types land.
 */

export type Role = "client" | "cleaner" | "admin";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "requires_payment"
  | "succeeded"
  | "captured"
  | "refunded"
  | "failed";

// Real generated types will replace this once supabase gen runs.
export type Database = Record<string, unknown>;
