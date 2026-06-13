import { notFound } from "next/navigation";

/**
 * Catch-all de menor prioridad: cualquier URL dentro de [locale] que no matchee
 * una ruta real cae aquí y dispara el `not-found.tsx` de marca del locale (en
 * vez del 404 global feo de Next). Las rutas específicas siempre ganan al
 * catch-all, así que esto no intercepta nada existente.
 */
export default function CatchAllNotFound() {
  notFound();
}
