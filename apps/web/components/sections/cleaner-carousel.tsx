"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star as StarIcon,
  BadgeCheck,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/section";
import { buttonStyles } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import type { CleanerPreview } from "@/lib/mock/cleaners";

/* ─────────────────────────────────────────────────────────
 * `<CleanerCarousel />` — Responsive cleaners showcase.
 *
 * MOBILE (<lg): 3D perspective carousel with swipe, auto-rotate, dots.
 * DESKTOP (lg+): Premium 4-column grid — Airbnb/Stripe-grade card layout.
 *
 * Design: Stitch Quiet-Luxury tokens. Rounded-2xl cards,
 * ambient shadows, blue accents.
 * ────────────────────────────────────────────────────────── */

/* ─── Shared Card Component ─────────────────────────────── */
function CleanerCard({
  cleaner,
  labels,
  variant = "carousel",
}: {
  cleaner: CleanerPreview;
  labels: { verified: string; perHour: string; reviewsWord: string };
  variant?: "carousel" | "grid";
}) {
  const isGrid = variant === "grid";

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-white ring-1 ring-black/[0.06]",
        isGrid
          ? "rounded-2xl shadow-[var(--shadow-soft)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1"
          : "rounded-3xl shadow-[var(--shadow-ambient)]",
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-[var(--color-surface-2)]",
          isGrid ? "aspect-[3/4]" : "aspect-[3/4]",
        )}
      >
        {cleaner.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cleaner.image}
            alt={cleaner.name}
            className={cn(
              "h-full w-full object-cover",
              isGrid && "transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-105",
            )}
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-5xl font-bold text-white"
            style={{
              background: `linear-gradient(135deg, var(--color-blue), #0050cc)`,
            }}
          >
            {cleaner.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        )}

        {/* Verified badge overlay */}
        {cleaner.verified && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)] shadow-sm backdrop-blur-sm">
            <BadgeCheck className="h-3.5 w-3.5 text-[var(--color-blue)]" />
            {labels.verified}
          </span>
        )}

        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Name + Location on image */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-lg font-bold text-white drop-shadow-md">
            {cleaner.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-3.5 w-3.5" />
            {cleaner.hood}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarIcon className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" />
            <span className="text-sm font-bold text-[var(--color-ink)]">
              {cleaner.rating.toFixed(1)}
            </span>
            <span className="text-sm text-[var(--color-muted)]">
              ({cleaner.reviews})
            </span>
          </div>
          <p className="text-[var(--color-ink)]">
            <span className="text-lg font-bold">&euro;{cleaner.pricePerHour}</span>
            <span className="text-xs text-[var(--color-muted)]">
              {labels.perHour}
            </span>
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {cleaner.specialties.slice(0, 2).map((s) => (
            <span
              key={s}
              className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-slate)]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop Grid ──────────────────────────────────────── */
function DesktopGrid({
  cleaners,
  labels,
}: {
  cleaners: CleanerPreview[];
  labels: { verified: string; perHour: string; viewProfile: string; reviewsWord: string };
}) {
  return (
    <div className="mt-12 hidden lg:grid lg:grid-cols-4 gap-6">
      {cleaners.slice(0, 8).map((cleaner) => (
        <Link
          key={cleaner.id}
          href={`/schoonmakers/${cleaner.id}` as `/schoonmakers/${string}`}
          className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-2 rounded-2xl"
        >
          <CleanerCard cleaner={cleaner} labels={labels} variant="grid" />
        </Link>
      ))}
    </div>
  );
}

/* ─── Mobile Carousel ───────────────────────────────────── */
function MobileCarousel({
  cleaners,
  labels,
}: {
  cleaners: CleanerPreview[];
  labels: { verified: string; perHour: string; viewProfile: string; reviewsWord: string };
}) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<number | null>(null);
  const total = cleaners.length;

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + total) % total);
  }, [total]);

  /* Auto-rotate */
  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  /* Touch swipe */
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) touchStart.current = touch.clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const diff = touchStart.current - touch.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { next(); } else { prev(); }
    }
    touchStart.current = null;
  };

  return (
    <div className="mt-8 overflow-hidden lg:hidden">
      {/* Carousel viewport — explicit overflow clip for 3D transforms */}
      <div
        className="relative mx-auto h-[420px] w-full max-w-3xl overflow-hidden sm:h-[480px]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ perspective: "1200px" }}
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
          {cleaners.map((cleaner, index) => {
            const offset = index - current;
            let pos = ((offset % total) + total) % total;
            if (pos > Math.floor(total / 2)) pos -= total;

            const isCenter = pos === 0;
            const isAdjacent = Math.abs(pos) === 1;
            const isVisible = Math.abs(pos) <= 1;

            return (
              <div
                key={cleaner.id}
                className="absolute w-[220px] sm:w-[260px] transition-all duration-500 ease-[var(--ease-out)]"
                style={{
                  transform: `
                    translateX(${pos * 55}%)
                    scale(${isCenter ? 1 : isAdjacent ? 0.82 : 0.65})
                    rotateY(${pos * -8}deg)
                  `,
                  zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                  opacity: isCenter ? 1 : isAdjacent ? 0.5 : 0,
                  filter: isCenter ? "none" : "blur(3px)",
                  visibility: isVisible ? "visible" : "hidden",
                  pointerEvents: isCenter ? "auto" : "none",
                }}
              >
                {isCenter ? (
                  <Link
                    href={`/schoonmakers/${cleaner.id}` as `/schoonmakers/${string}`}
                    className="block h-full rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-2"
                  >
                    <CleanerCard cleaner={cleaner} labels={labels} variant="carousel" />
                  </Link>
                ) : (
                  <CleanerCard cleaner={cleaner} labels={labels} variant="carousel" />
                )}
              </div>
            );
          })}
        </div>

        {/* Nav buttons */}
        <button
          type="button"
          onClick={prev}
          aria-label="Vorige"
          className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-line)] bg-white/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:left-2"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-ink)]" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Volgende"
          className="absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-line)] bg-white/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:right-2"
        >
          <ChevronRight className="h-5 w-5 text-[var(--color-ink)]" />
        </button>

        {/* Dots */}
        <div className="absolute -bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {cleaners.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={c.name}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current
                  ? "w-6 bg-[var(--color-blue)]"
                  : "w-1.5 bg-[var(--color-muted-2)]",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Export ────────────────────────────────────────── */
export function CleanerCarousel({
  cleaners,
  labels,
}: {
  cleaners: CleanerPreview[];
  labels: {
    verified: string;
    perHour: string;
    reviewsWord: string;
    viewProfile: string;
    eyebrow: string;
    title: string;
    lead: string;
    browseAll: string;
  };
}) {
  return (
    <Section
      id="schoonmakers"
      variant="white"
      containerSize="wide"
      kicker={labels.eyebrow}
      title={labels.title}
      lead={labels.lead}
    >
      {/* Desktop: premium 4-column grid */}
      <DesktopGrid cleaners={cleaners} labels={labels} />

      {/* Mobile: 3D perspective carousel */}
      <MobileCarousel cleaners={cleaners} labels={labels} />

      <div className="mt-14 flex justify-center">
        <Link
          href="/schoonmakers"
          className={buttonStyles({ variant: "secondary", size: "lg" })}
        >
          {labels.browseAll}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </Section>
  );
}
