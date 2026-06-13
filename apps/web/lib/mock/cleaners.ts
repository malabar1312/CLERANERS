/**
 * Mock cleaners — Fase 2 (landing pública).
 *
 * Fase 4 reemplaza esto con un fetch contra Supabase `profiles WHERE role='cleaner'`.
 * Hasta entonces, este array alimenta el grid de la landing.
 *
 * TODO(fase-3): replace `CleanerPreview` with the real `Cleaner` row type from
 * `@cleaners/db` once `supabase gen types` runs against the live project.
 */

export type CleanerPreview = {
  id: string;
  name: string;
  hood: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  verified: boolean;
  online: boolean;
  /** 0-5 — indexa el gradiente brand del AvatarInitials. */
  tone: number;
  specialties: string[];
  image?: string;
};

export const featuredCleaners: CleanerPreview[] = [
  {
    id: "sofia-r",
    name: "Sofia Rodríguez",
    hood: "De Pijp",
    rating: 4.9,
    reviews: 142,
    pricePerHour: 24,
    verified: true,
    online: true,
    tone: 0,
    specialties: ["Diepe reiniging", "Strijken", "Ramen"],
    image: "https://i.pravatar.cc/600?img=1",
  },
  {
    id: "maria-g",
    name: "Maria Gonzalez",
    hood: "Oud-West",
    rating: 4.8,
    reviews: 98,
    pricePerHour: 22,
    verified: true,
    online: true,
    tone: 1,
    specialties: ["Wekelijks", "Huisdieren OK", "Eco-producten"],
    image: "https://i.pravatar.cc/600?img=2",
  },
  {
    id: "laura-m",
    name: "Laura Martinez",
    hood: "Jordaan",
    rating: 5.0,
    reviews: 76,
    pricePerHour: 28,
    verified: true,
    online: false,
    tone: 2,
    specialties: ["Premium", "Detail-georiënteerd", "Engels & Nederlands"],
    image: "https://i.pravatar.cc/600?img=3",
  },
  {
    id: "elena-s",
    name: "Elena Sánchez",
    hood: "Oost",
    rating: 4.9,
    reviews: 121,
    pricePerHour: 23,
    verified: true,
    online: true,
    tone: 3,
    specialties: ["Verhuisreiniging", "Strijken", "Wekelijks"],
    image: "https://i.pravatar.cc/600?img=4",
  },
  {
    id: "anna-l",
    name: "Anna López",
    hood: "Centrum",
    rating: 4.7,
    reviews: 64,
    pricePerHour: 21,
    verified: true,
    online: false,
    tone: 4,
    specialties: ["Studentenkamers", "Snel & efficiënt"],
    image: "https://i.pravatar.cc/600?img=5",
  },
  {
    id: "carmen-p",
    name: "Carmen Pérez",
    hood: "Zuid",
    rating: 4.9,
    reviews: 187,
    pricePerHour: 26,
    verified: true,
    online: true,
    tone: 5,
    specialties: ["Premium", "Strijken", "Boodschappen"],
    image: "https://i.pravatar.cc/600?img=6",
  },
  {
    id: "rosa-d",
    name: "Rosa Díaz",
    hood: "Noord",
    rating: 4.8,
    reviews: 89,
    pricePerHour: 22,
    verified: true,
    online: true,
    tone: 0,
    specialties: ["Wekelijks", "Eco-producten", "Engels"],
    image: "https://i.pravatar.cc/600?img=7",
  },
  {
    id: "isabel-h",
    name: "Isabel Hernández",
    hood: "De Pijp",
    rating: 5.0,
    reviews: 53,
    pricePerHour: 25,
    verified: true,
    online: false,
    tone: 2,
    specialties: ["Premium", "Diepe reiniging", "Detail-georiënteerd"],
    image: "https://i.pravatar.cc/600?img=8",
  },
  {
    id: "nadia-k",
    name: "Nadia Karimi",
    hood: "Oost",
    rating: 4.9,
    reviews: 112,
    pricePerHour: 24,
    verified: true,
    online: true,
    tone: 1,
    specialties: ["Wekelijks", "Eco-producten", "Strijken"],
    image: "https://i.pravatar.cc/600?img=9",
  },
  {
    id: "julia-v",
    name: "Julia Visser",
    hood: "Jordaan",
    rating: 4.8,
    reviews: 70,
    pricePerHour: 27,
    verified: true,
    online: false,
    tone: 3,
    specialties: ["Premium", "Ramen", "Detail-georiënteerd"],
    image: "https://i.pravatar.cc/600?img=10",
  },
  {
    id: "fatima-e",
    name: "Fatima El Amrani",
    hood: "Nieuw-West",
    rating: 4.7,
    reviews: 58,
    pricePerHour: 21,
    verified: true,
    online: true,
    tone: 4,
    specialties: ["Wekelijks", "Huisdieren OK", "Snel & efficiënt"],
    image: "https://i.pravatar.cc/600?img=11",
  },
  {
    id: "sophie-d",
    name: "Sophie de Wit",
    hood: "Centrum",
    rating: 5.0,
    reviews: 95,
    pricePerHour: 29,
    verified: true,
    online: true,
    tone: 5,
    specialties: ["Premium", "Verhuisreiniging", "Engels & Nederlands"],
    image: "https://i.pravatar.cc/600?img=12",
  },
];

