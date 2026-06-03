import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ShieldCheck, Umbrella, BadgeCheck, LifeBuoy, Check, ArrowRight } from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/button-variants";
import { computePrice, formatEur } from "@/lib/booking/pricing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricingPage" });
  return { title: t("title"), description: t("lead") };
}

/** Ejemplo de cálculo — fuente de verdad: la misma lógica que el booking. */
const EXAMPLE_M2 = 70;
const EXAMPLE_RATE = 24;

const INCLUDED_ICONS = [ShieldCheck, Umbrella, BadgeCheck, LifeBuoy] as const;

export default async function PrijzenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricingPage");

  const bd = computePrice(EXAMPLE_RATE, EXAMPLE_M2);
  const steps = t.raw("how.steps") as { title: string; body: string }[];
  const tableRows = t.raw("table.rows") as { area: string; hours: string }[];
  const included = t.raw("included.items") as string[];

  return (
    <>
      <Nav />
      <main className="bg-[var(--color-white)] text-[var(--color-ink)]">
        {/* Header */}
        <header className="border-b border-[var(--color-line)] pt-[calc(var(--nav-h-sm)+3.5rem)] pb-14">
          <Container size="wide">
            <p className="label flex items-center gap-2 text-[var(--color-blue)]">
              <span className="h-1.5 w-1.5 bg-[var(--color-blue)]" aria-hidden="true" />
              {t("eyebrow")}
            </p>
            <h1 className="display mt-5 max-w-[18ch] text-balance text-[length:var(--text-display)] text-[var(--color-ink)]">
              {t("title")}
            </h1>
            <p className="measure-prose mt-5 text-pretty text-[length:var(--text-lead)] leading-relaxed text-[var(--color-muted)]">
              {t("lead")}
            </p>
          </Container>
        </header>

        <Container size="wide" className="py-[var(--space-section)]">
          {/* How it works — 3 steps */}
          <h2 className="headline text-2xl text-[var(--color-ink)]">{t("how.title")}</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title}>
                <Card variant="white" padding="md" className="h-full">
                  <span className="font-display text-sm font-semibold text-[var(--color-blue)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-base font-semibold text-[var(--color-ink)]">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{s.body}</p>
                </Card>
              </li>
            ))}
          </ol>

          {/* Table + worked example */}
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* m² → hours table */}
            <Card variant="white" padding="lg" className="h-full">
              <h2 className="headline text-xl text-[var(--color-ink)]">{t("table.title")}</h2>
              <table className="mt-5 w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
                    <th scope="col" className="pb-2.5 font-medium">{t("table.area")}</th>
                    <th scope="col" className="pb-2.5 text-right font-medium">{t("table.hours")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.area} className="border-b border-[var(--color-line-2)] last:border-0">
                      <td className="py-3 text-[var(--color-ink)]">{r.area}</td>
                      <td className="py-3 text-right font-semibold text-[var(--color-ink)]">{r.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Worked example */}
            <Card variant="white" padding="lg" className="h-full">
              <h2 className="headline text-xl text-[var(--color-ink)]">{t("example.title")}</h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                {t("example.intro", { m2: EXAMPLE_M2, rate: EXAMPLE_RATE })}
              </p>
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--color-slate)]">{t("example.hoursLine", { hours: bd.hours, rate: EXAMPLE_RATE })}</dt>
                  <dd className="font-medium text-[var(--color-ink)]">{formatEur(bd.subtotalCents)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--color-slate)]">{t("example.fee")}</dt>
                  <dd className="font-medium text-[var(--color-ink)]">{formatEur(bd.feeCents)}</dd>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-[var(--color-line)] pt-3">
                  <dt className="font-semibold text-[var(--color-ink)]">{t("example.total")}</dt>
                  <dd className="text-lg font-bold text-[var(--color-blue)]">{formatEur(bd.totalCents)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-[var(--color-muted)]">{t("example.note")}</p>
            </Card>
          </div>

          {/* What's in the 18% + reassurance */}
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card variant="white" padding="lg">
              <h2 className="headline text-xl text-[var(--color-ink)]">{t("included.title")}</h2>
              <ul className="mt-5 space-y-3.5">
                {included.map((item, i) => {
                  const Icon = INCLUDED_ICONS[i % INCLUDED_ICONS.length] ?? ShieldCheck;
                  return (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-slate)]">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-soft)]">
                        <Icon className="h-3.5 w-3.5 text-[var(--color-blue)]" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card variant="white" padding="lg" className="flex flex-col">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-blue-soft)]">
                <Check className="h-5 w-5 text-[var(--color-blue)]" aria-hidden="true" />
              </span>
              <h2 className="headline mt-4 text-xl text-[var(--color-ink)]">{t("reassure.title")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{t("reassure.body")}</p>
            </Card>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/schoonmakers" className={buttonStyles({ variant: "accent", size: "lg" })}>
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/" className={buttonStyles({ variant: "outline", size: "lg" })}>
              {t("ctaSecondary")}
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
