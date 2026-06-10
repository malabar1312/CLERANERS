import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MailCheck, ArrowLeft } from "lucide-react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/button-variants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.verify" });
  return { title: t("title") };
}

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.verify");

  return (
    <>
      <AuthNav />
      <main className="min-h-screen bg-[var(--color-white)] text-[var(--color-ink)]">
        <Container
          size="sm"
          className="flex flex-col items-center pt-[calc(var(--nav-h-sm)+6rem)] pb-28"
        >
          <div className="w-full max-w-md text-center">
            {/* Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-blue-soft)]">
              <MailCheck
                className="h-10 w-10 text-[var(--color-blue)]"
                aria-hidden="true"
              />
            </div>

            {/* Copy */}
            <h1 className="display mt-8 text-[length:var(--text-headline)] text-[var(--color-ink)]">
              {t("title")}
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
              {t("body")}
            </p>

            {/* Tips */}
            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-left">
              <p className="text-sm font-medium text-[var(--color-ink)]">
                {t("tipsTitle")}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]"
                    aria-hidden="true"
                  />
                  {t("tip1")}
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]"
                    aria-hidden="true"
                  />
                  {t("tip2")}
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]"
                    aria-hidden="true"
                  />
                  {t("tip3")}
                </li>
              </ul>
            </div>

            {/* Back link */}
            <Link
              href="/login"
              className={buttonStyles({
                variant: "ghost",
                size: "md",
                className: "mt-8",
              })}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("backToLogin")}
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
