#!/usr/bin/env node
/**
 * verify-supabase.mjs — chequeo go/no-go de la infraestructura Supabase.
 *
 * Uso:  node scripts/verify-supabase.mjs
 *
 * Verifica, leyendo apps/web/.env.local:
 *   1. Auth API viva (health).
 *   2. Tablas del schema presentes (vía PostgREST con la anon key).
 *   3. SUPABASE_SERVICE_ROLE_KEY válida (los writes del webhook dependen de ella).
 *
 * Exit 0 = todo verde. Exit 1 = hay gaps (los imprime).
 * No imprime ningún secreto.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, "apps/web/.env.local");

function parseEnv(path) {
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = parseEnv(envPath);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secret = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.error("✗ Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

const TABLES = [
  "profiles",
  "cleaner_profiles",
  "waitlist",
  "bookings",
  "webhook_events",
  "contact_messages",
  "favorites",
];

let failures = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const bad = (msg) => { failures++; console.log(`  ✗ ${msg}`); };

console.log(`\nSupabase: ${url}\n`);

// 1. Auth health
try {
  const r = await fetch(`${url}/auth/v1/health`, { headers: { apikey: anon } });
  r.ok ? ok(`Auth API viva (${r.status})`) : bad(`Auth health → ${r.status}`);
} catch (e) {
  bad(`Auth health inalcanzable: ${e.message}`);
}

// 2. Tablas (anon: 200 = existe aunque RLS oculte filas; PGRST205 = no existe)
console.log("\nTablas:");
for (const t of TABLES) {
  try {
    const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=0`, { headers: { apikey: anon } });
    if (r.ok) { ok(t); continue; }
    const body = await r.text();
    if (body.includes("PGRST205") || body.includes("does not exist") || body.includes("Could not find")) {
      bad(`${t} — NO EXISTE (re-ejecutar supabase/schema.sql en el SQL Editor)`);
    } else {
      bad(`${t} — respuesta inesperada ${r.status}`);
    }
  } catch (e) {
    bad(`${t} — error de red: ${e.message}`);
  }
}

// 3. Service key (la usan webhook + getCleaners; inválida = persistencia rota en silencio)
console.log("\nService key:");
if (!secret) {
  bad("SUPABASE_SERVICE_ROLE_KEY ausente en .env.local");
} else {
  try {
    const r = await fetch(`${url}/rest/v1/webhook_events?select=id&limit=1`, {
      headers: { apikey: secret },
    });
    if (r.ok) ok("SUPABASE_SERVICE_ROLE_KEY válida (lectura service-role OK)");
    else if (r.status === 401 || r.status === 403) {
      bad(`SUPABASE_SERVICE_ROLE_KEY inválida/rotada (${r.status}) — copiar la 'secret key' vigente del Dashboard → Settings → API. Revisar TAMBIÉN la misma var en Vercel (production).`);
    } else bad(`service key → respuesta inesperada ${r.status}`);
  } catch (e) {
    bad(`service key — error de red: ${e.message}`);
  }
}

console.log(failures === 0 ? "\n✅ Infraestructura Supabase: TODO VERDE\n" : `\n❌ ${failures} problema(s). Ver arriba.\n`);
process.exit(failures === 0 ? 0 : 1);
