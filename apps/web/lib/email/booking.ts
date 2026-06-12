import "server-only";
import { sendEmail } from "./client";
import { bookingConfirmedEmail } from "./templates";
import { formatEur } from "@/lib/booking/pricing";

/**
 * Envía email de confirmación de boeking al cliente.
 * Best-effort: nunca rompe el webhook.
 */
export async function sendBookingConfirmedEmail(opts: {
  clientEmail: string | null;
  cleanerName: string;
  reference: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  hours: number | null;
  totalCents: number | null;
}): Promise<void> {
  if (!opts.clientEmail) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[email/booking] no client email");
    }
    return;
  }

  const date = opts.scheduledDate ?? "—";
  const hours = opts.hours ?? 0;
  const price = opts.totalCents != null ? formatEur(opts.totalCents) : "—";
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://getcleaners.nl"}/dashboard?view=bookings`;

  const html = bookingConfirmedEmail({
    cleanerName: opts.cleanerName,
    date,
    time: opts.scheduledTime ?? "",
    hours,
    price,
    reference: opts.reference,
    dashboardUrl,
  });

  const sent = await sendEmail({
    to: opts.clientEmail,
    subject: `Je boeking is bevestigd — ${opts.reference}`,
    html,
  });

  if (!sent && process.env.NODE_ENV !== "production") {
    console.warn("[email/booking] failed to send", { reference: opts.reference, to: opts.clientEmail });
  }
}
