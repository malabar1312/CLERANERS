/**
 * Corporate email templates for Supabase Auth.
 *
 * These templates are designed to be pasted into:
 *   Supabase Dashboard → Authentication → Email Templates
 *
 * They use Go template variables:
 *   {{ .ConfirmationURL }}  — email confirmation link
 *   {{ .Token }}            — OTP token (if using token-based)
 *   {{ .TokenHash }}        — hashed token
 *   {{ .SiteURL }}          — configured site URL
 *   {{ .RedirectTo }}       — redirect URL after confirmation
 *
 * Design: matches the Stitch Quiet-Luxury system.
 *   - White background, clean typography
 *   - Blue accent (#0066FF) for CTAs
 *   - Geist/Inter font stack (falls back to system)
 *   - Minimal, editorial feel
 */

const BRAND = {
  name: "cleaners",
  color: "#0066FF",
  ink: "#0A0A0A",
  muted: "#6B7280",
  line: "#E5E7EB",
  surface: "#F9F9F9",
  white: "#FFFFFF",
  // Using the star SVG inline as base64 would bloat emails.
  // We use a simple text logo instead.
};

/** Shared email wrapper — all templates use this shell. */
function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>cleaners</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.surface};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    cleaners — Jij kiest wie jouw huis binnenkomt
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.surface};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background-color:${BRAND.white};border-radius:16px;border:1px solid ${BRAND.line};overflow:hidden;">
          <!-- Logo bar -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:22px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.02em;" translate="no">
                    <span style="color:${BRAND.color};font-size:18px;">&#9733;</span>&nbsp;cleaners
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:24px 40px 40px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid ${BRAND.line};background-color:${BRAND.surface};">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};text-align:center;">
                Je ontvangt deze e-mail omdat je een account hebt op
                <a href="{{ .SiteURL }}" style="color:${BRAND.color};text-decoration:none;" translate="no">cleaners</a>.
                <br />
                Jij kiest wie jouw huis binnenkomt.
              </p>
              <p style="margin:12px 0 0;font-size:11px;line-height:1.5;color:${BRAND.muted};text-align:center;">
                &copy; ${new Date().getFullYear()} cleaners &middot; Amsterdam, Nederland
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** CTA button — consistent across all templates. */
function ctaButton(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
  <tr>
    <td style="background-color:${BRAND.color};border-radius:999px;padding:14px 32px;">
      <a href="${url}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;letter-spacing:-0.01em;" target="_blank">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

/** Small muted paragraph. */
function smallText(text: string): string {
  return `<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:${BRAND.muted};">${text}</p>`;
}

// ─────────────────────────────────────────────────────────────────────────
// Template: Email Confirmation (signup)
// ─────────────────────────────────────────────────────────────────────────
export const confirmationEmail = emailShell(`
  <h1 style="margin:0;font-size:24px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.02em;line-height:1.3;">
    Welkom bij cleaners
  </h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:${BRAND.muted};">
    Bevestig je e-mailadres om je account te activeren. Daarna kun je direct aan de slag.
  </p>
  ${ctaButton("{{ .ConfirmationURL }}", "Bevestig e-mailadres &rarr;")}
  ${smallText("Deze link is 24 uur geldig. Als je deze e-mail niet hebt aangevraagd, kun je hem veilig negeren.")}
`);

// ─────────────────────────────────────────────────────────────────────────
// Template: Password Recovery
// ─────────────────────────────────────────────────────────────────────────
export const recoveryEmail = emailShell(`
  <h1 style="margin:0;font-size:24px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.02em;line-height:1.3;">
    Wachtwoord resetten
  </h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:${BRAND.muted};">
    Je hebt een wachtwoord-reset aangevraagd. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.
  </p>
  ${ctaButton("{{ .ConfirmationURL }}", "Nieuw wachtwoord instellen &rarr;")}
  ${smallText("Deze link is 1 uur geldig. Als je geen reset hebt aangevraagd, kun je deze e-mail veilig negeren.")}
`);

// ─────────────────────────────────────────────────────────────────────────
// Template: Magic Link
// ─────────────────────────────────────────────────────────────────────────
export const magicLinkEmail = emailShell(`
  <h1 style="margin:0;font-size:24px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.02em;line-height:1.3;">
    Inloglink
  </h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:${BRAND.muted};">
    Klik hieronder om direct in te loggen op je cleaners-account. Geen wachtwoord nodig.
  </p>
  ${ctaButton("{{ .ConfirmationURL }}", "Inloggen &rarr;")}
  ${smallText("Deze link is 10 minuten geldig en kan slechts één keer worden gebruikt.")}
`);

// ─────────────────────────────────────────────────────────────────────────
// Template: Invite (admin invites a user)
// ─────────────────────────────────────────────────────────────────────────
export const inviteEmail = emailShell(`
  <h1 style="margin:0;font-size:24px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.02em;line-height:1.3;">
    Je bent uitgenodigd
  </h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:${BRAND.muted};">
    Je bent uitgenodigd om een account aan te maken op <span translate="no">cleaners</span>, het platform waar jij kiest wie jouw huis binnenkomt.
  </p>
  ${ctaButton("{{ .ConfirmationURL }}", "Uitnodiging accepteren &rarr;")}
  ${smallText("Deze link is 7 dagen geldig.")}
`);

// ─────────────────────────────────────────────────────────────────────────
// Template: Email Change Confirmation
// ─────────────────────────────────────────────────────────────────────────
export const emailChangeEmail = emailShell(`
  <h1 style="margin:0;font-size:24px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.02em;line-height:1.3;">
    E-mailadres wijzigen
  </h1>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:${BRAND.muted};">
    Je hebt een wijziging van je e-mailadres aangevraagd. Klik hieronder om het nieuwe adres te bevestigen.
  </p>
  ${ctaButton("{{ .ConfirmationURL }}", "Nieuw e-mailadres bevestigen &rarr;")}
  ${smallText("Als je dit niet hebt aangevraagd, neem dan direct contact met ons op.")}
`);

// ─────────────────────────────────────────────────────────────────────────
// Template: Booking Confirmation
// ─────────────────────────────────────────────────────────────────────────
export function bookingConfirmedEmail(opts: {
  cleanerName: string;
  date: string;
  time: string;
  hours: number;
  price: string;
  reference: string;
  dashboardUrl: string;
}): string {
  const slotLabel =
    opts.time === "morning"
      ? "Ochtend (08:00)"
      : opts.time === "afternoon"
        ? "Middag (12:00)"
        : "Avond (17:00)";
  return emailShell(`
    <h1 style="margin:0;font-size:24px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.02em;line-height:1.3;">
      Je boeking is bevestigd!
    </h1>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:${BRAND.muted};">
      Goed nieuws — je betaling is ontvangen. Je huis wordt schoongemaakt door <strong>${opts.cleanerName}</strong>.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:32px 0;">
      <tr>
        <td style="background-color:${BRAND.surface};border-radius:12px;padding:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:0 0 12px;font-size:12px;font-weight:600;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.05em;">
                Boeking #${opts.reference}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid ${BRAND.line};font-size:14px;color:${BRAND.muted};">
                <strong style="color:${BRAND.ink};">Datum:</strong> ${opts.date}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid ${BRAND.line};font-size:14px;color:${BRAND.muted};">
                <strong style="color:${BRAND.ink};">Tijdstip:</strong> ${slotLabel}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid ${BRAND.line};font-size:14px;color:${BRAND.muted};">
                <strong style="color:${BRAND.ink};">Duur:</strong> ${opts.hours} uur
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;font-size:14px;color:${BRAND.muted};">
                <strong style="color:${BRAND.ink};font-size:16px;">${opts.price}</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton(opts.dashboardUrl, "Bekijk je boeking →")}

    ${smallText("Je kunt je boeking tot 24 uur van tevoren gratis annuleren. Heb je vragen? <a href=\"mailto:help@cleaners.nl\" style=\"color:${BRAND.color};text-decoration:none;\">Neem contact op</a>.")}
  `);
}
