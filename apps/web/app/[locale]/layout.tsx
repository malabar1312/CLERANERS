import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Anton, Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Display — Anton: condensed, heavy, uppercase. The brutal headline voice.
const anton = Anton({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
  weight: ["400"],
});

// Body / UI — Inter variable.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getcleaners.nl"),
  title: {
    default: "cleaners — vertrouwensplatform voor schoonmaak in Amsterdam",
    template: "%s · cleaners",
  },
  description:
    "Geen schoonmaakbedrijf. Een marktplaats van geverifieerde schoonmakers in Amsterdam. Bekijk profielen, kies wie jou aanspreekt, boek veilig.",
  applicationName: "cleaners",
  authors: [{ name: "cleaners B.V." }],
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://getcleaners.nl",
    siteName: "cleaners",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${anton.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
