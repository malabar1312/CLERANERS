"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit, getIdentifier } from "@/lib/rate-limit";
import { env } from "@/lib/env";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(2000),
});

export type ContactResult =
  | { ok: true }
  | { ok: false; error: "invalid_input" | "unknown" };

/**
 * Server Action — guarda un mensaje de contacto en la tabla `contact_messages`.
 * Sin Supabase (dev) degrada con gracia (loguea y devuelve ok).
 */
export async function submitContact(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  // Rate limit: 3 messages per IP per 5 minutes.
  const hdrs = await headers();
  if (!rateLimit("contact", getIdentifier(hdrs), { limit: 3, windowMs: 300_000 })) {
    return { ok: false, error: "unknown" };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] (no Supabase)", parsed.data);
    }
    return { ok: true }; // Dev: éxito suave.
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    if (error) {
      if (process.env.NODE_ENV !== "production") console.warn("[contact]", error.message);
      return { ok: false, error: "unknown" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}
