import { setRequestLocale } from "next-intl/server";

/** ISR: regenera cada 60s para que el waitlist count se actualice. */
export const revalidate = 60;
import { AuthNav } from "@/components/layout/auth-nav";
import { Hero } from "@/components/sections/hero";
import { SearchBar } from "@/components/ui/search-bar";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { CleanersShowcase } from "@/components/sections/cleaners-showcase";
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
      <AuthNav />
      <main id="main">
        <Hero />

        {/* Floating Search Bar (overlap sobre el hero) */}
        <div className="relative z-30 -mt-16 w-full px-4 pb-16 sm:-mt-24 sm:px-6 lg:px-8">
          <SearchBar />
        </div>

        <CleanersShowcase />
        <HowItWorks />
        <Features />
        <Reviews />
        <CtaBand />
        <FAQ />
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
