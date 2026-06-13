import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { CleanersBrowser } from "@/components/sections/cleaners-browser";
import { getCleaners } from "@/lib/data/cleaners";

const BASE = "https://getcleaners.nl";

// ISR: refleja cleaners reales añadidos a Supabase sin rebuild completo.
export const revalidate = 60;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ hood?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const hood = sp.hood?.trim();

  if (hood) {
    const cleaners = await getCleaners();
    const match = cleaners.find(
      (c) => c.hood.toLowerCase() === hood.toLowerCase(),
    );
    if (match) {
      const canonical = `/schoonmakers?hood=${encodeURIComponent(match.hood)}`;
      return {
        title: `Schoonmakers in ${match.hood}`,
        description:
          locale === "en"
            ? `Find verified cleaners in ${match.hood}, Amsterdam. Compare profiles, read reviews, and book securely via cleaners.`
            : `Vind geverifieerde schoonmakers in ${match.hood}, Amsterdam. Vergelijk profielen, lees reviews en boek veilig via cleaners.`,
        alternates: {
          canonical: `${BASE}${canonical}`,
          languages: { nl: `${BASE}${canonical}`, en: `${BASE}/en${canonical}` },
        },
      };
    }
  }

  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: t("schoonmakers"),
    description:
      locale === "en"
        ? "Browse verified cleaners in Amsterdam. Compare profiles, specialties, and reviews. Book securely via cleaners."
        : "Bekijk geverifieerde schoonmakers in Amsterdam. Vergelijk profielen, specialiteiten en reviews. Boek veilig via cleaners.",
    alternates: {
      canonical: `${BASE}/schoonmakers`,
      languages: {
        nl: `${BASE}/schoonmakers`,
        en: `${BASE}/en/schoonmakers`,
      },
    },
  };
}

export default async function SchoonmakersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ hood?: string; date?: string; time?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("schoonmakersPage");
  const cleaners = await getCleaners();

  // Contexto de búsqueda del hero — el hood solo se aplica si existe en el catálogo.
  const sp = await searchParams;
  const requestedHood = sp.hood?.trim();
  const initialHood =
    requestedHood && cleaners.some((c) => c.hood.toLowerCase() === requestedHood.toLowerCase())
      ? cleaners.find((c) => c.hood.toLowerCase() === requestedHood.toLowerCase())!.hood
      : undefined;

  return (
    <>
      <AuthNav />
      <main className="bg-[var(--color-white)] text-[var(--color-ink)]">
        {/* Page header — clears the fixed nav */}
        <header className="relative overflow-hidden border-b border-[var(--color-line)] pt-[calc(var(--nav-h-sm)+3.5rem)] pb-14">
          <Container size="wide">
            <p className="label flex items-center gap-2 text-[var(--color-blue)]">
              <span className="h-1.5 w-1.5 bg-[var(--color-blue)]" aria-hidden="true" />
              {t("kicker")}
            </p>
            <h1 className="display mt-5 max-w-[16ch] text-balance text-[length:var(--text-display)] text-[var(--color-ink)]">
              {t("title")}
            </h1>
            <p className="measure-prose mt-5 text-pretty text-[length:var(--text-lead)] leading-relaxed text-[var(--color-muted)]">
              {t("lead")}
            </p>
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-slate)]">
              <Info className="h-4 w-4 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
              <span>{t("priceNote")}</span>
              <Link
                href="/prijzen"
                className="font-medium text-[var(--color-blue)] underline-offset-4 hover:underline"
              >
                {t("priceNoteLink")} →
              </Link>
            </p>
          </Container>
        </header>

        <CleanersBrowser
          cleaners={cleaners}
          initialHood={initialHood}
          searchDate={sp.date}
          searchTime={sp.time}
        />
      </main>
      <Footer />
    </>
  );
}
