import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Banknote,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Star as StarIcon,
  Users,
} from "lucide-react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/button-variants";
import { asArray } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forCleaners" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const BENEFIT_ICONS = [Banknote, CalendarCheck, ShieldCheck, Clock] as const;

export default async function VoorSchoonmakersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("forCleaners");
  const benefits = asArray<{ title: string; body: string }>(t.raw("benefits.items"));
  const steps = asArray<{ title: string; body: string }>(t.raw("howItWorks.steps"));

  return (
    <>
      <AuthNav />
      <main className="bg-[var(--color-white)] text-[var(--color-ink)]">
        {/* Hero */}
        <header className="relative overflow-hidden border-b border-[var(--color-line)] pt-[calc(var(--nav-h-sm)+3rem)] pb-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(50% 50% at 70% 30%, rgb(0 102 255 / 0.04) 0%, transparent 60%)" }}
          />
          <Container size="wide">
            <div className="max-w-2xl">
              <span className="label inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-blue-soft)] px-3.5 py-1.5 text-[var(--color-blue)]">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {t("hero.eyebrow")}
              </span>
              <h1 className="display mt-6 text-balance text-[length:var(--text-display)] text-[var(--color-ink)]">
                {t("hero.title")}
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
                {t("hero.lead")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/aanmelden/schoonmaker" className={buttonStyles({ variant: "accent", size: "lg" })}>
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/prijzen" className={buttonStyles({ variant: "outline", size: "lg" })}>
                  {t("hero.ctaSecondary")}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-[var(--color-slate)]">
                <span className="flex items-center gap-1.5">
                  <StarIcon className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                  {t("hero.stat1")}
                </span>
                <span className="text-[var(--color-line)]" aria-hidden="true">·</span>
                <span>{t("hero.stat2")}</span>
                <span className="text-[var(--color-line)]" aria-hidden="true">·</span>
                <span>{t("hero.stat3")}</span>
              </div>
            </div>
          </Container>
        </header>

        {/* Benefits */}
        <Section variant="white" kicker={t("benefits.kicker")} title={t("benefits.title")} lead={t("benefits.lead")}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => {
              const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length] ?? ShieldCheck;
              return (
                <Card key={b.title} variant="white" padding="md" className="flex flex-col">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-blue-soft)]">
                    <Icon className="h-5 w-5 text-[var(--color-blue)]" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)]">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{b.body}</p>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* How to join */}
        <Section variant="surface" kicker={t("howItWorks.kicker")} title={t("howItWorks.title")}>
          <ol className="grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title}>
                <Card variant="white" padding="md" className="h-full">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-blue)] font-display text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{s.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </Section>

        {/* CTA */}
        <section className="bg-[var(--color-dark)] py-16">
          <Container size="md" className="text-center">
            <h2 className="headline text-balance text-[length:var(--text-headline)] text-[var(--color-dark-ink)]">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-[var(--color-dark-muted)]">
              {t("cta.lead")}
            </p>
            <Link href="/aanmelden/schoonmaker" className={buttonStyles({ variant: "on-dark", size: "lg", className: "mt-8" })}>
              {t("cta.button")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
