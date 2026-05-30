import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// next-intl handles locale negotiation. Supabase session refresh (auth gate)
// will be composed into this middleware in Fase 4 (cleaner journey) once we
// have @supabase/ssr wired against real env vars.
export default createMiddleware(routing);

export const config = {
  // Match all paths except API routes, static assets, and Next internals.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
