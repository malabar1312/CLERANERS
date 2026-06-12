"use client";

import { useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Star as StarIcon, ShieldCheck, Umbrella, Lock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { SearchBar } from "@/components/ui/search-bar";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";

/* Below lg the hero is natural-flow (video block, zero crop);
   from lg up it's the cinematic sticky cover with scroll-scrubbing. */
const CINEMATIC_BP = 1024;

export function Hero() {
  const t = useTranslations("hero");
  const proofNames = ["Sofia R", "Maria G", "Laura M", "Elena S", "Carmen P"];

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* ── Parallax layers (cinematic / lg+ only — overridden by max-lg classes) ── */
  const textY = useTransform(scrollYProgress, [0, 0.8], [0, -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const textBlur = useTransform(scrollYProgress, [0, 0.45], ["blur(0px)", "blur(8px)"]);
  /* Search outlives the headline — it's the conversion piece */
  const searchY = useTransform(scrollYProgress, [0, 0.65], [0, -40]);
  const searchOpacity = useTransform(scrollYProgress, [0.15, 0.7], [1, 0]);

  /* ── RAF-gated video seeking (cinematic only) ─────── */
  const seekVideo = useCallback((progress: number) => {
    if (typeof window !== "undefined" && window.innerWidth < CINEMATIC_BP) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const v = videoRef.current;
      if (v && v.duration && Number.isFinite(v.duration)) {
        const target = progress * v.duration;
        if (Math.abs(v.currentTime - target) > 0.02) {
          v.currentTime = target;
        }
      }
    });
  }, []);

  useMotionValueEvent(scrollYProgress, "change", seekVideo);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.innerWidth < CINEMATIC_BP) {
      v.play().catch(() => {});
    } else {
      v.currentTime = 0.01;
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-auto bg-[var(--color-dark)] lg:h-[120vh]"
    >
      {/* ── Mobile/tablet: natural flow · Desktop: sticky cinematic viewport ── */}
      <div className="relative min-h-[100svh] w-full overflow-hidden pb-24 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:pb-0">

        {/* Video — <lg: full-width block, ENTIRE frame visible (aspect reserved → no CLS);
            lg+: absolute cover background scrubbed by scroll */}
        <video
          ref={videoRef}
          preload="auto"
          muted
          playsInline
          autoPlay
          loop
          aria-hidden="true"
          className="mt-[calc(var(--nav-h-sm)+0.75rem)] block aspect-video h-auto w-full lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto lg:h-full lg:object-cover"
        >
          <source src="/hero/before-after.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text legibility — cinematic only */}
        <div className="pointer-events-none absolute inset-0 hidden bg-black/35 lg:block" />

        {/* Film Grain — editorial texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* ── Content: headline → search → proof, one continuous stack ── */}
        <Container size="wide" className="relative z-20 w-full pt-8 lg:pt-[calc(var(--nav-h-sm)+1.5rem)]">

          {/* Headline block — parallax + cinematic blur (static <lg) */}
          <motion.div
            style={{ opacity: textOpacity, y: textY, filter: textBlur }}
            className="max-w-2xl max-lg:opacity-100! max-lg:transform-none! max-lg:filter-none!"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="label inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-3.5 py-1.5 text-white backdrop-blur-md shadow-lg"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-blue)]" aria-hidden />
              {t("eyebrow")}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="display mt-5 text-balance text-[length:var(--text-display)] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            >
              {t("titleStart")}
              <span className="text-[var(--color-blue)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{t("titleEmphasis")}</span>
              <br className="hidden sm:block" />
              {t("titleEnd")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mt-4 max-w-lg text-pretty text-lg leading-relaxed text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium"
            >
              {t("lead")}
            </motion.p>
          </motion.div>

          {/* Search — the centerpiece, INSIDE the hero experience.
              id="hero-search" = sentinel del StickySearch (aparece cuando esto sale). */}
          <motion.div
            id="hero-search"
            style={{ opacity: searchOpacity, y: searchY }}
            className="mt-8 max-w-4xl max-lg:opacity-100! max-lg:transform-none! lg:mt-9"
          >
            <SearchBar />

            {/* Proof strip — social + trust in one quiet line under the search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 px-1 text-sm font-medium text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex -space-x-2" aria-hidden>
                  {proofNames.map((n, i) => (
                    <AvatarInitials key={n} name={n} size="sm" tone={i} className="ring-2 ring-black/60" />
                  ))}
                </span>
                <span>
                  <span className="inline-flex items-center gap-1 font-bold text-white">
                    <StarIcon className="h-3.5 w-3.5 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden />
                    4,9
                  </span>{" "}
                  · {t("social")}
                </span>
              </span>
              <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--color-blue)]" aria-hidden />
                {t("trust.verified")}
              </span>
              <span className="flex items-center gap-1.5">
                <Umbrella className="h-4 w-4 text-[var(--color-blue)]" aria-hidden />
                {t("trust.insured")}
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[var(--color-blue)]" aria-hidden />
                {t("trust.escrow")}
              </span>
            </motion.div>
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
