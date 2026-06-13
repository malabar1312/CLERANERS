#!/usr/bin/env node
/**
 * qa-e2e-smoke.mjs — smoke e2e de caja negra del loop completo en producción.
 *
 * Uso:  node scripts/qa-e2e-smoke.mjs            (default: https://getcleaners.nl)
 *       node scripts/qa-e2e-smoke.mjs http://localhost:3000
 *
 * NO toca código de la app ni la base de datos: hace requests HTTP y verifica
 * que el flujo búsqueda → perfil → checkout-gate → webhook → auth-gate vive y
 * que el SEO (sitemap, robots, metadata por barrio) se sirve correcto.
 *
 * Exit 0 = todo verde. Exit 1 = hay fallos (se imprimen).
 */

const BASE = (process.argv[2] ?? "https://getcleaners.nl").replace(/\/$/, "");
const UA = "cleaners-e2e-smoke";

let failures = 0;
let passes = 0;
const ok = (msg) => { passes++; console.log(`  \x1b[32m✓\x1b[0m ${msg}`); };
const bad = (msg) => { failures++; console.log(`  \x1b[31m✗\x1b[0m ${msg}`); };

/** GET con UA propio. redirect controlable. Devuelve {status, body, url, redirected, ct}. */
async function get(path, { redirect = "follow" } = {}) {
  const r = await fetch(`${BASE}${path}`, { headers: { "user-agent": UA }, redirect });
  const ct = r.headers.get("content-type") ?? "";
  const body = ct.startsWith("image/") ? "" : await r.text();
  return { status: r.status, body, url: r.url, redirected: r.redirected, ct, headers: r.headers };
}

/** Corre un check async aislado: una excepción cuenta como fallo, no aborta la suite. */
async function check(name, fn) {
  try {
    await fn();
  } catch (e) {
    bad(`${name} — excepción: ${e.message}`);
  }
}

console.log(`\nSmoke e2e contra: ${BASE}\n`);

// ─── A. Rutas públicas (200 + contenido esperado) ────────────────────────────
console.log("A. Rutas públicas");

await check("landing", async () => {
  const r = await get("/");
  if (r.status !== 200) return bad(`/ → ${r.status}`);
  ok(`/ → 200`);
  // El wordmark NUNCA debe ser traducible (regla de marca dura).
  if (r.body.includes('translate="no"')) ok(`wordmark translate="no" presente`);
  else bad(`wordmark sin translate="no" (regla de marca)`);
});

await check("listado schoonmakers", async () => {
  const r = await get("/schoonmakers");
  if (r.status !== 200) return bad(`/schoonmakers → ${r.status}`);
  ok(`/schoonmakers → 200`);
  // El catálogo (mock o real) debe renderizar enlaces a perfiles.
  if (/\/schoonmakers\/[a-z0-9-]+/i.test(r.body)) ok(`listado enlaza a perfiles de cleaners`);
  else bad(`listado sin enlaces a perfiles`);
});

await check("locale EN", async () => {
  const r = await get("/en/schoonmakers");
  r.status === 200 ? ok(`/en/schoonmakers → 200`) : bad(`/en/schoonmakers → ${r.status}`);
});

await check("perfil de cleaner", async () => {
  const r = await get("/schoonmakers/sofia-r");
  if (r.status !== 200) return bad(`/schoonmakers/sofia-r → ${r.status}`);
  ok(`/schoonmakers/sofia-r → 200`);
  // El CTA de booking debe existir en el perfil (el loop arranca acá).
  if (/boek/i.test(r.body)) ok(`perfil expone CTA de booking`);
  else bad(`perfil sin CTA de booking`);
});

await check("páginas de soporte", async () => {
  for (const p of ["/prijzen", "/voor-verhuurders", "/contact"]) {
    const r = await get(p);
    r.status === 200 ? ok(`${p} → 200`) : bad(`${p} → ${r.status}`);
  }
});

// ─── B. SEO (sitemap, robots, metadata por barrio, OG) ───────────────────────
console.log("\nB. SEO");

await check("sitemap.xml", async () => {
  const r = await get("/sitemap.xml");
  if (r.status !== 200) return bad(`/sitemap.xml → ${r.status}`);
  const urls = (r.body.match(/<url>/g) ?? []).length;
  urls >= 20 ? ok(`/sitemap.xml → 200, ${urls} URLs`) : bad(`/sitemap.xml solo ${urls} URLs`);
  r.body.includes("hood=") ? ok(`sitemap incluye landing por barrio`) : bad(`sitemap sin URLs de barrio`);
});

