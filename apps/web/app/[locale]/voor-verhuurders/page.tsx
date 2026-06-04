import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Home,
  Repeat,
  ShieldCheck,
  Sparkles,
  Star as StarIcon,
  BadgeCheck,
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
  const t = await getTranslations({ locale, namespace: "landlords" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const BENEFIT_ICONS = [Clock, ShieldCheck, Repeat, Sparkles] as const;
const STEP_ICONS = [Home, CalendarCheck, Sparkles] as const;

export default async function VoorVerhuurdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landlords");
  const benefits = asArray<{ title: string; body: string }>(t.raw("benefits.items"));
  const steps = asArray<{ title: string; body: string }>(t.raw("howItWorks.steps"));
  const testimonials = asArray<{ quote: string; author: string; detail: string }>(t.raw("social.items"));

  return (
    <>
      <AuthNav />
      <main className="bg-[var(--color-white)] text-[var(--color-ink)]">
        {/* Hero */}
        <header className="relative overflow-hidden border-b border-[var(--color-line)] pt-[calc(var(--nav-h-sm)+3rem)] pb-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(60% 55% at 80% 20%, rgb(0 102 255 / 0.04) 0%, transparent 60%)" }}
          />
          <Container size="wide">
            <div className="max-w-2xl">
              <span className="label inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-blue-soft)] px-3.5 py-1.5 text-[var(--color-blue)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-blue)]" aria-hidden="true" />
                {t("hero.eyebrow")}
              </span>
              <h1 className="display mt-6 text-balance text-[length:var(--text-display)] text-[var(--color-ink)]">
                {t("hero.title")}
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
                {t("hero.lead")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/schoonmakers" className={buttonStyles({ variant: "accent", size: "lg" })}>
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/prijzen" className={buttonStyles({ variant: "outline", size: "lg" })}>
                  {t("hero.ctaSecondary")}
                </Link>
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

        {/* How it works */}
        <Section variant="surface" kicker={t("howItWorks.kicker")} title={t("howItWorks.title")}>
          <ol className="grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length] ?? CalendarCheck;
              return (
                <li key={s.title}>
                  <Card variant="white" padding="md" className="h-full">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue)] font-display text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <Icon className="h-5 w-5 text-[var(--color-blue)]" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)]">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{s.body}</p>
                  </Card>
                </li>
              );
            })}
          </ol>
        </Section>

        {/* Social proof */}
        <Section variant="white" kicker={t("social.kicker")} title={t("social.title")}>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.author} variant="white" padding="lg" className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <StarIcon key={j} className="h-3.5 w-3.5 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-blue-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-blue)]">
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                    {t("social.verified")}
                  </span>
                </div>
                <blockquote className="mt-4 flex-1 text-pretty text-[15px] leading-relaxed text-[var(--color-ink)]">
                  {item.quote}
                </blockquote>
                <p className="mt-4 border-t border-[var(--color-line)] pt-4 text-sm text-[var(--color-muted)]">
                  {item.author} · {item.detail}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        {/* CTA band */}
        <section className="bg-[var(--color-dark)] py-16">
          <Container size="md" className="text-center">
            <h2 className="headline text-balance text-[length:var(--text-headline)] text-[var(--color-dark-ink)]">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-[var(--color-dark-muted)]">
              {t("cta.lead")}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/schoonmakers" className={buttonStyles({ variant: "on-dark", size: "lg" })}>
                {t("cta.button")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
