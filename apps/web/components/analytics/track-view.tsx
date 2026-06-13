"use client";

import { useEffect } from "react";
import { trackCleanerView, trackBookingSuccess } from "@/lib/analytics";

/** Fire-and-forget cleaner_view event. Mount once per profile page. */
export function TrackCleanerView({ cleanerId }: { cleanerId: string }) {
  useEffect(() => {
    trackCleanerView(cleanerId);
  }, [cleanerId]);
  return null;
}

/**
 * Conversión final del funnel. Se monta en /booking/success SOLO cuando el
 * pago está confirmado (server lo decide) → dispara booking_success una vez.
 */
export function TrackBookingSuccess({ totalCents }: { totalCents: number }) {
  useEffect(() => {
    trackBookingSuccess(totalCents);
  }, [totalCents]);
  return null;
}
