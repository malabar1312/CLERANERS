import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import {
  ArrowRight,
  Star,
  Shield,
  Banknote,
  Clock,
  Calendar,
  CheckCircle2,
  Users,
  Euro,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cleanerLanding" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

/**
 * `/aanmelden/schoonmaker` — Landing page for cleaner recruitment.
 * Traffic comes from Indeed, job boards, social, Google Ads.
 * Source tracking via `?source=` param (preserved through signup).
 *
 * BETA badge is shown here (per Antonio's decision: only on this page).
 */
export default async function CleanerRecruitmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { locale } = await params;
  const { source } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("cleanerLanding");

  // Preserve source through signup link
  const signupHref = `/signup?role=cleaner${source ? `&source=${encodeURIComponent(source)}` : ""}`;

  return (
    <>
      <AuthNav />
      <main className="bg-[var(--color-white)] text-[var(--color-ink)]">
        {/* ─── Hero ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-[var(--color-line)] pt-[calc(var(--nav-h-sm)+2rem)] pb-20">
          <Container size="wide">
            <div className="mx-auto max-w-3xl text-center">
              {/* BETA badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-blue)]/20 bg-[var(--color-blue)]/5 px-4 py-1.5 text-xs font-bold tracking-wide text-[var(--color-blue)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-blue)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-blue)]" />
                </span>
                BETA — {t("betaBadge")}
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {t("heroTitle")}
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
                {t("heroLead")}
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href={signupHref}
                  className="group flex items-center gap-2 rounded-full bg-[var(--color-blue)] px-8 py-4 text-base font-bold text-white shadow-[var(--shadow-blue)] transition-all hover:bg-[var(--color-blue-2)]"
                >
                  {t("heroCta")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/prijzen"
                  className="flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-white)] px-6 py-4 text-sm font-semibold text-[var(--color-ink)] transition-all hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
                >
                  {t("heroCtaSecondary")}
                </Link>
              </div>

              {/* Trust stats */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--color-muted)]">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" />
                  {t("stat1")}
                </span>
                <span className="h-4 w-px bg-[var(--color-line)]" />
                <span className="flex items-center gap-1.5">
                  <Banknote className="h-4 w-4 text-[var(--color-blue)]" />
                  {t("stat2")}
                </span>
                <span className="h-4 w-px bg-[var(--color-line)]" />
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-[var(--color-blue)]" />
                  {t("stat3")}
                </span>
              </div>
            </div>
          </Container>
        </section>

        {/* ─── Income calculator ─────────────────────────────── */}
        <section className="border-b border-[var(--color-line)] py-20">
          <Container size="wide">
            <div className="text-center">
              <p className="label text-[var(--color-blue)]">{t("incomeSectionKicker")}</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("incomeSectionTitle")}
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
              {[
                { hours: 10, icon: Clock, label: t("incomePartTime") },
                { hours: 20, icon: Calendar, label: t("incomeHalfTime") },
                { hours: 32, icon: TrendingUp, label: t("incomeFullTime") },
              ].map(({ hours, icon: Icon, label }) => (
                <div
                  key={hours}
                  className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-6 text-center shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-ambient)]"
                >
                  <Icon className="mx-auto mb-3 h-8 w-8 text-[var(--color-blue)]" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
                    {label}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-slate)]">
                    {hours} {t("hoursPerWeek")}
                  </p>
                  <p className="mt-3 font-display text-3xl font-bold text-[var(--color-ink)]">
                    €{Math.round(26 * 0.85 * hours * 4.33).toLocaleString("nl-NL")}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{t("perMonthNet")}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
              {t("incomeDisclaimer")}
            </p>
          </Container>
        </section>

        {/* ─── Benefits ──────────────────────────────────────── */}
        <section className="border-b border-[var(--color-line)] py-20">
          <Container size="wide">
            <div className="text-center">
              <p className="label text-[var(--color-blue)]">{t("benefitsKicker")}</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("benefitsTitle")}
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Euro, title: t("benefit1Title"), body: t("benefit1Body") },
                { icon: Calendar, title: t("benefit2Title"), body: t("benefit2Body") },
                { icon: Shield, title: t("benefit3Title"), body: t("benefit3Body") },
                { icon: Banknote, title: t("benefit4Title"), body: t("benefit4Body") },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-soft)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-blue)]/10">
                    <Icon className="h-6 w-6 text-[var(--color-blue)]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-slate)]">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── How it works ──────────────────────────────────── */}
        <section className="border-b border-[var(--color-line)] py-20 bg-[var(--color-surface)]">
          <Container size="wide">
            <div className="text-center">
              <p className="label text-[var(--color-blue)]">{t("howKicker")}</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("howTitle")}
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-3">
              {[
                { num: "1", title: t("howStep1Title"), body: t("howStep1Body") },
                { num: "2", title: t("howStep2Title"), body: t("howStep2Body") },
                { num: "3", title: t("howStep3Title"), body: t("howStep3Body") },
              ].map(({ num, title, body }) => (
                <div key={num} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-blue)] font-display text-lg font-bold text-white shadow-[var(--shadow-blue)]">
                    {num}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-slate)]">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── Social proof ──────────────────────────────────── */}
        <section className="border-b border-[var(--color-line)] py-20">
          <Container size="wide">
            <div className="text-center">
              <p className="label text-[var(--color-blue)]">{t("socialKicker")}</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("socialTitle")}
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
              {[
                { quote: t("quote1"), author: t("quote1Author"), detail: t("quote1Detail") },
                { quote: t("quote2"), author: t("quote2Author"), detail: t("quote2Detail") },
              ].map(({ quote, author, detail }) => (
                <div
                  key={author}
                  className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-soft)]"
                >
                  <div className="mb-3 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[#F5A623] text-[#F5A623]"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-slate)]">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-blue)]/10 font-bold text-[var(--color-blue)]">
                      {author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-ink)]">{author}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        <CheckCircle2 className="mr-1 inline h-3 w-3 text-[var(--color-blue)]" />
                        {detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── FAQ ────────────────────────────────────────────── */}
        <section className="border-b border-[var(--color-line)] py-20 bg-[var(--color-surface)]">
          <Container size="sm">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("faqTitle")}
              </h2>
            </div>
            <div className="mt-10 space-y-4">
              {(
                [
                  [t("faq1Q"), t("faq1A")],
                  [t("faq2Q"), t("faq2A")],
                  [t("faq3Q"), t("faq3A")],
                  [t("faq4Q"), t("faq4A")],
                  [t("faq5Q"), t("faq5A")],
                ] as [string, string][]
              ).map(([q, a]) => (
                <details
                  key={q}
                  className="group rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] shadow-[var(--shadow-soft)]"
                >
                  <summary className="cursor-pointer px-6 py-4 font-display text-base font-bold text-[var(--color-ink)] [&::-webkit-details-marker]:hidden">
                    {q}
                  </summary>
                  <div className="border-t border-[var(--color-line)] px-6 py-4 text-sm leading-relaxed text-[var(--color-slate)]">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── Bottom CTA ────────────────────────────────────── */}
        <section className="bg-[var(--color-ink)] py-20 text-white">
          <Container size="sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-blue)]">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("bottomCtaTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base text-white/70">
                {t("bottomCtaLead")}
              </p>
              <Link
                href={signupHref}
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue)] px-8 py-4 text-base font-bold text-white shadow-[var(--shadow-blue)] transition-all hover:bg-[var(--color-blue-2)]"
              >
                {t("bottomCtaButton")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
