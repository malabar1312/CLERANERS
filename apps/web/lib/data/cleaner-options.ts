/**
 * Opciones canónicas del alta de cleaners (barrios, especialidades, idiomas).
 *
 * Módulo compartido SIN "use server": lo importan tanto el wizard (client)
 * como la Server Action. Las constantes no pueden vivir en el archivo de la
 * action — Next.js exige que un archivo "use server" exporte SOLO funciones
 * async (invalid-use-server-value).
 */

// ─── Amsterdam hoods (canonical list) ────────────────────────────────────────
export const AMSTERDAM_HOODS = [
  "Centrum",
  "De Pijp",
  "Jordaan",
  "Oud-West",
  "Oud-Zuid",
  "Zuid",
  "Oost",
  "West",
  "Noord",
  "Nieuw-West",
  "Zuidoost",
  "IJburg",
  "Westerpark",
  "Rivierenbuurt",
  "Buitenveldert",
  "Watergraafsmeer",
  "Amstelveen",
] as const;

// ─── Specialties (NL, matches mock catalog) ──────────────────────────────────
export const CLEANER_SPECIALTIES = [
  "Wekelijks",
  "Diepe reiniging",
  "Ramen",
  "Strijken",
  "Verhuisreiniging",
  "Premium",
  "Eco-producten",
  "Huisdieren OK",
  "Detail-georiënteerd",
  "Studentenkamers",
  "Snel & efficiënt",
  "Boodschappen",
  "Kantoren",
  "Airbnb / vakantieverhuur",
] as const;

// ─── Languages ───────────────────────────────────────────────────────────────
export const CLEANER_LANGUAGES = [
  "Nederlands",
  "Engels",
  "Spaans",
  "Portugees",
  "Pools",
  "Turks",
  "Arabisch",
  "Frans",
  "Duits",
] as const;
