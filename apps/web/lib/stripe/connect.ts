import "server-only";
import { getStripe } from "@/lib/stripe/server";
import { env } from "@/lib/env";

/**
 * Stripe Connect — payouts al cleaner + comisión on-platform.
 *
 * Modelo: destination charge. El cliente paga `subtotal + fee(18%)` en la
 * plataforma; `application_fee_amount = feeCents` se queda la plataforma (de ahí
 * salen ~3% Stripe → neto ~15%); el resto (`subtotal`) se transfiere a la cuenta
 * Express del cleaner. Así la comisión NUNCA se pierde y todo vive on-platform.
 *
 * Flip test↔live: NO hay código que cambiar. Las keys (sk_test_ → sk_live_) son
 * env. `STRIPE_CONNECT_ENABLED="false"` es el kill-switch global (default: ON,
 * "build as if active"). Si el cleaner aún no tiene cuenta activa, el checkout
 * cae con gracia a un cargo normal (sin transfer) — nada se rompe.
 */

/** Connect activo por defecto. Kill-switch: STRIPE_CONNECT_ENABLED="false". */
export function isConnectEnabled(): boolean {
  return env.STRIPE_CONNECT_ENABLED !== "false";
}

/** ¿Este cleaner puede recibir el destination charge? (cuenta + transfers activa) */
export function cleanerCanReceive(c: {
  stripeAccountId?: string | null;
  stripeChargesEnabled?: boolean;
}): boolean {
  return isConnectEnabled() && !!c.stripeAccountId && c.stripeChargesEnabled === true;
}

/** Crea una cuenta Express (NL) para un cleaner. Devuelve el account id. */
export async function createExpressAccount(email?: string | null): Promise<string> {
  const stripe = getStripe();
  const acct = await stripe.accounts.create({
    type: "express",
    country: "NL",
    email: email ?? undefined,
    business_type: "individual",
    // Solo necesita recibir transferencias (destination charge). El cobro al
    // cliente lo hace la plataforma como merchant of record.
    capabilities: { transfers: { requested: true } },
    business_profile: { product_description: "Schoonmaakdiensten via cleaners" },
    metadata: { platform: "cleaners" },
  });
  return acct.id;
}

/** Link de onboarding/refresh para que el cleaner complete su cuenta Connect. */
export async function onboardingLink(accountId: string, origin: string): Promise<string> {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/dashboard?view=earnings&connect=refresh`,
    return_url: `${origin}/dashboard?view=earnings&connect=done`,
    type: "account_onboarding",
  });
  return link.url;
}

/**
 * ¿La cuenta puede recibir fondos? Para un destination charge lo relevante es
 * la capability `transfers` activa (no `charges_enabled`, que es para cobrar
 * directamente — una cuenta transfers-only lo tiene en false y aun así recibe).
 */
export async function accountCanReceive(accountId: string): Promise<boolean> {
  const stripe = getStripe();
  const acct = await stripe.accounts.retrieve(accountId);
  return acct.capabilities?.transfers === "active";
}
