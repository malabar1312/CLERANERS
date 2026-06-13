import type { MetadataRoute } from "next";
import { getCleaners, getCleanerIds } from "@/lib/data/cleaners";

const BASE = "https://getcleaners.nl";

/** Rutas públicas (nl canónico + alternate en). `en` lleva prefijo, `nl` no. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/schoonmakers",
    "/voor-verhuurders",
    "/voor-schoonmakers",
    "/aanmelden/schoonmaker",
    "/prijzen",
    "/contact",
    "/veiligheid",
    "/help",
    "/voorwaarden",
    "/privacy",
    "/cookies",
    "/klachten",
  ];
  const cleaners = await getCleaners();
  // Landing por barrio: /schoonmakers?hood=X tiene title/desc/canonical
  // propios (ver schoonmakers/page.tsx) → indexable como página única.
  const hoodPaths = [...new Set(cleaners.map((c) => c.hood))].map(
    (hood) => `/schoonmakers?hood=${encodeURIComponent(hood)}`,
  );
  const cleanerPaths = (await getCleanerIds()).map((id) => `/schoonmakers/${id}`);
  const all = [...staticPaths, ...hoodPaths, ...cleanerPaths];

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
