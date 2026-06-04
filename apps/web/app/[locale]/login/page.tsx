import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { LoginForm } from "@/components/auth/login-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("login.title") };
}

export default async function LoginPage({
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
        <Container
          size="sm"
          className="flex flex-col items-center pt-[calc(var(--nav-h-sm)+4rem)] pb-28"
        >
          <LoginForm />
        </Container>
      </main>
      <Footer />
    </>
  );
}
