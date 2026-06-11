import { setRequestLocale } from "next-intl/server";

/** ISR: regenera cada 60s para que el waitlist count se actualice. */
export const revalidate = 60;
import { AuthNav } from "@/components/layout/auth-nav";
import { Hero } from "@/components/sections/hero";
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

        {/* White sheet — rises over the hero video with rounded corners (visual continuity) */}
        <div className="relative z-30 -mt-6 overflow-hidden rounded-t-[2rem] bg-white shadow-[0_-24px_80px_rgba(10,10,10,0.35)] lg:-mt-[14vh] lg:rounded-t-[3rem]">
          <CleanersShowcase />
          <HowItWorks />
          <Features />
          <Reviews />
          <CtaBand />
          <FAQ />
        </div>
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
