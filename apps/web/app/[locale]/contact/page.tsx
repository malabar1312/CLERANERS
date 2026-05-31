import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PlaceholderPage } from "@/components/sections/placeholder-page";

const CONTACT_EMAIL = "hello@getcleaners.nl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "placeholders" });
  return { title: t("contact.title") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("placeholders");

  return (
    <PlaceholderPage
      eyebrow={t("contact.eyebrow")}
      title={t("contact.title")}
      body={
        <>
          {t("contact.body")}{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-[var(--color-blue)] underline-offset-4 hover:underline"
            translate="no"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </>
      }
      note={t("contact.note")}
      backHomeLabel={t("backHome")}
      secondaryCta={{ label: t("contactCta"), href: `mailto:${CONTACT_EMAIL}` }}
    />
  );
}
