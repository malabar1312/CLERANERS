# Supabase Email Configuration — GetCleaners

> Follow these steps to make email confirmation and password reset work.

## 1. Set the Site URL

**Supabase Dashboard → Authentication → URL Configuration**

| Field | Value |
|---|---|
| **Site URL** | `https://cleaners-web.vercel.app` |
| **Redirect URLs** | Add these three: |
| | `https://cleaners-web.vercel.app/auth/callback` |
| | `https://cleaners-web.vercel.app/auth/confirm` |
| | `http://localhost:3000/auth/callback` (for dev) |

> When you have the custom domain `getcleaners.nl`, add `https://getcleaners.nl/auth/callback` and `https://getcleaners.nl/auth/confirm` too.

## 2. Set Vercel Environment Variables

**Vercel Dashboard → cleaners-web → Settings → Environment Variables**

Add (if not already set):

```
NEXT_PUBLIC_SITE_URL = https://cleaners-web.vercel.app
```

> This tells the auth system where to redirect after email confirmation.

## 3. Paste the Corporate Email Templates

Go to **Supabase Dashboard → Authentication → Email Templates**.

### 3a. Confirm signup

**Subject:** `Bevestig je e-mailadres — cleaners`

**Body:** (paste the HTML from below)

```html
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>cleaners</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Bevestig je e-mailadres om je cleaners-account te activeren.
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F9F9F9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <span style="font-size:22px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;" translate="no">
                <span style="color:#0066FF;font-size:18px;">&#9733;</span>&nbsp;cleaners
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 40px 40px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;line-height:1.3;">
                Welkom bij cleaners
              </h1>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#6B7280;">
                Bevestig je e-mailadres om je account te activeren. Daarna kun je direct aan de slag.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                <tr>
                  <td style="background-color:#0066FF;border-radius:999px;padding:14px 32px;">
                    <a href="{{ .ConfirmationURL }}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;" target="_blank">
                      Bevestig e-mailadres &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
                Deze link is 24 uur geldig. Als je deze e-mail niet hebt aangevraagd, kun je hem veilig negeren.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #E5E7EB;background-color:#F9F9F9;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;text-align:center;">
                Je ontvangt deze e-mail omdat je een account hebt aangemaakt op
                <a href="{{ .SiteURL }}" style="color:#0066FF;text-decoration:none;" translate="no">cleaners</a>.
                <br />Jij kiest wie jouw huis binnenkomt.
              </p>
              <p style="margin:12px 0 0;font-size:11px;line-height:1.5;color:#6B7280;text-align:center;">
                &copy; 2026 cleaners &middot; Amsterdam, Nederland
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### 3b. Reset password

**Subject:** `Wachtwoord resetten — cleaners`

**Body:**

```html
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>cleaners</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Reset je wachtwoord voor cleaners.
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F9F9F9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <span style="font-size:22px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;" translate="no">
                <span style="color:#0066FF;font-size:18px;">&#9733;</span>&nbsp;cleaners
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 40px 40px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;line-height:1.3;">
                Wachtwoord resetten
              </h1>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#6B7280;">
                Je hebt een wachtwoord-reset aangevraagd. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                <tr>
                  <td style="background-color:#0066FF;border-radius:999px;padding:14px 32px;">
                    <a href="{{ .ConfirmationURL }}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;" target="_blank">
                      Nieuw wachtwoord instellen &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
                Deze link is 1 uur geldig. Als je geen reset hebt aangevraagd, kun je deze e-mail veilig negeren.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #E5E7EB;background-color:#F9F9F9;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;text-align:center;">
                Je ontvangt deze e-mail omdat je een account hebt op
                <a href="{{ .SiteURL }}" style="color:#0066FF;text-decoration:none;" translate="no">cleaners</a>.
                <br />Jij kiest wie jouw huis binnenkomt.
              </p>
              <p style="margin:12px 0 0;font-size:11px;line-height:1.5;color:#6B7280;text-align:center;">
                &copy; 2026 cleaners &middot; Amsterdam, Nederland
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### 3c. Magic link

**Subject:** `Inloglink — cleaners`

**Body:**

```html
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>cleaners</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Log direct in op cleaners.
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F9F9F9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <span style="font-size:22px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;" translate="no">
                <span style="color:#0066FF;font-size:18px;">&#9733;</span>&nbsp;cleaners
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 40px 40px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;line-height:1.3;">
                Inloglink
              </h1>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#6B7280;">
                Klik hieronder om direct in te loggen op je cleaners-account. Geen wachtwoord nodig.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                <tr>
                  <td style="background-color:#0066FF;border-radius:999px;padding:14px 32px;">
                    <a href="{{ .ConfirmationURL }}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;" target="_blank">
                      Inloggen &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
                Deze link is 10 minuten geldig en kan slechts een keer worden gebruikt.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #E5E7EB;background-color:#F9F9F9;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;text-align:center;">
                Je ontvangt deze e-mail omdat je een account hebt op
                <a href="{{ .SiteURL }}" style="color:#0066FF;text-decoration:none;" translate="no">cleaners</a>.
                <br />Jij kiest wie jouw huis binnenkomt.
              </p>
              <p style="margin:12px 0 0;font-size:11px;line-height:1.5;color:#6B7280;text-align:center;">
                &copy; 2026 cleaners &middot; Amsterdam, Nederland
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### 3d. Invite user

**Subject:** `Je bent uitgenodigd — cleaners`

**Body:**

```html
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>cleaners</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Je bent uitgenodigd voor cleaners.
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F9F9F9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <span style="font-size:22px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;" translate="no">
                <span style="color:#0066FF;font-size:18px;">&#9733;</span>&nbsp;cleaners
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 40px 40px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;line-height:1.3;">
                Je bent uitgenodigd
              </h1>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#6B7280;">
                Je bent uitgenodigd om een account aan te maken op <span translate="no">cleaners</span>, het platform waar jij kiest wie jouw huis binnenkomt.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                <tr>
                  <td style="background-color:#0066FF;border-radius:999px;padding:14px 32px;">
                    <a href="{{ .ConfirmationURL }}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;" target="_blank">
                      Uitnodiging accepteren &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
                Deze link is 7 dagen geldig.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #E5E7EB;background-color:#F9F9F9;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;text-align:center;">
                <a href="{{ .SiteURL }}" style="color:#0066FF;text-decoration:none;" translate="no">cleaners</a>
                — Jij kiest wie jouw huis binnenkomt.
              </p>
              <p style="margin:12px 0 0;font-size:11px;line-height:1.5;color:#6B7280;text-align:center;">
                &copy; 2026 cleaners &middot; Amsterdam, Nederland
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## 4. Verify It Works

1. Go to your site → `/signup`
2. Create an account with a real email
3. You should see the "Controleer je inbox" page
4. Check your email — you should receive the branded confirmation email
5. Click the blue button → you should be redirected to your site, logged in
6. If you signed up as a cleaner → redirected to `/onboarding/schoonmaker`
7. If you signed up as a customer → redirected to `/`

## 5. Troubleshooting

| Problem | Fix |
|---|---|
| Email link goes to `localhost:3000` | Set `NEXT_PUBLIC_SITE_URL` in Vercel env vars AND the Site URL in Supabase dashboard |
| 404 after clicking email link | Make sure the Redirect URLs in Supabase include your callback URLs |
| "Exchange failed" error | The code has expired (>24h) or was already used. Ask user to sign up again |
| Email not arriving | Check Supabase Dashboard → Authentication → Rate Limits (default: 4 emails/hour) |
