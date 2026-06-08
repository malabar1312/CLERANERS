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
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1bf366?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800", // Man
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
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800", // Woman
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
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800", // Man
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
};

const cleanerExtra: Record<string, { bio: string; languages: string[]; since: number; responseMins: number }> = {
  "sofia-r": { bio: "Al acht jaar maak ik huizen in De Pijp en omstreken grondig schoon. Ik werk gestructureerd, let op de details die anderen overslaan, en laat je huis achter zoals ik mijn eigen huis wil zien.", languages: ["Nederlands", "Engels", "Spaans"], since: 2018, responseMins: 12 },
  "maria-g": { bio: "Ik hou van een fris huis dat naar schoon ruikt, niet naar bleek. Ik werk met eco-producten, ben goed met huisdieren, en kom graag wekelijks langs.", languages: ["Nederlands", "Engels", "Spaans"], since: 2020, responseMins: 20 },
  "laura-m": { bio: "Detail is mijn handtekening. Plinten, kozijnen, achter de kranen — ik sla niets over. Premium schoonmaak voor wie het verschil ziet.", languages: ["Nederlands", "Engels"], since: 2019, responseMins: 8 },
  "elena-s": { bio: "Verhuizing, wekelijkse beurt of een grote voorjaarsschoonmaak: ik pak het systematisch aan en lever foto's op bij oplevering.", languages: ["Nederlands", "Engels", "Spaans"], since: 2017, responseMins: 15 },
  "anna-l": { bio: "Snel, efficiënt en betrouwbaar. Ideaal voor studentenkamers en kleine appartementen die tussendoor een goede beurt nodig hebben.", languages: ["Nederlands", "Engels"], since: 2022, responseMins: 25 },
  "carmen-p": { bio: "Bijna 200 schoonmaken later weet ik precies hoe ik een huis laat stralen. Ik strijk, doe boodschappen en denk met je mee.", languages: ["Nederlands", "Engels", "Spaans"], since: 2016, responseMins: 10 },
  "rosa-d": { bio: "Eco-producten, vaste tijden en een vriendelijk gezicht aan de deur. Ik kom graag elke week en spreek Nederlands en Engels.", languages: ["Nederlands", "Engels"], since: 2021, responseMins: 18 },
  "isabel-h": { bio: "Premium, grondig en oog voor detail. Ik werk voor mensen die hun huis met zorg behandeld willen zien.", languages: ["Nederlands", "Engels", "Spaans"], since: 2020, responseMins: 14 },
  "nadia-k": { bio: "Vaste klanten, vaste kwaliteit. Ik werk met eco-producten en zorg dat je elke week thuiskomt in een fris huis.", languages: ["Nederlands", "Engels"], since: 2019, responseMins: 16 },
  "julia-v": { bio: "Ramen die echt helder zijn en hoeken die echt schoon zijn. Premium werk met aandacht voor het detail.", languages: ["Nederlands", "Engels"], since: 2021, responseMins: 22 },
  "fatima-e": { bio: "Snel en grondig, ook met huisdieren in huis. Ik maak er geen probleem van — ik maak het gewoon schoon.", languages: ["Nederlands", "Engels"], since: 2022, responseMins: 19 },
  "sophie-d": { bio: "Van verhuisreiniging tot premium wekelijkse beurt. Ik werk tweetalig en lever altijd op zoals afgesproken.", languages: ["Nederlands", "Engels"], since: 2018, responseMins: 9 },
};

export function getCleanerById(id: string): CleanerPreview | undefined {
  return featuredCleaners.find((c) => c.id === id);
}

export function getCleanerProfile(id: string): CleanerProfile | undefined {
  const base = getCleanerById(id);
  if (!base) return undefined;
  const ex =
    cleanerExtra[id] ?? {
      bio: "Geverifieerde schoonmaker op het cleaners-platform.",
      languages: ["Nederlands", "Engels"],
      since: 2022,
      responseMins: 20,
    };
  return { ...base, ...ex };
}

export function cleanerIds(): string[] {
  return featuredCleaners.map((c) => c.id);
}
