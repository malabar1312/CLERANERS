# GetCleaners — Product Backlog

> Derivado de la Due Diligence ejecutiva. ~100 hallazgos consolidados en 38 ítems.
> Esfuerzo: **S** (≤1 sesión) · **M** (1–2 semanas) · **L** (sprint+ / multi-semana).
> Impacto € es direccional (pre-tracción no hay datos reales para cifras exactas).

---

## 🔴 CRITICAL — bloquea revenue o trust

### C1 · Conectar Supabase + persistencia de bookings
- **Root cause:** la app v2 usa mock data; `lib/supabase/*` existe pero ningún flujo lo usa. El backend (esquema + funciones) vive en el mundo v1, desconectado.
- **Impacto negocio:** bloquea el **100% del revenue**. Sin DB no hay reservas reales, ni historial, ni operación.
- **Esfuerzo:** M
- **Dependencias:** ninguna (es el cimiento). Desbloquea C2, C3, C4, C7, H2–H4.

### C2 · Autenticación real (login / signup / reset + roles)
- **Root cause:** `/login` y `/signup` son stubs "binnenkort"; el v2 nunca cableó `@supabase/ssr`.
- **Impacto negocio:** sin cuentas no hay recurrencia, retención, ni lado cleaner. Bloquea LTV.
- **Esfuerzo:** M
- **Dependencias:** C1.

### C3 · Cerrar el loop de pago real (Connect + escrow liberable)
- **Root cause:** el checkout cobra (test) pero NO hay destination charge al cleaner, ni `application_fee` 15%, ni escrow liberable; el webhook tiene `TODO(supabase)` sin persistir.
- **Impacto negocio:** sin esto el dinero no llega al cleaner → **no hay marketplace de dos lados**; revenue 0 efectivo.
- **Esfuerzo:** M
- **Dependencias:** C1, C2, C4 (el cleaner necesita cuenta Connect onboarded).

### C4 · Alta + KYC real del cleaner (verificación)
- **Root cause:** el lado oferta no tiene producto. `kyc_status` existe en el esquema pero no hay upload, revisión, ni Stripe Identity. Verificación = claim de UI.
- **Impacto negocio:** **trust-crítico**: es el corazón del posicionamiento ("vertrouwensplatform"). Sin verificación real nadie confía → 0 conversión sostenible.
- **Esfuerzo:** L
- **Dependencias:** C1, C2.

### C5 · Supply cold-start — 20–50 cleaners reales verificados en 1 barrio
- **Root cause:** 12 cleaners ficticios (`lib/mock/cleaners.ts`). El problema #1 de todo marketplace (conseguir el lado oferta) está **sin empezar**.
- **Impacto negocio:** **desbloquea TODO**. Sin oferta real el producto no tiene valor; con ella, todo lo demás importa. Es ops, no solo código.
- **Esfuerzo:** L (continuo)
- **Dependencias:** C4 (para verificarlos), C1 (para almacenarlos). **Es el ítem #1 estratégico.**

### C6 · Páginas legales reales (voorwaarden / privacy / cookies / klachten)
- **Root cause:** stubs "binnenkort"; un marketplace que cobra DEBE cumplir GDPR + ley de consumo NL.
- **Impacto negocio:** **riesgo legal/regulatorio** + bloquea activación Stripe live + destruye confianza (links rotos donde se paga).
- **Esfuerzo:** S (con asesoría legal para el texto final)
- **Dependencias:** ninguna técnica; sí input legal.

### C7 · Sistema de reviews reales (verified-only) bien modelado
- **Root cause:** reviews mock; el esquema v1 guarda la review dentro de la fila `bookings` (1:1, sin respuestas, sin moderación). `0002_reviews.sql` planeado, no creado.
- **Impacto negocio:** **trust loop central** del marketplace; sin reviews reales no hay credibilidad ni network effect.
- **Esfuerzo:** M
- **Dependencias:** C1, C2, C3 (review solo de booking `completed`).

---

## 🟠 HIGH IMPACT

### H1 · Search funcional (filtra/navega de verdad)
- **Root cause:** el input de ubicación del hero solo hace scroll; ignora el valor.
- **Impacto negocio:** rompe la intención en el punto de **máxima motivación** → leak de conversión alto en el top of funnel.
- **Esfuerzo:** S
- **Dependencias:** C1 (para buscar contra datos reales) — versión mock sirve interino.

### H2 · Disponibilidad / agenda del cleaner + matching
- **Root cause:** no hay calendario ni slots; el booking no verifica disponibilidad real.
- **Impacto negocio:** sin esto las reservas chocan/cancelan → mala experiencia, churn de ambos lados.
- **Esfuerzo:** L
- **Dependencias:** C1, C2, C4.

