#!/usr/bin/env node
/**
 * qa-empty-dash-seed.mjs — usuarios NUEVOS sin datos, para QA del "dashboard a 0".
 *
 * Uso:
 *   node scripts/qa-empty-dash-seed.mjs           # crea customer + cleaner vacíos
 *   node scripts/qa-empty-dash-seed.mjs --cleanup # borra ambos usuarios + su cleaner_profile
 *
 * Verifica que un usuario recién registrado ve su dashboard a 0 (sin mock):
 *   - qa.empty.customer@getcleaners.nl → role customer, 0 bookings
 *   - qa.empty.cleaner@getcleaners.nl  → role cleaner, cleaner_profile visible=FALSE,
 *     rating 0 / reviews 0, 0 aanvragen
 *
 * ⚠️ visible=false SIEMPRE: 1 fila visible cambiaría el catálogo público de mock a real.
 * No imprime la service key.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CUSTOMER = { email: "qa.empty.customer@getcleaners.nl", password: "QaEmpty-2026-Cust!", name: "QA Leeg Klant", role: "customer" };
const CLEANER = { email: "qa.empty.cleaner@getcleaners.nl", password: "QaEmpty-2026-Clean!", name: "QA Leeg Schoonmaker", role: "cleaner", slug: "qa-empty-cleaner" };

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

async function findUser(email) {
  const r = await fetch(`${URL_}/auth/v1/admin/users?page=1&per_page=200`, { headers: authHdrs });
  if (!r.ok) throw new Error(`list users → ${r.status}`);
  const body = await r.json();
  return (body.users ?? body).find?.((u) => u.email === email) ?? null;
}

async function ensureUser(spec) {
  let user = await findUser(spec.email);
  if (!user) {
    const r = await fetch(`${URL_}/auth/v1/admin/users`, {
      method: "POST", headers: authHdrs,
      body: JSON.stringify({ email: spec.email, password: spec.password, email_confirm: true, user_metadata: { full_name: spec.name } }),
    });
    if (!r.ok) throw new Error(`create user ${spec.email} → ${r.status}: ${await r.text()}`);
    user = await r.json();
    console.log(`✓ Usuario creado: ${spec.email}`);
  } else {
    console.log(`✓ Usuario ya existía: ${spec.email}`);
  }
  // profiles (role + first_name) — upsert idempotente.
  const p = await fetch(`${URL_}/rest/v1/profiles?on_conflict=id`, {
    method: "POST",
    headers: { ...restHdrs, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ id: user.id, role: spec.role, first_name: spec.name.split(" ")[0] }),
  });
  if (!p.ok) throw new Error(`profiles upsert ${spec.email} → ${p.status}: ${await p.text()}`);
  return user;
}

async function seed() {
  await ensureUser(CUSTOMER);
  const cleanerUser = await ensureUser(CLEANER);

  // cleaner_profile vacío, VISIBLE=FALSE (no toca el catálogo público), rating/reviews 0.
  const cp = await fetch(`${URL_}/rest/v1/cleaner_profiles?on_conflict=profile_id`, {
    method: "POST",
    headers: { ...restHdrs, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      profile_id: cleanerUser.id, slug: CLEANER.slug, name: CLEANER.name,
      hood: "De Pijp", price_per_hour: 24, visible: false, rating: 0, reviews_count: 0,
    }),
  });
  if (!cp.ok) throw new Error(`cleaner_profiles upsert → ${cp.status}: ${await cp.text()}`);
  console.log("✓ cleaner_profile vacío (visible=false) OK");

  console.log(`\nLogin customer → ${CUSTOMER.email} · ${CUSTOMER.password}`);
  console.log(`Login cleaner  → ${CLEANER.email} · ${CLEANER.password}`);
}

async function cleanup() {
  for (const email of [CUSTOMER.email, CLEANER.email]) {
    const user = await findUser(email);
    if (!user) { console.log(`· ${email} no existía`); continue; }
    // cleaner_profile (si lo tiene) primero por la FK.
    await fetch(`${URL_}/rest/v1/cleaner_profiles?profile_id=eq.${user.id}`, { method: "DELETE", headers: restHdrs });
    const d = await fetch(`${URL_}/auth/v1/admin/users/${user.id}`, { method: "DELETE", headers: authHdrs });
    if (!d.ok) throw new Error(`delete user ${email} → ${d.status}`);
    console.log(`✓ ${email} borrado`);
  }
}

try {
  await (process.argv.includes("--cleanup") ? cleanup() : seed());
} catch (e) {
  console.error("✗ " + e.message);
  process.exit(1);
}
