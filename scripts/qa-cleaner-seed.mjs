#!/usr/bin/env node
/**
 * qa-cleaner-seed.mjs — usuario QA con rol cleaner para probar onboarding.
 *
 * Uso:
 *   node scripts/qa-cleaner-seed.mjs           # crea usuario QA cleaner (sin cleaner_profiles)
 *   node scripts/qa-cleaner-seed.mjs --status  # muestra profiles + cleaner_profiles del QA
 *   node scripts/qa-cleaner-seed.mjs --cleanup # borra cleaner_profiles del QA + usuario
 *
 * El trigger handle_new_user crea la fila en `profiles` con role=cleaner
 * (lee raw_user_meta_data->>'role'). El wizard /onboarding/schoonmaker debe
 * crear la fila cleaner_profiles con visible=false (verificar con --status).
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QA_EMAIL = "qa.cleaner@getcleaners.nl";
const QA_PASSWORD = "QaCleaner-2026-Test!";

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
    console.log(`✓ Usuario QA cleaner creado: ${QA_EMAIL}`);
  } else {
    console.log(`✓ Usuario QA cleaner ya existía: ${QA_EMAIL}`);
  }
  await status();
  console.log(`\nLogin QA → email: ${QA_EMAIL} · password: ${QA_PASSWORD}`);
}

async function status() {
  const user = await findUser();
  if (!user) { console.log("· Usuario QA no existe"); return; }
  const p = await fetch(`${URL_}/rest/v1/profiles?id=eq.${user.id}&select=role,first_name`, { headers: restHdrs });
  const profiles = await p.json();
  console.log("profiles:", JSON.stringify(profiles));
  const c = await fetch(`${URL_}/rest/v1/cleaner_profiles?profile_id=eq.${user.id}&select=slug,name,hood,price_per_hour,visible,online`, { headers: restHdrs });
  const cps = await c.json();
  console.log("cleaner_profiles:", JSON.stringify(cps));
}

async function cleanup() {
  const user = await findUser();
  if (!user) { console.log("· Usuario QA no existía"); return; }
  const dc = await fetch(`${URL_}/rest/v1/cleaner_profiles?profile_id=eq.${user.id}`, {
    method: "DELETE",
    headers: { ...restHdrs, Prefer: "return=representation" },
  });
  if (!dc.ok) throw new Error(`cleaner_profiles delete → ${dc.status}: ${await dc.text()}`);
  console.log(`✓ ${(await dc.json()).length} cleaner_profiles borradas`);
  const d = await fetch(`${URL_}/auth/v1/admin/users/${user.id}`, { method: "DELETE", headers: authHdrs });
  if (!d.ok) throw new Error(`admin delete user → ${d.status}: ${await d.text()}`);
  console.log("✓ Usuario QA cleaner borrado (profiles cae por cascade)");
}

try {
  if (process.argv.includes("--cleanup")) await cleanup();
  else if (process.argv.includes("--status")) await status();
  else await seed();
} catch (e) {
  console.error("✗ " + e.message);
  process.exit(1);
}
