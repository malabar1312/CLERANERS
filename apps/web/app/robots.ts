import type { MetadataRoute } from "next";

const BASE = "https://getcleaners.nl";

export default function robots(): MetadataRoute.Robots {
  // Auth-gated y flujos privados fuera del index (además del noindex en
  // metadata): que los crawlers ni los pidan. `*` cubre el prefijo /en.
  const privatePaths = [
    "/api/",
    "/booking/success",
    "/dashboard",
    "/en/dashboard",
    "/onboarding/",
    "/en/onboarding/",
    "/login",
    "/en/login",
    "/signup",
    "/en/signup",
    "/auth/",
  ];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: privatePaths,
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
