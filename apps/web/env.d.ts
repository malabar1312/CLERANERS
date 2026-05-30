// Type the env vars cleaners depends on. Centralized here so any missing
// or typo'd var fails at build time, not at runtime against a real user.

declare namespace NodeJS {
  interface ProcessEnv {
    // Public — exposed to the browser bundle.
    readonly NEXT_PUBLIC_SUPABASE_URL: string;
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    readonly NEXT_PUBLIC_SITE_URL: string;
    readonly NEXT_PUBLIC_MAPBOX_TOKEN?: string;

    // Server-only — never imported from a Client Component.
    readonly SUPABASE_SERVICE_ROLE_KEY?: string;
    readonly STRIPE_SECRET_KEY?: string;
    readonly STRIPE_WEBHOOK_SECRET?: string;
    readonly RESEND_API_KEY?: string;
  }
}

export {};
