#!/usr/bin/env node
/**
 * qa-aanvragen-seed.mjs — datos de prueba para QA de aanvragen del cleaner.
 *
 * Uso:
 *   node scripts/qa-aanvragen-seed.mjs           # usuario cleaner + perfil draft + 3 bookings
 *   node scripts/qa-aanvragen-seed.mjs --status  # estado actual de las bookings TEST-AV-*
 *   node scripts/qa-aanvragen-seed.mjs --cleanup # borra todo lo sembrado
 *
 * Siembra:
 *   - Usuario  qa.cleaner@getcleaners.nl (role=cleaner via trigger)
 *   - cleaner_profiles slug "qa-test-cleaner" con visible=false (NO toca el catálogo)
 *   - TEST-AV-001  hoy+7  paid      → para ACEPTAR
 *   - TEST-AV-002  hoy+9  paid      → para RECHAZAR
 *   - TEST-AV-003  hoy-7  completed → histórica
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QA_EMAIL = "qa.cleaner@getcleaners.nl";
const QA_PASSWORD = "QaCleaner-2026-Test!";
const QA_SLUG = "qa-test-cleaner";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = readFileSync(resolve(root, "apps/web/.env.local"), "utf8");
const env = Object.fromEntries(
  envFile.split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean)
    .map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, "")]),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !SECRET) { console.error("Faltan env vars"); process.exit(1); }

const authHdrs = { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" };
const restHdrs = { apikey: SECRET, "Content-Type": "application/json" };

const iso = (offsetDays) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

async function findUser() {
  const r = await fetch(`${URL_}/auth/v1/admin/users?page=1&per_page=100`, { headers: authHdrs });
  if (!r.ok) throw new Error(`admin list users → ${r.status}: ${await r.text()}`);
  const body = await r.json();
  return (body.users ?? body).find?.((u) => u.email === QA_EMAIL) ?? null;
}

async function seed() {
  let user = await findUser();
  if (!user) {
    const r = await fetch(`${URL_}/auth/v1/admin/users`, {
      method: "POST",
      headers: authHdrs,
      body: JSON.stringify({
        email: QA_EMAIL,
        password: QA_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "QA Cleaner", role: "cleaner" },
      }),
    });
    if (!r.ok) throw new Error(`admin create user → ${r.status}: ${await r.text()}`);
    user = await r.json();
    console.log(`✓ Usuario QA cleaner creado`);
  } else {
    console.log(`✓ Usuario QA cleaner ya existía`);
  }

  // Perfil draft (visible=false — el catálogo público NO cambia).
  const cp = await fetch(`${URL_}/rest/v1/cleaner_profiles?on_conflict=profile_id`, {
    method: "POST",
    headers: { ...restHdrs, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{
      profile_id: user.id,
      slug: QA_SLUG,
      name: "QA Test Cleaner",
      hood: "De Pijp",
      price_per_hour: 24,
      bio: "Perfil QA para e2e de aanvragen. No visible en catálogo.",
      languages: ["Nederlands"],
      specialties: ["Wekelijks"],
      visible: false,
      online: true,
      accepts_bookings: true,
    }]),
  });
  if (!cp.ok) throw new Error(`cleaner_profiles upsert → ${cp.status}: ${await cp.text()}`);
  console.log(`✓ cleaner_profiles "${QA_SLUG}" (visible=false)`);

  const base = {
    cleaner_id: QA_SLUG,
    client_email: "qa.client@getcleaners.nl",
    client_name: "QA Klant",
    m2: 60,
    hours: 3,
    subtotal_cents: 7200,
    fee_cents: 1296,
    total_cents: 8496,
    currency: "eur",
    street: "Teststraat 1",
    postcode: "1012 AB",
    city: "Amsterdam",
  };
  const rows = [
    { ...base, reference: "TEST-AV-001", scheduled_date: iso(7), scheduled_time: "morning", frequency: "once", status: "paid" },
    { ...base, reference: "TEST-AV-002", scheduled_date: iso(9), scheduled_time: "afternoon", frequency: "once", status: "paid" },
    { ...base, reference: "TEST-AV-003", scheduled_date: iso(-7), scheduled_time: "evening", frequency: "once", status: "completed" },
  ];
  const r = await fetch(`${URL_}/rest/v1/bookings?on_conflict=reference`, {
    method: "POST",
    headers: { ...restHdrs, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`bookings upsert → ${r.status}: ${await r.text()}`);
  console.log(`✓ ${(await r.json()).length} bookings TEST-AV upsert OK`);
  console.log(`\nLogin QA → email: ${QA_EMAIL} · password: ${QA_PASSWORD}`);
}

async function status() {
  const r = await fetch(`${URL_}/rest/v1/bookings?reference=like.TEST-AV-*&select=reference,status&order=reference`, { headers: restHdrs });
  console.log(JSON.stringify(await r.json()));
}

async function cleanup() {
  const db = await fetch(`${URL_}/rest/v1/bookings?reference=like.TEST-AV-*`, {
    method: "DELETE",
    headers: { ...restHdrs, Prefer: "return=representation" },
  });
  console.log(`✓ ${(await db.json()).length} bookings TEST-AV borradas`);
  const user = await findUser();
  if (user) {
    await fetch(`${URL_}/rest/v1/cleaner_profiles?profile_id=eq.${user.id}`, { method: "DELETE", headers: restHdrs });
    const d = await fetch(`${URL_}/auth/v1/admin/users/${user.id}`, { method: "DELETE", headers: authHdrs });
    if (!d.ok) throw new Error(`admin delete user → ${d.status}`);
    console.log("✓ Perfil + usuario QA cleaner borrados");
  } else {
    console.log("· Usuario QA no existía");
  }
}

try {
  if (process.argv.includes("--cleanup")) await cleanup();
  else if (process.argv.includes("--status")) await status();
  else await seed();
} catch (e) {
  console.error("✗ " + e.message);
  process.exit(1);
}