await check("robots.txt", async () => {
  const r = await get("/robots.txt");
  if (r.status !== 200) return bad(`/robots.txt → ${r.status}`);
  ok(`/robots.txt → 200`);
  r.body.includes("Disallow: /dashboard") ? ok(`robots bloquea /dashboard`) : bad(`robots NO bloquea /dashboard`);
  r.body.includes("Sitemap:") ? ok(`robots referencia el sitemap`) : bad(`robots sin referencia a sitemap`);
});

await check("metadata por barrio", async () => {
  const r = await get("/schoonmakers?hood=De+Pijp");
  if (r.status !== 200) return bad(`?hood=De+Pijp → ${r.status}`);
  ok(`/schoonmakers?hood=De+Pijp → 200`);
  /<title>Schoonmakers in De Pijp/i.test(r.body)
    ? ok(`title por barrio correcto`)
    : bad(`title por barrio ausente`);
  /<link rel="canonical"[^>]*hood=De/i.test(r.body)
    ? ok(`canonical por barrio presente`)
    : bad(`canonical por barrio ausente`);
  /hreflang="en"/i.test(r.body) ? ok(`hreflang alternates presentes`) : bad(`hreflang ausentes`);
});

await check("hood inválido no rompe", async () => {
  const r = await get("/schoonmakers?hood=BarrioQueNoExisteXYZ");
  if (r.status !== 200) return bad(`hood inválido → ${r.status} (debería ser 200)`);
  ok(`hood inválido → 200 (degrada al listado, no rompe)`);
  // No debe inventar un título de barrio inexistente.
  /<title>Schoonmakers in BarrioQueNoExiste/i.test(r.body)
    ? bad(`title inventado para barrio inexistente`)
    : ok(`title genérico para hood inválido`);
});

await check("OG images", async () => {
  const root = await get("/opengraph-image");
  root.status === 200 && root.ct.startsWith("image/")
    ? ok(`/opengraph-image → 200 (${root.ct})`)
    : bad(`/opengraph-image → ${root.status} ${root.ct}`);
  const cleaner = await get("/schoonmakers/sofia-r/opengraph-image");
  cleaner.status === 200 && cleaner.ct.startsWith("image/")
    ? ok(`OG por cleaner → 200 (${cleaner.ct})`)
    : bad(`OG por cleaner → ${cleaner.status} ${cleaner.ct}`);
});

// ─── C. Gates de auth (no se sirve contenido privado sin sesión) ─────────────
console.log("\nC. Gates de auth");

await check("dashboard gateado", async () => {
  const r = await get("/dashboard"); // follow: la URL final debe acabar en login
  if (/login/i.test(r.url)) ok(`/dashboard sin sesión → redirige a login (${r.url.replace(BASE, "")})`);
  else bad(`/dashboard sin sesión NO redirige a login (URL final: ${r.url})`);
});

await check("onboarding gateado", async () => {
  const r = await get("/onboarding/schoonmaker");
  if (/login/i.test(r.url)) ok(`/onboarding/schoonmaker sin sesión → login`);
  else bad(`/onboarding/schoonmaker sin sesión NO redirige a login (URL final: ${r.url})`);
});

// ─── D. Webhook Stripe (fail-closed) ─────────────────────────────────────────
console.log("\nD. Webhook Stripe");

await check("webhook rechaza sin firma", async () => {
  const r = await fetch(`${BASE}/api/webhook/stripe`, {
    method: "POST",
    headers: { "user-agent": UA, "content-type": "application/json" },
    body: JSON.stringify({ id: "evt_smoke", type: "checkout.session.completed" }),
  });
  // 400 = firma faltante (configurado y fail-closed). 503 sería "no configurado".
  if (r.status === 400) ok(`POST sin firma → 400 (fail-closed, webhook configurado)`);
  else if (r.status === 503) bad(`POST sin firma → 503 (STRIPE_WEBHOOK_SECRET no configurado en prod)`);
  else bad(`POST sin firma → ${r.status} (esperado 400)`);
});

// ─── E. Negativos ────────────────────────────────────────────────────────────
console.log("\nE. Negativos");

await check("404 en ruta inexistente", async () => {
  const r = await get("/ruta-que-no-existe-zzz");
  r.status === 404 ? ok(`ruta inexistente → 404`) : bad(`ruta inexistente → ${r.status} (esperado 404)`);
});

// ─── Resumen ─────────────────────────────────────────────────────────────────
console.log(
  failures === 0
    ? `\n\x1b[32m✅ Loop e2e: TODO VERDE\x1b[0m (${passes} checks)\n`
    : `\n\x1b[31m❌ ${failures} fallo(s)\x1b[0m de ${passes + failures} checks. Ver arriba.\n`,
);
process.exit(failures === 0 ? 0 : 1);
