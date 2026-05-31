/**
 * Booking pricing — reglas LOCKED del brief.
 *
 * La superficie (m²) define las horas:
 *   ≤50 → 2u · 50-80 → 3u · 80-120 → 4u · 120+ → 5u
 *
 * Fee al cliente = 18% sobre el subtotal (cubre 15% plataforma + ~3% Stripe).
 * Todo se calcula en CÉNTIMOS (enteros) para evitar errores de coma flotante.
 */

export const SERVICE_FEE_PCT = 0.18;
export const PLATFORM_FEE_PCT = 0.15; // application_fee del destination charge (Fase 4)

export function hoursForArea(m2: number): number {
  if (m2 <= 50) return 2;
  if (m2 <= 80) return 3;
  if (m2 <= 120) return 4;
  return 5;
}

export type PriceBreakdown = {
  hours: number;
  /** €/u del cleaner (euros). */
  pricePerHour: number;
  subtotalCents: number;
  feeCents: number;
  totalCents: number;
  feePct: number;
};

/** Calcula el desglose a partir del precio/hora (euros) y los m². */
export function computePrice(pricePerHour: number, m2: number): PriceBreakdown {
  const hours = hoursForArea(m2);
  const subtotalCents = Math.round(hours * pricePerHour * 100);
  const feeCents = Math.round(subtotalCents * SERVICE_FEE_PCT);
  const totalCents = subtotalCents + feeCents;
  return { hours, pricePerHour, subtotalCents, feeCents, totalCents, feePct: SERVICE_FEE_PCT };
}

/** €1.234,56 estilo NL desde céntimos. */
export function formatEur(cents: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
}

/** Fecha mínima de booking = mañana (no se permite hoy). YYYY-MM-DD. */
export function minBookingDate(now = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
