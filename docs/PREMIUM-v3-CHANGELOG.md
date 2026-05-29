# Premium v3 · Airbnb × Booking · Profesional Sobrio

**Reemplaza**: v1 y v2 (descartar)
**Dirección**: Mantener línea actual + refinamientos quirúrgicos en clave Airbnb × Booking
**Cómo revertir**: borrar bloque `<style id="premium-v3">…</style>` en `<head>` + script de fallback al final del `<body>`

---

## Qué cambia respecto al v2 que no funcionó

**Fuera** (todo el "AI slop"):
- ❌ Cyan electric #22D3EE (era neón)
- ❌ Aurora multicolor animada (parecía web3/crypto)
- ❌ Award pill con bandera + glow pulsante
- ❌ Stats strip con Instrument Serif italic gigante (200+, 4,9★, 4,2k)
- ❌ Trust pills con SVG iconos cyan
- ❌ Floating cards con badges glow (Online nu, ★ 5.0 · 47 reviews, Beschikbaar za.)
- ❌ Live activity ticker marquee
- ❌ Orb glow detrás de las cards
- ❌ Shimmer animation en botones
- ❌ Multi-layer 4-stack shadows
- ❌ Border-radius 24px dramático

**Dentro** (Airbnb × Booking):
- ✅ Sombras Airbnb-style: `0 6px 16px rgba(0,0,0,.08)` — sutiles, una sola capa
- ✅ Cards border-radius 16px (Airbnb estándar)
- ✅ Search box BLANCO prominente estilo Booking
- ✅ Botones azules sólidos, hover darker, sin shimmer
- ✅ Form fields con border 1px (#B0B0B0 Airbnb)
- ✅ Hover lift 2-3px (no 5px dramatic)
- ✅ Trust badge sobre foto estilo "Superhost" pill blanca
- ✅ Modal border-radius 16px (no 24px)
- ✅ Tabs estilo iOS pill switcher (lo que ya funciona en Airbnb)
- ✅ Mesh discreto en hero (lo que ya había, NO aurora multicolor)
- ✅ Reveal animations más sobrias (cubic-bezier suave)

---

## Cambios visuales aplicados

### Hero
| | Antes | Después |
|---|---|---|
| Eyebrow | Pill plana con dot pulse exagerado | Pill plana con dot verde estático sutil |
| Título (Instrument Serif italic) | Sin cambios | Refinement letter-spacing y margin |
| Lead | Texto base | Color +5% legibilidad, max-width 500px |
| CTAs | Funcional | Spacing limpio, hover Airbnb |
| Hproof avatars | Avatars planos | Border navy + shadow sutil |
| Mesh background | Mantenido | Mantenido (era OK) |

### Floating cards (Sofia, Maria, Carmen)
- Border-radius 16px (era 18px)
- Background glass más sutil
- Shadow Airbnb: `0 12px 32px -8px rgba(0,0,0,.4)`
- Hover: lift 3px (no 5px), background +3% blur

### Search box (Booking-style)
- **Background blanco** (era glass dark) → mucho más prominente
- Labels uppercase 11px (Booking pattern)
- Border-radius 16px
- Shadow 2-layer Booking
- Hover/focus fields: tint sutil F8FAFC
- CTA "Zoeken" azul sólido sin gradient

### Trust bar (.tbar)
- Background gris muy claro (#FAFBFC)
- Tipografía más limpia (font-weight 500)
- Hover color azul brand

### Cleaner result cards (.rc)
- **Estilo Airbnb completo**:
  - Border `#EBEBEB` (Airbnb gray)
  - Border-radius 16px
  - Hover: lift 2px + shadow `0 8px 28px rgba(0,0,0,.1)`
  - Image scale 1.04 (no 1.08 dramatic)
  - Badge "★ 4.9 Superhost-style" blanco con estrella amarilla
  - Tags con background `#F7F7F7` sin border
  - Botón outline negro Airbnb-style
  - Heart icon más visible

### Buttons globales
- Primary: azul sólido, shadow simple, hover blueh darker
- Ghost: rgba blanco sutil
- White: con shadow Airbnb
- Outline: border ink negro Airbnb

### Nav scrolled
- Blur 20px (no 28px dramatic)
- Border bottom sutil

### Auth modal
- Border-radius 16px (no 24)
- Shadow modal Airbnb: 2-layer simple
- Logo SIN halo glow
- Tabs pill switcher fondo `#F7F7F7`
- Form fields border `#B0B0B0` Airbnb
- Role cards border 1px `#B0B0B0`, hover sin lift dramatic, solo color
- Social buttons border negro Airbnb-style

### Sections (How it works, Trust, FAQ)
- Padding section 88px (más breathing room Airbnb)
- Headings letter-spacing -1.2px más cinemático

### Focus states
- Outline azul 2px con offset 3px
- Border-radius 8px focus ring

---

## Lo que NO se tocó (preservado intacto)

- ❌ Cero handlers JS, IDs, onclick, data attributes
- ❌ Cero llamadas a Supabase / config.js
- ❌ Cero líneas eliminadas del HTML original
- ❌ Brand: navy/blue/Plus Jakarta/Instrument Serif/star logo/translate="no"
- ❌ Auth, cookies, drawer móvil
- ❌ Otros modals (bookings, info, profile, checkout)
- ❌ Admin panel, cleaner-signup, dashboards (esos son fases siguientes)

---

## Verificación al deployar

1. Sube `index.html` a GitHub → Vercel deploya
2. **Hard refresh** Ctrl+Shift+R / ⌘+Shift+R
3. Comprueba:
   - [ ] Hero: navy con título Instrument Serif italic elegante (igual que antes, sin cambios drámáticos)
   - [ ] Eyebrow: pill simple "● Vertrouwensplatform · Amsterdam" con dot verde estático
   - [ ] Search box: **BLANCO prominente** con labels uppercase
   - [ ] Trust bar bajo search: fondo blanco/gris claro, items legibles
   - [ ] Cleaner cards de resultados: border-radius 16px, hover lift sutil
   - [ ] Botones: azules sólidos, sin gradient ni shimmer
   - [ ] Auth modal (click Inloggen): bordes 16px, formas Airbnb-clean

Si algo no convence:
- Borra `<style id="premium-v3">…</style>` en el `<head>`
- Borra el script con comentario "Premium v3 fallback" antes de `</body>`
- Vuelve al estado original exacto

---

## Decisión sobre próximas fases

Antes de Fase 2, **valida este v3 primero**. Si te gusta la línea, las siguientes fases mantienen exactamente este lenguaje:
- Cards Airbnb 16px radius, shadow sutil
- Botones azul sólido sin shimmer
- Search/forms Booking-clean
- Modals 16px radius
- Cero animaciones constantes
- Cero gradient text
- Cero badges glow
