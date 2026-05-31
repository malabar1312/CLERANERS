import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
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
      <Nav />
      <main className="bg-[var(--color-noir)] text-[var(--color-ivory)]">
        {/* Page header — clears the fixed nav */}
        <header className="relative overflow-hidden border-b border-[var(--color-line)] pt-[calc(var(--nav-h-sm)+3.5rem)] pb-14">
          <div aria-hidden="true" className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.1] mix-blend-screen" />
          <Container size="wide">
            <p className="kicker flex items-center gap-2 text-[var(--color-acid)]">
              <span className="h-1.5 w-1.5 bg-[var(--color-acid)]" aria-hidden="true" />
              {t("kicker")}
            </p>
            <h1 className="headline mt-5 max-w-[14ch] text-balance text-[length:var(--text-display-1)]">
              {t("title")}
            </h1>
            <p className="measure-prose mt-5 text-pretty text-[length:var(--text-lead)] leading-relaxed text-[var(--color-ivory-dim)]">
              {t("lead")}
            </p>
          </Container>
        </header>

        <CleanersBrowser />
      </main>
      <Footer />
    </>
  );
}
