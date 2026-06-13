/**
 * Cleaner services — capa de datos de la agenda del cleaner.
 *
 * Deriva del shape REAL de las aanvragen (bookings asignadas al cleaner que
 * llegan en `dashboard/page.tsx`). Ya NO hay mock: un cleaner sin aanvragen
 * tiene la agenda vacía (dashboard a 0, como un usuario real).
 *
 * `CleanerService` es el tipo canónico que consumen calendar-view, overview y
 * service-modal. El rating del cliente aún no existe en la plataforma → 0
 * (los componentes lo ocultan cuando reviews === 0, nunca inventan estrellas).
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

/** Aanvraag mínima necesaria para construir un `CleanerService`. */
type AanvraagLike = {
  id: string;
  clientName: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  hours: number | null;
  amountCents: number | null;
  status: string;
  city: string | null;
};

/** Status de aanvragen que ocupan la agenda del cleaner (lo que debe hacer). */
const AGENDA_STATUSES = new Set(["paid", "accepted", "in_progress", "completed"]);

const SLOT_RANGE: Record<string, string> = {
  morning: "08:00 - 12:00",
  afternoon: "12:00 - 17:00",
  evening: "17:00 - 20:00",
};

function formatEurCents(cents: number | null): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
}

/**
 * Mapea las aanvragen reales del cleaner a servicios de agenda. Filtra las que
 * no ocupan agenda (pending/rejected/canceled/refunded). Sin aanvragen → [].
 */
export function aanvragenToServices(aanvragen: AanvraagLike[]): CleanerService[] {
  return aanvragen
    .filter((a) => AGENDA_STATUSES.has(a.status) && a.scheduledDate)
    .map((a) => {
      const date = new Date(`${a.scheduledDate}T00:00:00`);
      return {
        id: a.id,
        date,
        client: { name: a.clientName, rating: 0, reviews: 0 },
        type: a.hours ? `Schoonmaak · ${a.hours} uur` : "Schoonmaak",
        time: SLOT_RANGE[a.scheduledTime ?? ""] ?? "—",
        address: a.city ?? "Amsterdam",
        price: formatEurCents(a.amountCents),
      };
    });
}
