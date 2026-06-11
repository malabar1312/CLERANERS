#!/usr/bin/env node
/**
 * qa-dashboard-seed.mjs — datos de prueba para QA del dashboard cliente.
 *
 * Uso:
 *   node scripts/qa-dashboard-seed.mjs           # crea usuario QA + 3 bookings
 *   node scripts/qa-dashboard-seed.mjs --cleanup # borra bookings TEST-QA-* y el usuario
 *
 * Crea (idempotente):
 *   - Usuario  qa.claude@getcleaners.nl  (password abajo, email confirmado)
 *   - TEST-QA-001  hoy+7  paid       → cancelable (>24h)
 *   - TEST-QA-002  hoy    paid       → NO cancelable (<24h)
 *   - TEST-QA-003  hoy-7  completed  → histórica
 *
 * Solo toca filas TEST-QA-* y el usuario QA. No imprime la service key.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QA_EMAIL = "qa.claude@getcleaners.nl";
const QA_PASSWORD = "QaCleaners-2026-Test!";

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
        user_metadata: { full_name: "QA Claude" },
      }),
    });
    if (!r.ok) throw new Error(`admin create user → ${r.status}: ${await r.text()}`);
    user = await r.json();
    console.log(`✓ Usuario QA creado: ${QA_EMAIL}`);
  } else {
    console.log(`✓ Usuario QA ya existía: ${QA_EMAIL}`);
  }

  const base = {
    client_user_id: user.id,
    client_email: QA_EMAIL,
    client_name: "QA Claude",
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
    { ...base, reference: "TEST-QA-001", cleaner_id: "sofia-r", scheduled_date: iso(7), scheduled_time: "morning", frequency: "once", status: "paid" },
    { ...base, reference: "TEST-QA-002", cleaner_id: "carmen-p", scheduled_date: iso(0), scheduled_time: "evening", frequency: "once", status: "paid" },
    { ...base, reference: "TEST-QA-003", cleaner_id: "sofia-r", scheduled_date: iso(-7), scheduled_time: "afternoon", frequency: "once", status: "completed" },
  ];
  const r = await fetch(`${URL_}/rest/v1/bookings?on_conflict=reference`, {
    method: "POST",
    headers: { ...restHdrs, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`bookings upsert → ${r.status}: ${await r.text()}`);
  const inserted = await r.json();
  console.log(`✓ ${inserted.length} bookings TEST-QA upsert OK`);
  console.log(`\nLogin QA → email: ${QA_EMAIL} · password: ${QA_PASSWORD}`);
}

async function cleanup() {
  const r = await fetch(`${URL_}/rest/v1/bookings?reference=like.TEST-QA-*`, {
    method: "DELETE",
    headers: { ...restHdrs, Prefer: "return=representation" },
  });
  if (!r.ok) throw new Error(`bookings delete → ${r.status}: ${await r.text()}`);
  console.log(`✓ ${(await r.json()).length} bookings TEST-QA borradas`);

  const user = await findUser();
  if (user) {
    const d = await fetch(`${URL_}/auth/v1/admin/users/${user.id}`, { method: "DELETE", headers: authHdrs });
    if (!d.ok) throw new Error(`admin delete user → ${d.status}: ${await d.text()}`);
    console.log(`✓ Usuario QA borrado`);
  } else {
    console.log("· Usuario QA no existía");
  }
}

try {
  await (process.argv.includes("--cleanup") ? cleanup() : seed());
} catch (e) {
  console.error("✗ " + e.message);
  process.exit(1);
}
