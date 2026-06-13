"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getIdentifier } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import {
  isConnectEnabled,
  createExpressAccount,
  onboardingLink,
} from "@/lib/stripe/connect";

/**
 * Server Actions — onboarding del cleaner a Stripe Connect (Express).
 *
 * El cleaner pulsa "activeer uitbetalingen" → creamos (o reusamos) su cuenta
 * Express, guardamos el `stripe_connect_account_id` con service-role (el cleaner
 * no puede tocar ese flag — trigger), y devolvemos un account link. Al volver,
 * el webhook `account.updated` marca `stripe_charges_enabled` cuando la
 * capability transfers queda activa.
 */

export type ConnectStatus = {
  enabled: boolean; // Connect activo a nivel plataforma
  hasAccount: boolean;
  chargesEnabled: boolean;
};

export type OnboardingResult =
  | { ok: true; url: string }
  | { ok: false; error: "unauthenticated" | "not_cleaner" | "no_profile" | "disabled" | "rate_limited" | "config_missing" | "unknown" };

/** Origin canónico: de la config (no del header host, manipulable). */
async function canonicalOrigin(): Promise<string> {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${proto}://${host}`;
}

/** Lee el estado Connect del cleaner logueado (para pintar la UI del dashboard). */
export async function getConnectStatus(): Promise<ConnectStatus> {
  const base: ConnectStatus = { enabled: isConnectEnabled(), hasAccount: false, chargesEnabled: false };
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return base;
    const { data } = await supabase
      .from("cleaner_profiles")
      .select("stripe_connect_account_id, stripe_charges_enabled")
      .eq("profile_id", user.id)
      .maybeSingle();
    if (!data) return base;
    return {
      enabled: base.enabled,
      hasAccount: !!data.stripe_connect_account_id,
      chargesEnabled: data.stripe_charges_enabled === true,
    };
  } catch {
    return base;
  }
}

/** Crea/continúa el onboarding Connect y devuelve el account link. */
export async function startCleanerOnboarding(): Promise<OnboardingResult> {
  const hdrs = await headers();
  if (!rateLimit("connect_onboard", getIdentifier(hdrs), { limit: 8, windowMs: 600_000 })) {
    return { ok: false, error: "rate_limited" };
  }
  if (!isConnectEnabled()) return { ok: false, error: "disabled" };
  if (!env.STRIPE_SECRET_KEY) return { ok: false, error: "config_missing" };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  // Verificar rol cleaner.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "cleaner") return { ok: false, error: "not_cleaner" };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "config_missing" };

  const { data: cp } = await admin
    .from("cleaner_profiles")
    .select("profile_id, stripe_connect_account_id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!cp) return { ok: false, error: "no_profile" };

  try {
    let accountId: string | null = cp.stripe_connect_account_id ?? null;

    if (!accountId) {
      accountId = await createExpressAccount(user.email);
      const { error } = await admin
        .from("cleaner_profiles")
        .update({ stripe_connect_account_id: accountId })
        .eq("profile_id", user.id);
      if (error) throw new Error(`store account id: ${error.message}`);
    }

    const origin = await canonicalOrigin();
    const url = await onboardingLink(accountId, origin);
    return { ok: true, url };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[connect] onboarding error:", err instanceof Error ? err.message : err);
    }
    return { ok: false, error: "unknown" };
  }
}
