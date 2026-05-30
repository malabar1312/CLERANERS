import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for **Client Components**.
 * Reads the session from the browser's cookie jar (set by middleware).
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — set them in apps/web/.env.local",
    );
  }

  return createBrowserClient(url, anonKey);
}
