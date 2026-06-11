import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Search, Bell, HelpCircle } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPathname } from "@/i18n/navigation";
import { DashboardSidebar } from "@/components/domain/dashboard/sidebar";

/**
 * Dashboard layout — server component with auth gate.
 * Sidebar (responsive) + top bar + main content area.
 * Uses our standard Supabase server client (no dummy fallback).
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("dashboard.topbar");
  const locale = await getLocale();

  let profile = {
    role: "customer" as string,
    first_name: "Gebruiker",
  };

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect(getPathname({ href: "/login", locale }));
    }

    // `.maybeSingle()` no lanza si la fila no existe — degrada al default.
    // Consistente con `dashboard/page.tsx` y robusto al lag del trigger
    // `on_auth_user_created` (race entre signUp returns y profile insert).
    const { data } = await supabase
      .from("profiles")
      .select("role, first_name")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      profile = {
        role: data.role ?? "customer",
        first_name: data.first_name ?? "Gebruiker",
      };
    }
  } catch (err) {
    // Re-throw Next.js redirect/notFound errors — they use special throw signals
    if (err && typeof err === "object" && "digest" in err) throw err;
    // If Supabase is not configured, show dashboard with defaults for dev
    if (process.env.NODE_ENV === "production") {
      redirect(getPathname({ href: "/login", locale }));
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] selection:bg-[var(--color-blue)]/20">
      {/* Sidebar */}
      <Suspense
        fallback={
          <div className="fixed left-0 top-0 z-50 hidden h-screen w-64 border-r border-[var(--color-line)] bg-[var(--color-surface)] lg:block" />
        }
      >
        <DashboardSidebar />
      </Suspense>

      {/* Top bar */}
      <header className="glass fixed left-0 right-0 top-0 z-40 h-16 border-b border-[var(--color-line)] shadow-[var(--shadow-xs)] lg:left-64">
        <div className="flex h-full w-full items-center justify-between px-6 pl-16 lg:pl-8">
          <div className="flex items-center gap-4">
            <h2 className="hidden font-display text-base font-bold text-[var(--color-ink)] sm:block">
              {profile.role === "cleaner"
                ? t("cleanerPanel")
                : t("customerPanel")}
            </h2>
            <div className="mx-2 hidden h-4 w-px bg-[var(--color-line)] sm:block" />
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)] transition-colors group-focus-within:text-[var(--color-blue)]" />
              <input
                type="text"
                placeholder={t("search")}
                className="w-40 rounded-full border-none bg-[var(--color-surface-2)] py-1.5 pl-10 pr-4 text-sm transition-all focus:w-56 focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/20 sm:w-56 sm:focus:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-[var(--color-slate)] transition-colors hover:text-[var(--color-blue)]">
              <Bell className="h-5 w-5" />
            </button>
            <button className="text-[var(--color-slate)] transition-colors hover:text-[var(--color-blue)]">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-3 border-l border-[var(--color-line)] pl-4 sm:flex">
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  {profile.first_name}
                </p>
                <p className="text-[11px] text-[var(--color-slate)]">
                  {t("verified")}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-sm font-bold text-[var(--color-blue)] shadow-[var(--shadow-xs)]">
                {profile.first_name?.[0]?.toUpperCase() ?? "U"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content — offset for sidebar on desktop */}
      <main className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:ml-64 lg:px-8 lg:max-w-[1400px]">
        {children}
      </main>
    </div>
  );
}
