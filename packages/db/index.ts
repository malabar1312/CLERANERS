/**
 * `@cleaners/db` — shared Supabase domain types.
 *
 * Once the real Supabase project is wired, regenerate the `Database` shape via:
 *   supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > types.ts
 * and re-export from this file. Until then, the placeholder `Database`
 * preserves the shape `createServerClient<Database>` expects without
 * collapsing all table types to `unknown`.
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

/**
 * Placeholder for the generated Supabase `Database` type.
 *
 * Once `supabase gen types` runs, replace this with the real generated shape.
 * The minimal stub here matches the structure Supabase expects so generics
 * resolve cleanly.
 */
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      role: Role;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
