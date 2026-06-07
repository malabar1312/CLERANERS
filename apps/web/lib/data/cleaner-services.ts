/**
 * Cleaner services — data layer híbrido (mock ↔ real).
 *
 * Mientras no hay `cleaner_profiles` (Bloque 2), el `cleaner_id` en `bookings`
 * sigue siendo el slug del mock ("sofia-r"). Esta capa hace dos cosas:
 *   1. Define el tipo canónico `CleanerService` que consumen los componentes
 *      del cleaner dashboard (calendar-view, earnings-view, service-modal).
 *   2. Provee `getMockServicesForCleaner()` (BETA fallback) y la firma de
 *      `getCleanerServicesFromDb()` para cuando tengamos cleaner real.
 *
 * Los componentes consumen `CleanerService` — no importan de `mock/*`. Cuando
 * el origen cambie de mock → Supabase, los componentes no se tocan.
 */

export interface CleanerService {
  id: string;
  date: Date;
  client: { name: string; rating: number; reviews: number };
  type: string;
  time: string;
  address: string;
  notes?: string;
  price: string;
}

/** Mock data preservado de la versión inline. BETA fallback. */
export function getMockServicesForCleaner(): CleanerService[] {
  const today = new Date();
  const d2 = new Date(today);
  d2.setDate(today.getDate() + 3);
  const d3 = new Date(today);
  d3.setDate(today.getDate() + 5);

  return [
    {
      id: "SRV-001",
      date: today,
      client: { name: "Anna K.", rating: 4.9, reviews: 14 },
      type: "Dieptereiniging",
      time: "14:00 - 18:00",
      address: "De Pijp, Ferdinand Bolstraat 12",
      notes: "Kat in huis — voorzichtig in de gang. Sleutels onder de mat.",
      price: "€85,00",
    },
    {
      id: "SRV-002",
      date: today,
      client: { name: "Jeroen B.", rating: 5.0, reviews: 3 },
      type: "Onderhoud",
      time: "18:30 - 20:30",
      address: "Jordaan",
      notes: "Voorzichtig met planten bij het water geven.",
      price: "€45,00",
    },
    {
      id: "SRV-003",
      date: d2,
      client: { name: "Bedrijf XYZ", rating: 4.8, reviews: 42 },
      type: "Kantoor Schoonmaak",
      time: "07:00 - 11:00",
      address: "Zuidas Business Center",
      notes: "Alarmcode 4321. Vergaderruimte eerst.",
      price: "€120,00",
    },
    {
      id: "SRV-004",
      date: d3,
      client: { name: "Lisa M.", rating: 4.5, reviews: 8 },
      type: "Na-Verbouwing",
      time: "09:00 - 15:00",
      address: "Oud-West",
      notes: "Veel verf op de vloer. Speciaal oplosmiddel in de badkamer.",
      price: "€180,00",
    },
  ];
}
