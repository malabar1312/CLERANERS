"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/app/[locale]/_actions/favorite";
import { cn } from "@/lib/utils";

/**
 * `<FavoriteButton />` — hart-icoon op het profiel van een schoonmaker.
 * Optimistic UI: toggled immediately, confirmed on server response.
 * Als de gebruiker niet is ingelogd → subtiel tonen (unauthenticated).
 */
export function FavoriteButton({
  cleanerId,
  initialFavorited = false,
  variant = "dark",
}: {
  cleanerId: string;
  initialFavorited?: boolean;
  /** `dark` para fondos oscuros, `light` para el perfil blanco. */
  variant?: "light" | "dark";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic update.
    setFavorited((prev) => !prev);
    startTransition(async () => {
      const res = await toggleFavoriteAction(cleanerId);
      if (res.ok) {
        setFavorited(res.favorited);
      } else {
        // Revert on error.
        setFavorited((prev) => !prev);
      }
    });
  }

  const idle =
    variant === "light"
      ? "border-[var(--color-line)] bg-[var(--color-white)] text-[var(--color-muted)] hover:border-red-200 hover:bg-red-50 hover:text-red-400 shadow-sm"
      : "border-[var(--color-dark-line)] bg-[color:rgb(255_255_255/0.06)] text-[var(--color-dark-muted)] hover:border-red-200 hover:bg-red-50/10 hover:text-red-400";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
      aria-pressed={favorited}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all",
        "duration-[var(--dur-base)] ease-[var(--ease-out)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-2",
        "disabled:opacity-50",
        favorited ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100" : idle,
      )}
    >
      <Heart
        className={cn("h-4 w-4 transition-all", favorited && "fill-current")}
        aria-hidden="true"
      />
    </button>
  );
}
