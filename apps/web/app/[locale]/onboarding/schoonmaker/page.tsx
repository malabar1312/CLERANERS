import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AuthNav } from "@/components/layout/auth-nav";
import { Container } from "@/components/layout/container";
import { CleanerWizard } from "@/components/domain/onboarding/cleaner-wizard";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboarding.cleaner" });
  return { title: t("metaTitle"), robots: { index: false } };
}

/**
 * `/onboarding/schoonmaker` — auth-gated wizard for cleaners to create
 * their `cleaner_profiles` row. Redirects if:
 * - Not logged in → /login
 * - Not role=cleaner → /dashboard
 * - Already has cleaner_profiles → /dashboard (or their profile page)
 */
export default async function CleanerOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const currentLocale = await getLocale();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → login
  if (!user) {
    redirect(getPathname({ href: "/login", locale: currentLocale }));
  }

  // Check profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name")
    .eq("id", user.id)
    .maybeSingle();

  // Not a cleaner → dashboard
  if (!profile || profile.role !== "cleaner") {
    redirect(getPathname({ href: "/dashboard", locale: currentLocale }));
  }

  // Already has cleaner_profiles → dashboard. (No al perfil público: si el
  // perfil aún está visible=false, /schoonmakers/[slug] filtra y daría 404.)
  // Check con admin client: el alta queda visible=false y la RLS pública solo
  // deja leer visible=true — con el user client el borrador sería invisible
  // hasta que se aplique la policy cleaner_profiles_own_select.
  const adminDb = createSupabaseAdminClient();
  const { data: existing } = await (adminDb ?? supabase)
    .from("cleaner_profiles")
    .select("slug")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(getPathname({ href: "/dashboard", locale: currentLocale }));
  }

  const t = await getTranslations("onboarding.cleaner");
  const userName =
    profile.first_name ||
    user.user_metadata?.full_name ||
    "";

  return (
    <>
      <AuthNav />
      <main className="min-h-screen bg-[var(--color-surface)] pt-[calc(var(--nav-h-sm)+2rem)] pb-20">
        <Container size="sm">
          {/* Welcome header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-blue)]/10">
              <span className="text-3xl" role="img" aria-label="wave">
                👋
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              {t("welcomeTitle", { name: userName || t("defaultName") })}
            </h1>
            <p className="mt-3 text-lg text-[var(--color-muted)]">
              {t("welcomeLead")}
            </p>
          </div>

          <CleanerWizard userName={userName} />
        </Container>
      </main>
    </>
  );
}
