import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { CleanersBrowser } from "@/components/sections/cleaners-browser";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("schoonmakers") };
}

export default async function SchoonmakersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("schoonmakersPage");

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

        <CleanersBrowser />
      </main>
      <Footer />
    </>
  );
}
