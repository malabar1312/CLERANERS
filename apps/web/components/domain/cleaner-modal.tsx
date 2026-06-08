"use client";

import { useState, useEffect, Suspense, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { X, Star, MapPin, Heart, ShieldCheck, ArrowRight } from "lucide-react";
import { getCleanerProfile, type CleanerProfile } from "@/lib/mock/cleaners";
import { useRouter as useIntlRouter, Link } from "@/i18n/navigation";
import {
  toggleFavoriteAction,
  getFavoriteIdsAction,
} from "@/app/[locale]/_actions/favorite";

/**
 * `<CleanerModal />` — quick-view URL-driven (`?cleanerId=`). Adaptado de
 * Antigravity al sistema cleaners:
 *  - Favoritos REALES (Supabase + RLS) vía Server Actions — no localStorage.
 *  - i18n NL/EN (namespace `cleanerModal`).
 *  - "Direct boeken" + "Bekijk volledig profiel" navegan al perfil completo
 *    (locale-aware), donde vive el BookingFlow.
 *
 * Se monta una vez en el layout; aparece sobre cualquier página que ponga
 * `?cleanerId=` en la URL (landing grid + listado).
 */
function CleanerModalInner() {
  const t = useTranslations("cleanerModal");
  const router = useRouter();
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cleanerId = searchParams.get("cleanerId");
  const [cleaner, setCleaner] = useState<CleanerProfile | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (cleanerId) {
      const profile = getCleanerProfile(cleanerId);
      if (profile) setCleaner(profile);
      // Estado inicial del corazón desde Supabase (RLS-scoped). Degrada a [].
      getFavoriteIdsAction()
        .then((ids) => setIsFavorite(ids.includes(cleanerId)))
        .catch(() => setIsFavorite(false));
    } else {
      // Mantener el contenido durante la animación de salida.
      const id = setTimeout(() => setCleaner(null), 300);
      return () => clearTimeout(id);
    }
  }, [cleanerId]);

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("cleanerId");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggleFavorite = () => {
    if (!cleanerId) return;
    const next = !isFavorite;
    setIsFavorite(next); // optimistic
    startTransition(async () => {
      const res = await toggleFavoriteAction(cleanerId);
      if (res.ok) {
        setIsFavorite(res.favorited);
      } else if (res.error === "unauthenticated") {
        setIsFavorite(false);
        intlRouter.push("/login"); // locale-aware
      } else {
        setIsFavorite(!next); // revert
      }
    });
  };

  return (
    <AnimatePresence>
      {cleanerId && cleaner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-[color:rgb(10_10_10/0.45)] backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label={cleaner.name}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-white)] shadow-2xl sm:flex-row"
          >
            {/* Close */}
            <button
              onClick={close}
              aria-label={t("close")}
              className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[var(--color-ink)] shadow-sm backdrop-blur-md transition-transform hover:scale-110 sm:left-auto sm:right-4"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Favorite (Supabase real) */}
            <button
              onClick={toggleFavorite}
              disabled={isPending}
              aria-label={isFavorite ? t("removeFavorite") : t("addFavorite")}
              aria-pressed={isFavorite}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[var(--color-ink)] shadow-sm backdrop-blur-md transition-transform hover:scale-110 disabled:opacity-60 sm:right-16"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-[var(--color-ink)]"}`}
              />
            </button>

            {/* Image / avatar */}
            <div className="relative h-64 w-full shrink-0 sm:h-auto sm:w-2/5">
              {cleaner.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cleaner.image}
                  alt={cleaner.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-2)] text-5xl font-bold text-[var(--color-muted)]">
                  {cleaner.name.charAt(0)}
                </div>
              )}
              {cleaner.verified && (
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-blue)] shadow-lg">
                  <ShieldCheck className="h-4 w-4" />
                  {t("verified")}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col overflow-y-auto p-6 sm:p-8">
              <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--color-ink)]">
                {cleaner.name}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[var(--color-muted)]">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" />
                  <span className="font-semibold text-[var(--color-ink)]">
                    {cleaner.rating.toFixed(1)}
                  </span>
                  ({cleaner.reviews} {t("reviews")})
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {cleaner.hood}
                </span>
                <span className="font-semibold text-[var(--color-ink)]">
                  €{cleaner.pricePerHour}
                  {t("perHour")}
                </span>
              </div>

              <p className="mt-6 line-clamp-4 text-base leading-relaxed text-[var(--color-slate)]">
                {cleaner.bio}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {cleaner.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--color-slate)]"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
                <Link
                  href={`/schoonmakers/${cleaner.id}`}
                  onClick={close}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-white)] py-4 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
                >
                  {t("viewFullProfile")}
                </Link>
                <Link
                  href={`/schoonmakers/${cleaner.id}`}
                  onClick={close}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-blue)] py-4 text-sm font-bold text-white shadow-[var(--shadow-blue)] transition-all hover:bg-[var(--color-blue-2)]"
                >
                  {t("bookNow")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function CleanerModal() {
  return (
    <Suspense fallback={null}>
      <CleanerModalInner />
    </Suspense>
  );
}
