import { z } from "zod";

/**
 * Validated environment variables.
 *
 * Single source of truth for `process.env.*` access. Import `env` instead
 * of touching `process.env` directly, so missing or malformed values fail
 * at module load (build time, ideally) instead of at runtime against a real user.
 *
 * Public vars (`NEXT_PUBLIC_*`) are required for the app to render the landing
 * meaningfully but the schema marks them optional so static prebuilds in CI
 * with placeholder values still pass. Use `assertPublicEnv()` at the boundary
 * where a real Supabase / Mapbox URL is required (e.g. inside Supabase clients).
 *
 * Server-only vars are always optional at type level — they only exist on
 * server runtimes and never in the browser bundle.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_RESTRICTED_KEY: z.string().startsWith("rk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  EMAIL_FROM: z.string().min(3).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
});

const fullSchema = publicSchema.merge(serverSchema);

type FullEnv = z.infer<typeof fullSchema>;

/** Trim + treat empty/whitespace-only as undefined (defensive against deploy envs). */
function clean(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t && t.length > 0 ? t : undefined;
}

function parse(): FullEnv {
  const parsed = fullSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    NEXT_PUBLIC_SITE_URL: clean(process.env.NEXT_PUBLIC_SITE_URL),
    NEXT_PUBLIC_MAPBOX_TOKEN: clean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: clean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    SUPABASE_SERVICE_ROLE_KEY: clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    STRIPE_SECRET_KEY: clean(process.env.STRIPE_SECRET_KEY),
    STRIPE_RESTRICTED_KEY: clean(process.env.STRIPE_RESTRICTED_KEY),
    STRIPE_WEBHOOK_SECRET: clean(process.env.STRIPE_WEBHOOK_SECRET),
    RESEND_API_KEY: clean(process.env.RESEND_API_KEY),
    EMAIL_FROM: clean(process.env.EMAIL_FROM),
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    // Aggregate error message; do NOT include values in the log (may be secret).
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

export const env = parse();

/**
 * Asserts the Supabase public vars are present. Throws a developer-friendly
 * error pointing at `apps/web/.env.local` if not. Use inside Supabase clients
 * and any code path that *requires* a real backend.
 */
export function assertPublicSupabaseEnv(): {
  url: string;
  anonKey: string;
} {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase env vars missing. Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}
