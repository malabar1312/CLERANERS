// Env vars exposed by Next.js. Declared here so any access through
// `process.env.*` is typed. **Note:** values are intentionally typed as
// `string | undefined` (matching the runtime truth — env vars can be missing
// in dev, CI, etc.). Always validate at module boundaries via `lib/env.ts`
// instead of assuming a string is present.

declare namespace NodeJS {
  interface ProcessEnv {
    // Public — exposed to the browser bundle.
    readonly NEXT_PUBLIC_SUPABASE_URL?: string;
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    readonly NEXT_PUBLIC_SITE_URL?: string;
    readonly NEXT_PUBLIC_MAPBOX_TOKEN?: string;

    // Server-only — never imported from a Client Component.
    readonly SUPABASE_SERVICE_ROLE_KEY?: string;
    readonly STRIPE_SECRET_KEY?: string;
    readonly STRIPE_WEBHOOK_SECRET?: string;
    readonly RESEND_API_KEY?: string;

    readonly NODE_ENV?: "development" | "production" | "test";
  }
}

export {};
