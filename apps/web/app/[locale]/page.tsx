import { setRequestLocale } from "next-intl/server";
import { Nav } from "@/components/layout/nav";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { CleanersGrid } from "@/components/sections/cleaners-grid";
import { Reviews } from "@/components/sections/reviews";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { StickyMobileCta } from "@/components/sections/sticky-cta";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Features />
        <CleanersGrid />
        <Reviews />
        <FAQ />
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
