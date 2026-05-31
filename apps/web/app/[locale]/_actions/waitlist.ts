"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const schema = z.object({
  email: z.string().email(),
  /** Defaults to "nl" in callers; we only persist the freeform string. */
  locale: z.string().min(2).max(5).optional(),
  source: z.string().max(60).optional(),
});

export type WaitlistResult =
  | { ok: true }
  | { ok: false; error: "invalid_email" | "duplicate" | "config_missing" | "unknown" };

/**
 * Server Action — añade un email a la wachtlijst.
 *
 * Tabla `waitlist` ya existe en `backend/supabase-setup.sql` con RLS abierto
 * para insert anónimo. Si las env vars de Supabase no están seteadas (dev
 * local sin `.env.local`), devolvemos `config_missing` y el cliente puede
 * mostrar mensaje suave.
 */
export async function submitWaitlist(
  prevState: WaitlistResult | null,
  formData: FormData,
): Promise<WaitlistResult> {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false, error: "config_missing" };
  }

  // Honeypot: a hidden field real users never fill, but naive bots do.
  // Silently pretend success and drop the spam — never hit the DB.
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: true };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    locale: formData.get("locale") ?? "nl",
    source: formData.get("source") ?? "landing",
  });
  if (!parsed.success) {
    // Only label as "invalid_email" when the email field is the offender;
    // other schema failures are unexpected (tampered form) → generic.
    const emailIssue = parsed.error.issues.some((i) => i.path[0] === "email");
    return { ok: false, error: emailIssue ? "invalid_email" : "unknown" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("waitlist")
      .insert({
        email: parsed.data.email,
        locale: parsed.data.locale ?? "nl",
        source: parsed.data.source ?? "landing",
      });

    if (error) {
      if (error.code === "23505") return { ok: false, error: "duplicate" };
      if (process.env.NODE_ENV !== "production") {
        console.warn("[waitlist] insert error:", error);
      }
      return { ok: false, error: "unknown" };
    }
    return { ok: true };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[waitlist] unexpected error:", err);
    }
    return { ok: false, error: "unknown" };
  }
}
