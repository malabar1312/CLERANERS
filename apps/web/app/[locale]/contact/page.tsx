import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Mail, MapPin, Clock } from "lucide-react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/sections/contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return { title: t("title") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");

  return (
    <>
      <AuthNav />
      <main className="min-h-screen bg-[var(--color-white)] text-[var(--color-ink)]">
        <header className="border-b border-[var(--color-line)] pt-[calc(var(--nav-h-sm)+3.5rem)] pb-10">
          <Container size="md">
            <p className="label flex items-center gap-2 text-[var(--color-blue)]">
              <span className="h-1.5 w-1.5 bg-[var(--color-blue)]" aria-hidden="true" />
              {t("eyebrow")}
            </p>
            <h1 className="display mt-4 text-balance text-[length:var(--text-display)] text-[var(--color-ink)]">
              {t("title")}
            </h1>
            <p className="measure-prose mt-4 text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
              {t("lead")}
            </p>
          </Container>
        </header>

        <Container size="md" className="py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <ContactForm />

            <div className="space-y-5">
              <Card variant="white" padding="md">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{t("info.emailLabel")}</p>
                    <a href="mailto:info@getcleaners.nl" className="text-sm text-[var(--color-blue)] underline-offset-4 hover:underline" translate="no">
                      info@getcleaners.nl
                    </a>
                  </div>
                </div>
              </Card>
              <Card variant="white" padding="md">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{t("info.locationLabel")}</p>
                    <p className="text-sm text-[var(--color-muted)]">Amsterdam, Nederland</p>
                  </div>
                </div>
              </Card>
              <Card variant="white" padding="md">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{t("info.hoursLabel")}</p>
                    <p className="text-sm text-[var(--color-muted)]">{t("info.hours")}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
