/**
 * Mock reviews — Fase 2.
 * Fase 4 reemplaza con `reviews` table joined on `bookings` y `profiles`.
 */

export type ReviewPreview = {
  id: string;
  rating: number;
  quote: string;
  author: string;
  hood: string;
  date: string;
  tone: number;
  image?: string;
};

export const featuredReviews: ReviewPreview[] = [
  {
    id: "r1",
    rating: 5,
    quote:
      "Ik woon hier vier jaar. Voor het eerst voelde een schoonmaak meer aan als een opluchting dan een transactie. Sofia werkt grondig, beleefd, en ze sluit zelf de deur.",
    author: "Anouk T.",
    hood: "De Pijp",
    date: "12 mei 2026",
    tone: 0,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "r2",
    rating: 5,
    quote:
      "Wat me overtuigde: vooraf zien wíe komt. Geen onbekende voor de deur. Maria is precies wie ze in haar profiel zei te zijn — en het huis ruikt nu naar lavendel, niet naar bleek.",
    author: "Pieter van der Berg",
    hood: "Oud-West",
    date: "8 mei 2026",
    tone: 1,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "r3",
    rating: 5,
    quote:
      "We hebben twee huisdieren en eerdere schoonmakers gebruikten producten die hen ziek maakten. Het filter 'eco-producten' was geen marketing — Rosa kwam met haar eigen veilige merk.",
    author: "Sanne K.",
    hood: "Noord",
    date: "3 mei 2026",
    tone: 4,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "r4",
    rating: 5,
    quote:
      "Eerste boeking was voor een verhuisreiniging in een appartement van 70m². Eindfoto's van Elena waren echte foto's, op de minuut bevestigd. De borg kreeg ik dezelfde dag terug.",
    author: "Job M.",
    hood: "Oost",
    date: "29 april 2026",
    tone: 3,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "r5",
    rating: 5,
    quote:
      "Mijn moeder is 78 en wantrouwt platforms. Ze keek mee bij het kiezen. Carmen werd haar favoriete bezoek van de week.",
    author: "Eva D.",
    hood: "Zuid",
    date: "21 april 2026",
    tone: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  },
];