### H3 · Mensajería cliente ↔ cleaner
- **Root cause:** tabla `messages` existe en v1, sin producto en v2.
- **Impacto negocio:** coordinación (acceso, llaves, detalles) es esencial en limpieza doméstica; reduce no-shows y disputas.
- **Esfuerzo:** M
- **Dependencias:** C1, C2.

### H4 · Dashboards (cliente + cleaner)
- **Root cause:** no existen. Cliente: mis reservas/recurrencia. Cleaner: aanvragen/agenda/verdiensten/verificatie.
- **Impacto negocio:** sin dashboard cleaner no hay forma de operar la oferta; sin dashboard cliente no hay retención/recurrencia (LTV).
- **Esfuerzo:** L
- **Dependencias:** C1, C2, C3, C4.

### H5 · Resolver disonancia funnel (modo pre-launch waitlist-first)
- **Root cause:** la UI finge operatividad mientras no hay oferta real; el waitlist está enterrado en el footer.
- **Impacto negocio:** mientras no haya supply, el objetivo de conversión debe ser **capturar email**; alinear hero/CTA evita prometer lo que no se entrega (pérdida de confianza).
- **Esfuerzo:** S
- **Dependencias:** ninguna (decisión de negocio: pre-launch vs operativo).

### H6 · Elegir wedge: Airbnb-host turnover cleaning
- **Root cause:** producto horizontal ("hogares") en un mercado donde el informal es más barato; sin foco.
- **Impacto negocio:** demanda recurrente, premium, menos sensible a precio y menos competida por el mercado informal → mejor unit economics y arranque más fácil.
- **Esfuerzo:** M (estrategia + ajustes de producto)
- **Dependencias:** validación de mercado (H11).

### H7 · Fotos reales de cleaners
- **Root cause:** avatares de iniciales (placeholder).
- **Impacto negocio:** una *trust platform* sin caras es una contradicción; las fotos suben confianza y conversión (efecto Airbnb).
- **Esfuerzo:** S (técnico) — depende de tener cleaners reales (C5).
- **Dependencias:** C4 (suben foto en KYC), C5.

### H8 · Cancelación / no-show / sustitución por enfermedad
- **Root cause:** prometido en FAQ, sin implementar; sin política operativa.
- **Impacto negocio:** los no-shows matan la confianza en marketplaces de servicios; la sustitución es un diferencial prometido.
- **Esfuerzo:** M
- **Dependencias:** C1, C2, C3, H2.

### H9 · Emails transaccionales (Resend)
- **Root cause:** Resend no cableado; sin confirmación de booking, KYC, recordatorio de review.
- **Impacto negocio:** la confirmación por email es expectativa básica; los recordatorios de review alimentan C7.
- **Esfuerzo:** M
- **Dependencias:** C1, C3.

### H10 · Saldar deuda técnica de datos (schema drift, reviews, tests)
- **Root cause:** `0001_payments.sql` duplica columnas (`client_id` vs `client_user_id`, `cleaner_id`); reviews mal modeladas; sin Vitest/Playwright (exigidos por el brief).
- **Impacto negocio:** bugs de pago/estado = pérdida de dinero y confianza; sin tests, cada cambio es riesgo en un sistema que mueve dinero.
- **Esfuerzo:** M
- **Dependencias:** C1 (alinear esquema al cablear).

### H11 · Validar take-rate vs. mercado informal (pricing research)
- **Root cause:** 18%/15% asumido; el mercado informal ("witte werkster") es estructuralmente más barato. Helpling salió de NL.
- **Impacto negocio:** si el premium no se justifica, la conversión y la oferta se caen; define la viabilidad del modelo.
- **Esfuerzo:** S (research) → M (ajustes)
- **Dependencias:** C5 (hablar con cleaners reales).

### H12 · Analytics / instrumentación del funnel
- **Root cause:** sin métricas (Vercel Analytics/PostHog); no se mide nada.
- **Impacto negocio:** "no puedes mejorar lo que no medís"; necesario para PMF y para cualquier inversor.
- **Esfuerzo:** S
- **Dependencias:** ninguna.

---

## 🟡 MEDIUM

### M1 · Mapa en el marketplace (Mapbox) + toggle Map/List
- **Root cause:** deferred; marketplace local sin vista geográfica.
- **Impacto:** UX esperada en servicios locales por barrio; mejora discovery.
- **Esfuerzo:** L · **Deps:** C1, C5.

### M2 · Precio / `/prijzen` claro arriba del fold
- **Root cause:** coste real (€/u + 18%) solo en cards/perfil; `/prijzen` es stub.
- **Impacto:** reduce objeción de precio; conversión media.
- **Esfuerzo:** S · **Deps:** ninguna.

