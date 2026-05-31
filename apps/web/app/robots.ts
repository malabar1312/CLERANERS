import type { MetadataRoute } from "next";

const BASE = "https://getcleaners.nl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/booking/success"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
