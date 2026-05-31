import { setRequestLocale } from "next-intl/server";
import { Nav } from "@/components/layout/nav";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { CleanersGrid } from "@/components/sections/cleaners-grid";
import { Reviews } from "@/components/sections/reviews";
import { CtaBand } from "@/components/sections/cta-band";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { StickyMobileCta } from "@/components/sections/sticky-cta";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://getcleaners.nl/#org",
      name: "cleaners",
      url: "https://getcleaners.nl",
      logo: "https://getcleaners.nl/icon.svg",
      areaServed: { "@type": "City", name: "Amsterdam" },
    },
    {
      "@type": "Service",
      serviceType: "Schoonmaak / Cleaning",
      provider: { "@id": "https://getcleaners.nl/#org" },
      areaServed: { "@type": "City", name: "Amsterdam" },
      description:
        "Vertrouwensplatform voor schoonmaak in Amsterdam. Bekijk profielen van geverifieerde schoonmakers, kies wie jou aanspreekt en boek veilig.",
    },
  ],
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Features />
        <CleanersGrid />
        <Reviews />
        <CtaBand />
        <FAQ />
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
