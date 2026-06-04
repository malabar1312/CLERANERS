import { track } from "@vercel/analytics";

/**
 * Eventos del funnel de conversión de cleaners.
 *
 * Cada evento mide un paso clave. Vercel Analytics los muestra en el
 * dashboard → Events → Custom Events. Son privacy-friendly (no cookies
 * de terceros, no PII en los props).
 *
 * Funnel: visit → waitlist_signup → cleaner_view → booking_start → booking_pay
 */

/** El usuario envió su email en la wachtlijst del hero. */
export function trackWaitlistSignup(source: "hero" | "footer") {
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

/** El usuario clickeó "Veilig betalen" (paso 3 del booking). */
export function trackBookingPay(cleanerId: string, totalCents: number) {
  track("booking_pay", { cleaner_id: cleanerId, total_cents: totalCents });
}

/** El usuario se registró (signup). */
export function trackSignup() {
  track("signup");
}

/** El usuario hizo login. */
export function trackLogin() {
  track("login");
}
