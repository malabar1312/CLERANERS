"use server";

import { createHash } from "node:crypto";
import { z } from "zod";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe/server";
import { getCleanerById } from "@/lib/mock/cleaners";
import { computePrice, type PriceBreakdown } from "@/lib/booking/pricing";
import { env } from "@/lib/env";

/**
 * Rechaza caracteres de control (C0 < 0x20 y DEL 0x7F) sin usar un regex con
 * bytes de control en el fuente. Anti header/template injection downstream
 * (metadata Stripe, emails Resend). Permite espacios, letras unicode, puntuación.
 */
function noControlChars(s: string): boolean {
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return false;
  }
  return true;
}

const safeStr = (min: number, max: number) =>
  z.string().trim().min(min).max(max).refine(noControlChars, "invalid_chars");

const schema = z.object({
  cleanerId: z.string().min(1).max(60),
  m2: z.coerce.number().int().min(10).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.enum(["morning", "afternoon", "evening"]),
  frequency: z.enum(["once", "weekly", "biweekly"]),
  street: safeStr(2, 120),
  postcode: z.string().trim().regex(/^\d{4}\s?[A-Za-z]{2}$/, "invalid_postcode"),
  city: safeStr(2, 80),
  notes: z.string().trim().max(500).optional(),
  email: z.string().trim().email().max(160),
  name: safeStr(2, 120),
});

export type BookingInput = z.infer<typeof schema>;
export type BookingCheckoutResult = { ok: true; url: string } | { ok: false; error: string };

// Metadata SIN PII (la dirección se persiste en Supabase vía webhook en Fase 4).
function bookingMeta(cleanerId: string, d: BookingInput, p: PriceBreakdown): Record<string, string> {
  return {
    cleaner_id: cleanerId,
    m2: String(d.m2),
    hours: String(p.hours),
    date: d.date,
    time: d.time,
    frequency: d.frequency,
    subtotal_cents: String(p.subtotalCents),
    fee_cents: String(p.feeCents),
    total_cents: String(p.totalCents),
  };
}

/** Origin canónico: SIEMPRE de la config (no del header `host`, manipulable). */
async function canonicalOrigin(): Promise<string> {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  // Fallback solo para dev local sin SITE_URL configurada.
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${proto}://${host}`;
}

/**
 * Server Action — crea una Stripe Checkout Session (TEST) para una reserva.
 *
 * Cobro inmediato (no auth holds — regla del brief). El "escrow" se implementa
 * vía Connect (transfer al cleaner al confirmar) en Fase 4 — por eso no usamos
 * manual capture (rompería iDEAL). El precio es server-authoritative (se deriva
 * del cleaner del server, nunca del cliente). Idempotente: doble-submit no
 * crea cargos duplicados. La persistencia en `bookings` (Supabase) + la
 * verificación real del pago las hace el webhook (Fase 4).
 */
export async function createBookingCheckout(raw: unknown): Promise<BookingCheckoutResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const data = parsed.data;

  const cleaner = getCleanerById(data.cleanerId);
  if (!cleaner) return { ok: false, error: "cleaner_not_found" };

  const price = computePrice(cleaner.pricePerHour, data.m2);
  const meta = bookingMeta(cleaner.id, data, price);
  const origin = await canonicalOrigin();

  // Idempotency: hash estable del payload → reintentos/doble-click no duplican.
  const idempotencyKey = createHash("sha256")
    .update(`${cleaner.id}|${data.date}|${data.time}|${data.email}|${price.totalCents}`)
    .digest("hex");

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        locale: "nl",
        customer_email: data.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: price.subtotalCents,
              product_data: {
                name: `Schoonmaak — ${cleaner.name}`,
                description: `${price.hours} uur · ${data.m2} m² · ${data.date}`,
              },
            },
          },
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: price.feeCents,
              product_data: {
                name: "Servicekosten (18%)",
                description: "Verificatie · escrow · klantsupport",
              },
            },
          },
        ],
        // TODO(fase-4): transfer_data.destination = connected account del cleaner
        // + application_fee_amount = 15% cuando esté onboarded en Connect.
        payment_intent_data: { metadata: meta },
        metadata: meta,
        success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/schoonmakers/${cleaner.id}?canceled=1`,
      },
      { idempotencyKey },
    );

    if (!session.url) return { ok: false, error: "no_url" };
    return { ok: true, url: session.url };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      const msg = err instanceof Error ? err.message : "unknown";
      console.warn("[booking] stripe error:", msg);
    }
    return { ok: false, error: "stripe_error" };
  }
}
