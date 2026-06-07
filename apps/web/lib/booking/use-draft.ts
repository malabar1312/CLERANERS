"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Draft saving del booking modal en `localStorage` (AUTO-CYCLE 7).
 *
 * Una key por cleaner. Expira a las 24h. Restore opcional — si el draft
 * existe y no expiró, se hidrata el state. Clear manual tras success.
 *
 * No usa cookies → no impacta SSR ni el banner GDPR (localStorage no requiere
 * consent en NL para functional storage del propio sitio).
 */

const KEY_PREFIX = "cleaners.booking.draft.";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

export interface BookingDraft {
  m2: number;
  frequency: "once" | "weekly" | "biweekly";
  date: string;
  time: "" | "morning" | "afternoon" | "evening";
  street: string;
  postcode: string;
  city: string;
  notes: string;
  name: string;
  email: string;
  /** Timestamp ms del último update — para expiry check. */
  _updatedAt: number;
}

function storageKey(cleanerId: string) {
  return `${KEY_PREFIX}${cleanerId}`;
}

/** Lee el draft de localStorage si existe y no expiró. */
export function readDraft(cleanerId: string): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(cleanerId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BookingDraft>;
    if (!parsed._updatedAt || Date.now() - parsed._updatedAt > EXPIRY_MS) {
      window.localStorage.removeItem(storageKey(cleanerId));
      return null;
    }
    return parsed as BookingDraft;
  } catch {
    return null;
  }
}

/** Borra el draft (tras success o cancel explícito). */
export function clearDraft(cleanerId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(cleanerId));
  } catch {
    /* swallow */
  }
}

/**
 * Persiste `draft` en localStorage cada vez que cambia. Debounced 400ms
 * para no saturar storage con cada keystroke.
 */
export function useDraftPersist(
  cleanerId: string,
  draft: Omit<BookingDraft, "_updatedAt">,
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const toStore: BookingDraft = { ...draft, _updatedAt: Date.now() };
        window.localStorage.setItem(storageKey(cleanerId), JSON.stringify(toStore));
      } catch {
        /* localStorage may be full / disabled — fail silently */
      }
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    cleanerId,
    draft,
  ]);
}

/**
 * Hook helper: hidrata el state inicial desde localStorage si hay draft, sino
 * usa el `initial`. Solo ejecuta UNA vez al mount (no se re-hidrata).
 */
export function useDraftInitial<T extends Omit<BookingDraft, "_updatedAt">>(
  cleanerId: string,
  initial: T,
): [T, boolean] {
  const [state] = useState<{ value: T; restored: boolean }>(() => {
    const draft = readDraft(cleanerId);
    if (!draft) return { value: initial, restored: false };
    // Solo tomamos las claves que existen en `initial` (evita basura legacy).
    const merged = { ...initial };
    for (const k of Object.keys(initial) as Array<keyof T>) {
      const v = (draft as unknown as Record<string, unknown>)[k as string];
      if (v !== undefined) (merged as Record<string, unknown>)[k as string] = v;
    }
    return { value: merged, restored: true };
  });
  return [state.value, state.restored];
}
