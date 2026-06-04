import type { MetadataRoute } from "next";
import { cleanerIds } from "@/lib/mock/cleaners";

const BASE = "https://getcleaners.nl";

/** Rutas públicas (nl canónico + alternate en). `en` lleva prefijo, `nl` no. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/schoonmakers",
    "/voor-verhuurders",
    "/voor-schoonmakers",
    "/prijzen",
    "/contact",
    "/veiligheid",
    "/help",
    "/voorwaarden",
    "/privacy",
    "/cookies",
    "/klachten",
  ];
  const cleanerPaths = cleanerIds().map((id) => `/schoonmakers/${id}`);
  const all = [...staticPaths, ...cleanerPaths];

  return all.map((p) => ({
    url: `${BASE}${p || "/"}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : p.startsWith("/schoonmakers") ? 0.8 : 0.5,
    alternates: {
      languages: {
        nl: `${BASE}${p || "/"}`,
        en: `${BASE}/en${p}`,
      },
    },
  }));
}
