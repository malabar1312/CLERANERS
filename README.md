# cleaners · getcleaners.nl

Marketplace premium de schoonmaak en Ámsterdam. El cliente elige quién entra a su casa.
**Stack:** HTML/CSS/JS vanilla · Supabase · Vercel. Sin frameworks, sin build.

> 🧠 **Antes de tocar nada, lee [`CLAUDE.md`](./CLAUDE.md)** — contexto, marca, reglas y estado del proyecto.

## Estructura
```
cleaners/
├── CLAUDE.md              # memoria del proyecto (leer primero)
├── index.html             # landing (+ search, perfil, checkout, auth)
├── cleaner-signup.html    # wizard de alta (7 pasos)
├── cleaner-dashboard.html # dashboard cleaner
├── client-dashboard.html  # dashboard cliente
├── admin.html             # panel interno
├── reset-password.html
├── config.js · vercel.json · *.sql · assets (favicon, og, manifest…)
├── backend/               # Stripe Connect + Supabase (escrito, sin desplegar)
│   ├── SETUP-STRIPE.md     # guía paso a paso de despliegue
│   ├── supabase/migrations/ · supabase/functions/{create-checkout,stripe-webhook,refund}
│   └── frontend-integration/  # pago.js + patch para conectar booking real
└── docs/                  # briefing, changelog de diseño, docs legacy
```

## Desarrollo local
```bash
# servir el sitio estático (cualquier server vale)
npx serve .        # o: python -m http.server   (o un server node simple)
```
Validación visual: Playwright con `channel:'chrome'` a 1440×900 y 390×844 (ver CLAUDE.md → Reglas de trabajo).

## Deploy
- **Web:** conectar este repo a GitHub y a Vercel (deploy estático del root).
  ```bash
  git remote add origin <TU_REPO_GITHUB>
  git push -u origin main
  ```
- **Backend (Supabase):** seguir [`backend/SETUP-STRIPE.md`](./backend/SETUP-STRIPE.md).

## Estado
Refactor visual + paridad móvil completos. Backend de pagos escrito, pendiente de desplegar (requiere cuenta Stripe + login Supabase). Detalle en `CLAUDE.md`.
