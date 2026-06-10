"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getPathname } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit, getIdentifier } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/url";

// Login mantiene min(6) por compat con usuarios pre-cycle-4 que registraron
// con 6 chars. Solo el signup endurece la política para nuevos usuarios.
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
});

/** Patrones triviales más comunes en NL/EN. Blocklist conservadora. */
const WEAK_PASSWORD_PATTERNS = [
  /^(.)\1+$/,                 // todos los chars iguales: "aaaaaa"
  /^123456/,                  // empieza con secuencia trivial
  /^password/i,
  /^welkom/i,
  /^qwerty/i,
  /^abc123/i,
  /^letmein/i,
];

function isStrongEnough(pw: string): boolean {
  if (pw.length < 10) return false;
  for (const re of WEAK_PASSWORD_PATTERNS) if (re.test(pw)) return false;
  return true;
}

const signupSchema = z.object({
  email: z.string().trim().email(),
  // Política endurecida AUTO-CYCLE 4: ≥10 chars + no patterns triviales.
  password: z.string().min(10).max(200).refine(isStrongEnough, "weak_password"),
  name: z.string().trim().min(2).max(120),
  // Role discrimination — el trigger DB valida + sanea, pero validamos también
  // acá para fallar temprano y dar mejor mensaje. `admin` nunca por signup.
  role: z.enum(["customer", "cleaner"]).optional(),
  // Honeypot: campo invisible para humanos; bots lo rellenan. Si tiene valor,
  // tratamos el signup como abuso (200 OK silencioso, NO creamos cuenta).
  website: z.string().max(0).optional(),
});

export type AuthResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "invalid_credentials"
        | "email_taken"
        | "weak_password"
        | "unknown";
    };

export type ResetResult = { ok: true } | { ok: false; error: "unknown" };

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
  const locale = await getLocale();
  redirect(getPathname({ href: "/", locale }));
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

  // Honeypot check ANTES de Zod: si el campo `website` viene con valor, es bot.
  // Devolvemos 200 OK silencioso (no revelamos detección al atacante; no
  // gastamos llamada a Supabase).
  if (typeof formData.get("website") === "string" && (formData.get("website") as string).length > 0) {
    return { ok: true };
  }

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? undefined,
    website: formData.get("website") ?? undefined,
  });
  if (!parsed.success) {
    // Detectamos si el motivo es weak_password para dar mensaje específico.
    const isWeak = parsed.error.issues.some(
      (i) => i.path[0] === "password" && (i.message === "weak_password" || i.code === "too_small"),
    );
    return { ok: false, error: isWeak ? "weak_password" : "invalid_input" };
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl = getSiteUrl();
  const role = parsed.data.role ?? "customer";

  // After email verification, Supabase redirects to /auth/callback.
  // The callback route reads the user's role and redirects accordingly:
  //   cleaner → /onboarding/schoonmaker
  //   customer → /
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // `full_name` + `role` van a raw_user_meta_data; el trigger
      // `handle_new_user` los lee para crear la fila de `profiles`.
      data: {
        full_name: parsed.data.name,
        role,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?type=signup`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { ok: false, error: "email_taken" };
    }
    return { ok: false, error: "unknown" };
  }

  revalidatePath("/", "layout");
  const locale = await getLocale();

  // Redirect to "check your email" page instead of the final destination.
  // The actual destination routing happens in /auth/callback after
  // the user clicks the confirmation link.
  redirect(getPathname({ href: "/signup/verify", locale }));
}

/**
 * Server Action — solicitar reset de contraseña. Supabase envía un email
 * con un link mágico. Siempre devuelve ok (no revela si el email existe).
 */
export async function requestPasswordReset(
  _prev: ResetResult | null,
  formData: FormData,
): Promise<ResetResult> {
  const hdrs = await headers();
  if (!rateLimit("reset", getIdentifier(hdrs), { limit: 3, windowMs: 300_000 })) {
    return { ok: false, error: "unknown" };
  }

  const email = z.string().trim().email().safeParse(formData.get("email"));
  if (!email.success) return { ok: true }; // Don't reveal invalid = no account.

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: `${getSiteUrl()}/auth/callback?type=recovery`,
    });
  } catch {
    // Swallow — never reveal whether the email exists.
  }

  return { ok: true };
}

/**
 * Server Action — cerrar sesión. Borra la cookie y redirige al home.
 */
export async function signOut(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  const locale = await getLocale();
  redirect(getPathname({ href: "/", locale }));
}
