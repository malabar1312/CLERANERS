# Conectar el booking real (cliente ↔ cleaner) — patches

Hoy el booking del landing se guarda en `localStorage` (demo). Estos 2 patches lo
cambian para que **pase por Stripe y se persista en Supabase**, de modo que el cleaner
reciba la aanvraag de verdad. Son **aditivos**: el demo sigue funcionando hasta que actives REAL_MODE.

## 1) index.html — incluir pago.js
Copiá `pago.js` a la raíz del sitio y añadilo después de `config.js`:
```html
<script src="/config.js"></script>
<script src="/pago.js"></script>
```

## 2) index.html — `doPayment()` real
Reemplazá el cuerpo de `doPayment()` (botón "Betalen") por:
```js
async function doPayment(){
  const c = DB.find(x=>x.id===S.sel); if(!c) return;
  // Si hay backend real (cleaner con cuenta Stripe), cobramos de verdad:
  if (window.IS_REAL_MODE && window.cleanersPago && c.supabase_id) {
    try {
      const {hours} = coCalc();
      await window.cleanersPago.checkout({
        cleaner_id: c.supabase_id,
        service_type: document.getElementById('co-type').value,
        hours,
        scheduled_at: document.getElementById('co-date').value,
        address: document.getElementById('co-addr').value,
      });
      return; // redirige a Stripe Checkout
    } catch(e){ showToast('error', e.message); return; }
  }
  // …fallback DEMO actual (dejar el código existente debajo)…
}
```
> Nota: `c.supabase_id` debe ser el UUID real del cleaner en Supabase. Hoy el `DB`
> es demo (ids 1..8). Cuando las cards se rendericen desde Supabase (ya hay fallback
> en el código: "Cards desde Supabase o demo"), cada `c` traerá su `id` real → usalo ahí.

## 3) cleaner-dashboard.html — aanvragen reales
Donde hoy se pintan las aanvragen demo, cargá las reales:
```js
const reales = await window.cleanersPago.loadCleanerBookings();
// reales = bookings con status 'paid' dirigidos a este cleaner → renderizar como cards
```

## Flujo completo cuando esté activo
1. Cliente elige cleaner → `create-checkout` crea booking `pending` + Stripe Checkout.
2. Cliente paga en Stripe (hosted) → `checkout.session.completed`.
3. `stripe-webhook` marca booking `paid`, escrow `held`, registra `payments`.
4. El cleaner ve la aanvraag real en su dashboard (RLS: solo las suyas).
5. Al confirmar el servicio → liberar escrow (futura función `release` / payout semanal de Connect).
6. Disputa → `refund` (admin) revierte cargo + transferencia + comisión.
