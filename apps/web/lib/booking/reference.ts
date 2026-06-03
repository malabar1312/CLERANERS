/**
 * Referencia de reserva legible y estable: `BK-XXXXXXXX`.
 *
 * Deriva de los últimos 8 caracteres del payment_intent (o del session id como
 * fallback), en mayúsculas. La usan la success page (para mostrar) y el webhook
 * (para persistir) → la referencia que ve el cliente coincide con la guardada
 * en `bookings`.
 */
export function bookingReference(idForRef: string): string {
  return `BK-${idForRef.slice(-8).toUpperCase()}`;
}
