import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PlaceholderPage } from "@/components/sections/placeholder-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "placeholders" });
  return { title: t("klachten.title") };
}

export default async function KlachtenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("placeholders");

  return (
    <PlaceholderPage
      eyebrow={t("klachten.eyebrow")}
      title={t("klachten.title")}
      body={t("klachten.body")}
      backHomeLabel={t("backHome")}
      secondaryCta={{ label: t("contactCta"), href: "/contact" }}
    />
  );
}