/** Barrios únicos presentes en la data (para el filtro). */
export const cleanerHoods: string[] = Array.from(
  new Set(featuredCleaners.map((c) => c.hood)),
).sort();

/** Especialidades únicas (para el filtro). */
export const cleanerSpecialties: string[] = Array.from(
  new Set(featuredCleaners.flatMap((c) => c.specialties)),
).sort();

export type SortKey = "rating" | "price-asc" | "price-desc";

/** Filtra + ordena la data en cliente. Reemplazable por query Supabase en Fase 4. */
export function filterCleaners(
  list: CleanerPreview[],
  opts: { hood?: string; specialty?: string; sort?: SortKey },
): CleanerPreview[] {
  const filtered = list.filter(
    (c) =>
      (!opts.hood || c.hood === opts.hood) &&
      (!opts.specialty || c.specialties.includes(opts.specialty)),
  );
  const sorted = [...filtered];
  if (opts.sort === "price-asc") sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
  else if (opts.sort === "price-desc") sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
  else sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  return sorted;
}

/* ============================================================
   Perfil enriquecido — Fase 2 (mock). Fase 4: columnas reales en Supabase.
   La bio queda en holandés (el cleaner la escribe en su idioma; no se
   traduce con la UI — comportamiento realista de marketplace).
   ============================================================ */

export type CleanerProfile = CleanerPreview & {
  bio: string;
  languages: string[];
  since: number;
  responseMins: number;
  /** Stripe Connect — solo perfiles reales; mock los deja undefined. */
  stripeAccountId?: string | null;
  stripeChargesEnabled?: boolean;
};

const cleanerExtra: Record<string, { bio: string; languages: string[]; since: number; responseMins: number }> = {
  "sofia-r": { bio: "Al acht jaar maak ik huizen in De Pijp en omstreken grondig schoon. Ik werk gestructureerd, let op de details die anderen overslaan, en laat je huis achter zoals ik mijn eigen huis wil zien.", languages: ["Nederlands", "Engels", "Spaans"], since: 2018, responseMins: 12 },
  "maria-g": { bio: "Ik hou van een fris huis dat naar schoon ruikt, niet naar bleek. Ik werk met eco-producten, ben goed met huisdieren, en kom graag wekelijks langs.", languages: ["Nederlands", "Engels", "Spaans"], since: 2020, responseMins: 20 },
  "laura-m": { bio: "Detail is mijn handtekening. Plinten, kozijnen, achter de kranen — ik sla niets over. Premium schoonmaak voor wie het verschil ziet.", languages: ["Nederlands", "Engels"], since: 2019, responseMins: 8 },
  "elena-s": { bio: "Verhuizen kan vermoeiend zijn. Ik zorg dat je nieuwe plek er meteen perfect uitziet. Ook voor regelmatige schoonmaak kom ik graag terug.", languages: ["Nederlands", "Engels", "Catalaans"], since: 2017, responseMins: 15 },
  "anna-l": { bio: "Studentenhuis? Geen probleem. Ik werk snel en efficiënt, en je kamer ziet er meteen uit als nieuw.", languages: ["Nederlands", "Engels", "Pools"], since: 2021, responseMins: 25 },
  "carmen-p": { bio: "Luxe is mijn standaard. Ik werk met premium producten, ben voorzichtig met je spullen, en kijk altijd net iets verder dan nodig.", languages: ["Nederlands", "Engels", "Spaans"], since: 2016, responseMins: 10 },
  "rosa-d": { bio: "Ecologisch schoonmaken is mijn passie. Zelfde resultaat, gezonder voor je gezin en voor het milieu.", languages: ["Nederlands", "Engels", "Duits"], since: 2019, responseMins: 18 },
  "isabel-h": { bio: "Premium details in elke hoek. Ramen, spiegels, bronzen, edelstaal — alles glinster als nieuw.", languages: ["Nederlands", "Engels", "Frans"], since: 2018, responseMins: 9 },
  "nadia-k": { bio: "Wekelijks terugkomen betekent continuïteit. Je huis voelt schoon, rustig en welkom met mij in het team.", languages: ["Nederlands", "Engels", "Persisch"], since: 2020, responseMins: 22 },
  "julia-v": { bio: "Ramen en kozijnen zijn mijn specialiteit. Geen strepen, geen sporen — puur helder en schoon.", languages: ["Nederlands", "Engels", "Duits"], since: 2019, responseMins: 11 },
  "fatima-e": { bio: "Snel, efficiënt, betrouwbaar. Ik kom graag wekelijks langs en je huis voelt altijd fris.", languages: ["Nederlands", "Engels", "Frans", "Arabisch"], since: 2021, responseMins: 30 },
  "sophie-d": { bio: "Verhuizen naar Amsterdam? Ik zorg dat je nieuwe huis er zo uit ziet alsof je er al maanden woont.", languages: ["Nederlands", "Engels"], since: 2015, responseMins: 7 },
};

export function getCleanerProfile(id: string): CleanerProfile | null {
  const cleaner = featuredCleaners.find((c) => c.id === id);
  if (!cleaner) return null;

  const extra = cleanerExtra[id] || { bio: "", languages: ["Nederlands", "Engels"], since: new Date().getFullYear() - 2, responseMins: 15 };

  return {
    ...cleaner,
    ...extra,
  };
}

export function cleanerIds(): string[] {
  return featuredCleaners.map((c) => c.id);
}