### M3 · Recurrencia ("vaste schoonmaker", wekelijks/2-wekelijks)
- **Root cause:** el modal lo captura como dato pero no hay lógica recurrente.
- **Impacto:** la recurrencia es el LTV del negocio (limpieza es recurrente por naturaleza).
- **Esfuerzo:** M · **Deps:** C1, C3, H2.

### M4 · Favorieten funcional
- **Root cause:** tabla existe (v1), sin producto.
- **Impacto:** facilita re-booking del mismo cleaner (retención).
- **Esfuerzo:** S · **Deps:** C1, C2.

### M5 · Estados loading / empty / error reales
- **Root cause:** todo SSG estático; sin skeletons ni manejo de error de datos.
- **Impacto:** percepción de calidad cuando se conecte data real.
- **Esfuerzo:** S · **Deps:** C1.

### M6 · Prueba social cuantificada y creíble
- **Root cause:** "1.200 wachtlijst" sin respaldo; reviews mock.
- **Impacto:** credibilidad/conversión; reemplazar claims por números verificables.
- **Esfuerzo:** S · **Deps:** C5, C7.

### M7 · Referidos bilaterales (cleaner + cliente)
- **Root cause:** sin loop de crecimiento.
- **Impacto:** baja CAC, alimenta liquidez de ambos lados.
- **Esfuerzo:** M · **Deps:** C2, C4.

### M8 · SEO de demanda (contenido "schoonmaak Amsterdam", blog)
- **Root cause:** solo SEO técnico (sitemap/robots/JSON-LD hecho); sin contenido que capte búsquedas.
- **Impacto:** canal de demanda orgánica de bajo CAC.
- **Esfuerzo:** M (continuo) · **Deps:** ninguna.

### M9 · Partnerships (Airbnb hosts, makelaars, property managers)
- **Root cause:** sin canal B2B2C.
- **Impacto:** demanda recurrente y concentrada; acelera liquidez (liga con H6).
- **Esfuerzo:** M · **Deps:** C5.

### M10 · Observabilidad + hardening (Sentry, Analytics, CSP enforced, rate-limit)
- **Root cause:** CSP en report-only; sin Sentry; Server Actions sin rate-limit (pre-auth).
- **Impacto:** estabilidad/seguridad antes de prod; evita abuso/coste.
- **Esfuerzo:** S · **Deps:** ninguna.

### M11 · Identidad de marca + calidez (logo, caras)
- **Root cause:** estrella de 4 puntas genérica; falta calidez humana.
- **Impacto:** memorabilidad/diferenciación de marca.
- **Esfuerzo:** M · **Deps:** H7.

### M12 · Automatizar KYC con Stripe Identity
- **Root cause:** KYC manual no escala.
- **Impacto:** reduce coste de ops por cleaner al escalar; mejora time-to-active.
- **Esfuerzo:** M · **Deps:** C4.

---

## ⚪ LOW

### L1 · Selector de idioma nl/en (UI traducida)
- **Root cause:** `en` es solo fallback; sin switch. · **Impacto:** bajo (NL-first). · **Esfuerzo:** M · **Deps:** ninguna.

### L2 · Dark/light toggle
- **Root cause:** placeholder de dark-mode existió, no activo. · **Impacto:** bajo. · **Esfuerzo:** S · **Deps:** ninguna.

### L3 · Microinteracciones + swipe-to-close del modal
- **Root cause:** interacciones básicas. · **Impacto:** pulido percibido. · **Esfuerzo:** S · **Deps:** ninguna.

### L4 · Suavizar salto light→dark del perfil
- **Root cause:** perfil 100% oscuro entre flujo claro. · **Impacto:** cohesión menor. · **Esfuerzo:** S · **Deps:** ninguna.

### L5 · Quitar placeholders KvK/BTW visibles
- **Root cause:** `····` hasta tener datos. · **Impacto:** señal "beta". · **Esfuerzo:** S · **Deps:** activación KvK (negocio).

### L6 · PWA / experiencia app móvil (bottom-tab logueado)
- **Root cause:** web responsive sin app-shell logueado. · **Impacto:** bajo hasta tener usuarios. · **Esfuerzo:** M · **Deps:** C2, H4.

### L7 · Retirar el codebase v1 (consolidar a v2)
- **Root cause:** dos fuentes de verdad (HTML v1 + Next v2). · **Impacto:** mantenibilidad. · **Esfuerzo:** S · **Deps:** v2 en producción (Fase 6).

---

## Orden de ejecución recomendado (ruta crítica)
```
C6 + H5 (sin daño, hoy) → C1 → C2 → C4 → C5(ops, en paralelo desde ya)
  → C3 → C7 → H9 → H2 → H4 → H10 → H1/M2 (CRO) → H6/H11 (estrategia)
  → resto Medium → Low
```
**Regla de oro:** ningún ítem Medium/Low antes de C1–C5. **C5 (cleaners reales) puede y debe arrancar HOY, manual, en paralelo al código.**
