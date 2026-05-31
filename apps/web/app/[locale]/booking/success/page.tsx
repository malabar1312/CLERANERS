import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/button-variants";
import { getStripe } from "@/lib/stripe/server";
import { getCleanerById } from "@/lib/mock/cleaners";
import { formatEur } from "@/lib/booking/pricing";

export const metadata: Metadata = { title: "Reservering" };
export const dynamic = "force-dynamic";

async function loadSession(sessionId?: string) {
  if (!sessionId) return null;
  try {
    const stripe = getStripe();
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    const meta = s.metadata ?? {};
    const cleaner = meta.cleaner_id ? getCleanerById(meta.cleaner_id) : undefined;
    return {
      ref: `BK-${(s.payment_intent as string | null ?? s.id).slice(-8).toUpperCase()}`,
      amount: typeof s.amount_total === "number" ? formatEur(s.amount_total) : null,
      cleanerName: cleaner?.name ?? "je schoonmaker",
      paid: s.payment_status === "paid" || s.status === "complete",
    };
  } catch {
    return null;
  }
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { session_id } = await searchParams;
  const t = await getTranslations("bookingSuccess");
  const data = await loadSession(session_id);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[var(--color-white)] text-[var(--color-ink)]">
        <Container size="sm" className="flex flex-col items-center pt-[calc(var(--nav-h-sm)+4rem)] pb-[var(--space-section)] text-center">
          {data ? (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-blue-soft)] text-[var(--color-blue)]">
                <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
              </span>
              <p className="label mt-6 text-[var(--color-blue)]">{t("eyebrow")}</p>
              <h1 className="display mt-3 text-balance text-[length:var(--text-headline)] text-[var(--color-ink)]">
                {t("title")}
              </h1>
              <p className="measure-prose mt-4 text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
                {t("body", { name: data.cleanerName })}
              </p>

              <dl className="mt-8 w-full max-w-sm space-y-2.5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-left">
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-[var(--color-muted)]">{t("ref")}</dt>
                  <dd className="font-semibold text-[var(--color-ink)]" translate="no">{data.ref}</dd>
                </div>
                {data.paid && data.amount && (
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-[var(--color-muted)]">{t("amount")}</dt>
                    <dd className="font-semibold text-[var(--color-ink)]">{data.amount}</dd>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <>
              <h1 className="display text-[length:var(--text-headline)] text-[var(--color-ink)]">{t("missing")}</h1>
            </>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className={buttonStyles({ variant: "primary", size: "lg" })}>{t("backHome")}</Link>
            <Link href="/schoonmakers" className={buttonStyles({ variant: "outline", size: "lg" })}>{t("browse")}</Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
