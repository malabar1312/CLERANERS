"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit, getIdentifier } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
});

const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(120),
});

export type AuthResult =
  | { ok: true }
  | { ok: false; error: "invalid_input" | "invalid_credentials" | "email_taken" | "unknown" };

/**
 * Server Action — login con email + password.
 * Usa `signInWithPassword` de Supabase Auth. La sesión se escribe
 * en cookies vía `@supabase/ssr` → el middleware la refresca.
 */
export async function signIn(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  // Rate limit: 10 attempts per IP per 5 minutes (brute-force protection).
  const hdrs = await headers();
  if (!rateLimit("signin", getIdentifier(hdrs), { limit: 10, windowMs: 300_000 })) {
    return { ok: false, error: "unknown" };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { ok: false, error: "invalid_credentials" };
    }
    return { ok: false, error: "unknown" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Server Action — registro con nombre + email + password.
 * Supabase manda un email de confirmación (configurable en Dashboard →
 * Auth → Email Templates). El `name` se guarda en `user_metadata`.
 */
export async function signUp(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  // Rate limit: 3 signups per IP per 10 minutes (registration abuse).
  const hdrs = await headers();
  if (!rateLimit("signup", getIdentifier(hdrs), { limit: 3, windowMs: 600_000 })) {
    return { ok: false, error: "unknown" };
  }

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { ok: false, error: "email_taken" };
    }
    return { ok: false, error: "unknown" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Server Action — cerrar sesión. Borra la cookie y redirige al home.
 */
export async function signOut(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
