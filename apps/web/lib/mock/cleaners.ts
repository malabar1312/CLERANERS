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
  },
];
