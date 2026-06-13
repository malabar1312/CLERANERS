import { track } from "@vercel/analytics";

/**
 * Eventos del funnel de conversión de cleaners.
 *
 * Cada evento mide un paso clave. Vercel Analytics los muestra en el
 * dashboard → Events → Custom Events. Son privacy-friendly (no cookies
 * de terceros, no PII en los props — el `hood` es un barrio, no identifica).
 *
 * Funnel de reserva (el que importa):
 *   search → cleaner_view → booking_start → booking_pay → booking_success
 *
 * La caída clave a vigilar: booking_pay (click "betalen") → booking_success
 * (volvió de Stripe pagado). El abandono ahí ocurre EN la página de Stripe.
 *
 * Funnel beta paralelo (sin catálogo real): waitlist_signup.
 */

/** El usuario lanzó una búsqueda de cleaners (hero o sticky search). Tope del funnel. */
export function trackSearch(opts: {
  source: "hero" | "sticky";
  hood?: string;
  hasDate: boolean;
  hasTime: boolean;
}) {
  track("search", {
    source: opts.source,
    hood: opts.hood && opts.hood.length > 0 ? opts.hood : "(none)",
    has_date: opts.hasDate,
    has_time: opts.hasTime,
  });
}

/** El usuario envió su email en la wachtlijst (hero/footer) o como lead de host. */
export function trackWaitlistSignup(source: "hero" | "footer" | "airbnb-host") {
  track("waitlist_signup", { source });
}

/** El usuario vio el perfil de un cleaner. */
export function trackCleanerView(cleanerId: string) {
  track("cleaner_view", { cleaner_id: cleanerId });
}

/** El usuario abrió el modal de booking ("Boek nu"). */
export function trackBookingStart(cleanerId: string) {
  track("booking_start", { cleaner_id: cleanerId });
}

/** El usuario clickeó "Veilig betalen" (paso 3 del booking) → redirige a Stripe. */
export function trackBookingPay(cleanerId: string, totalCents: number) {
  track("booking_pay", { cleaner_id: cleanerId, total_cents: totalCents });
}

/** Conversión final: volvió de Stripe a /booking/success con el pago confirmado. */
export function trackBookingSuccess(totalCents: number) {
  track("booking_success", { total_cents: totalCents });
}

/** El usuario se registró (signup). */
export function trackSignup() {
  track("signup");
}

/** El usuario hizo login. */
export function trackLogin() {
  track("login");
}
