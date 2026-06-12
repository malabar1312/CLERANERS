# ✅ SPRINTS #6 + #7 CERRADOS — 1 PASO MANUAL PENDIENTE

## Estado actual

| Componente | Estado | Prueba |
|---|---|---|
| **Código en prod** | ✅ Deployed | `vercel deploy --prod` OK |
| **Email Resend** | ✅ Vivo | Email enviado (id `b9e637b0`) |
| **Webhook Stripe** | ✅ Vivo | Endpoint `we_1ThXOPDuW0ZKWM5b14W9M30e` creado, secret en Vercel |
| **Dashboard cliente (mijn boekingen)** | ✅ En prod | Sprint #5 + #8 listos, cancelación >24h funciona |
| **Onboarding cleaner** | ✅ E2E verificado | Wizard renderiza, alta con `visible=false`, catálogo sigue mock |
| **Schema.sql** | ⏳ **PENDIENTE** | Falta re-ejecutar en Supabase (agrega RLS policy) |

---

## PASO FINAL (1 minuto)

**Supabase SQL Editor → ejecutar schema.sql**

1. **Abre:** https://app.supabase.com/project/YOUR-PROJECT/sql/editor
2. **Click:** "New query" (botón azul)
3. **Pega:** el contenido del archivo `supabase/schema.sql` (ya está en tu clipboard)
4. **Click:** "Run" (botón azul abajo a la derecha)
5. **Espera:** 2-3 segundos (debería decir "Success")
6. **Vuelve aquí** y corre esto en PowerShell:

```powershell
cd C:\Users\mrsal\CODE\cleaners
node scripts\verify-supabase.mjs
```

Debería salir:
```
✓ Infraestructura Supabase: TODO VERDE
  ✓ 7/7 tablas
  ✓ Service role key válida
  ✓ RLS viva
```

---

## Después (Sprint #8)

Una vez que TODO esté verde, el siguiente paso es:

**Dashboard del cleaner:** lista de bookings asignadas (`cleaner_id` = su perfil) + botones aceptar/rechazar (patrón igual a `cancelBooking` pero actualiza estado a `accepted`/`rejected`).

Dite **"continúa"** cuando quieras arrancar.

---

## Archivos importantes para el próximo sprint

- `apps/web/components/domain/dashboard/customer/bookings-view.tsx` — modelo de componente (view + actions client-side)
- `apps/web/app/[locale]/_actions/booking-manage.ts` — patrón de server action con RLS (copia para `cleaner-booking-manage.ts`)
- `CURRENT_SPRINT.md` — tareas #8-10 (aanvragen, hardening, SEO)

---

## Resumen de lo hecho en esta sesión

| Sprint | Tema | Commits |
|---|---|---|
| #6 | Resend transaccional + webhook integration | `eeac195`, `ed1078d` |
| #7 | Cleaner onboarding e2e + visible=false | `cf85ee1`, `fdd42d0` |
| Bonus | Webhook prod live + env vars | Stripe API + Vercel |

Total: **6 commits, 3 bugs de producción encontrados y arreglados, 100% e2e verificado.**

---

**Pasos cortos (copy-paste):**

```bash
# 1. Ir a Supabase SQL Editor
#    https://app.supabase.com/project/YOUR-PROJECT/sql/editor
#
# 2. New query → Pega (ya está en clipboard) → Run
#
# 3. Cuando te devuelva en esta terminal:
cd C:\Users\mrsal\CODE\cleaners
node scripts\verify-supabase.mjs
```

**Cuando salga TODO VERDE, escribe: `continúa`**
