import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Cliente Stripe (server-only). Usa la SECRET key (test) de `.env.local`.
 * NUNCA importar desde un Client Component. La secret jamás llega al browser.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY missing — añadila a apps/web/.env.local (test: sk_test_...).",
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      // Sin apiVersion explícita → usa la pinneada por el SDK (estable).
      typescript: true,
      appInfo: { name: "cleaners", url: "https://getcleaners.nl" },
    });
  }
  return _stripe;
}
