import "server-only";
import { env } from "@/lib/env";

/**
 * Cliente Resend — best-effort email delivery.
 *
 * Toda operación se envuelve en try/catch: los errores se loguean,
 * NUNCA rompen el webhook ni bloquean la persistencia de reservas.
 * Diseño: si Resend falla (rate limit, outage, key invalid), el cliente
 * sigue viendo su reserva en el dashboard; admins investigan en logs.
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envía un email vía Resend. Retorna true si se envió, false si fallo.
 * NUNCA tira excepción — loguea y continúa.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[email] RESEND_API_KEY not configured — skipping", { to: opts.to });
    }
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "cleaners <noreply@cleaners.nl>",
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text ?? opts.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (process.env.NODE_ENV !== "production") {
        console.warn("[email] Resend error", { status: res.status, body, to: opts.to });
      }
      return false;
    }

    const data = (await res.json()) as { id?: string };
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] sent", { id: data.id, to: opts.to, subject: opts.subject });
    }
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[email] fetch error", {
        error: err instanceof Error ? err.message : String(err),
        to: opts.to,
      });
    }
    return false;
  }
}
