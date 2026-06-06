import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.forgotPassword" });
  return { title: t("title") };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <AuthNav />
      <main className="min-h-screen bg-[var(--color-white)] text-[var(--color-ink)]">
        <Container size="sm" className="flex flex-col items-center pt-[calc(var(--nav-h-sm)+4rem)] pb-28">
          <ForgotPasswordForm />
        </Container>
      </main>
      <Footer />
    </>
  );
}
