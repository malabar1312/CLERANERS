import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { SignupForm } from "@/components/auth/signup-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signup.title") };
}

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { role: roleParam } = await searchParams;
  const initialRole = roleParam === "cleaner" ? "cleaner" : "customer";

  return (
    <>
      <AuthNav />
      <main className="min-h-screen bg-[var(--color-white)] text-[var(--color-ink)]">
        <Container
          size="sm"
          className="flex flex-col items-center pt-[calc(var(--nav-h-sm)+4rem)] pb-28"
        >
          <SignupForm initialRole={initialRole} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
