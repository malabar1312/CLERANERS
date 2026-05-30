import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/layout/nav";
import { Container } from "@/components/layout/container";
import { Star } from "@/components/brand/star";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hero");

  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden bg-[var(--color-navy)] pt-32 pb-24 text-white sm:pt-40 sm:pb-32">
          {/* Soft iris glow behind hero */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[60%] opacity-[0.55]"
            style={{
              background:
                "radial-gradient(60% 80% at 20% 0%, rgba(79,70,229,.45) 0%, transparent 60%), radial-gradient(50% 70% at 90% 10%, rgba(139,92,246,.35) 0%, transparent 60%)",
            }}
          />
          <Container className="relative z-10">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur">
                <Star className="h-3.5 w-3.5 text-[var(--color-blue-light)]" />
                {t("eyebrow")}
              </span>

              <h1 className="font-display mt-7 text-balance text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                {t("title")}
              </h1>

              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/75 sm:text-xl">
                {t("lead")}
              </p>

              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Button size="lg" variant="primary">
                  {t("ctaPrimary")}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="ghost-on-dark">
                  {t("ctaSecondary")}
                </Button>
              </div>

              <p className="mt-8 text-xs uppercase tracking-[0.18em] text-white/40">
                <Wordmark /> · Amsterdam
              </p>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
