"use client";

import { useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Star as StarIcon, ShieldCheck, Umbrella, Lock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";

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

  /* ── Parallax layers (desktop scroll-triggered) ───── */
  const textY = useTransform(scrollYProgress, [0, 0.8], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textBlur = useTransform(scrollYProgress, [0, 0.45], ["blur(0px)", "blur(8px)"]);
  const badgesY = useTransform(scrollYProgress, [0, 0.45], [0, -30]);

  /* ── RAF-gated video seeking (desktop only) ─────── */
  const seekVideo = useCallback((progress: number) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
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
    if (window.innerWidth < 768) {
      v.play().catch(() => {});
    } else {
      v.currentTime = 0.01;
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-auto bg-[var(--color-dark)] md:h-[120vh]"
    >
      {/* ── Mobile: natural flow (video block + text) · Desktop: sticky cover viewport ── */}
      <div className="relative min-h-[100svh] w-full overflow-hidden pb-32 md:sticky md:top-0 md:flex md:h-screen md:items-center md:pb-0">

        {/* Video — mobile: full-width block showing the ENTIRE frame (no crop);
            desktop: absolute cover background driven by scroll */}
        <video
          ref={videoRef}
          preload="auto"
          muted
          playsInline
          autoPlay
          loop
          className="mt-[calc(var(--nav-h-sm)+0.75rem)] block h-auto w-full md:absolute md:inset-0 md:mt-0 md:h-full md:object-cover"
        >
          <source src="/hero/before-after.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text legibility — desktop only (mobile text sits on solid dark bg) */}
        <div className="pointer-events-none absolute inset-0 hidden bg-black/30 md:block" />

        {/* Film Grain — editorial texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* ── Content ───────────────────────────────── */}
        <Container size="wide" className="relative z-20 w-full pt-10 md:pt-[calc(var(--nav-h-sm)+2.5rem)]">
          <div className="max-w-xl">

            {/* Headline block — parallax + cinematic blur (desktop only; static on mobile) */}
            <motion.div
              style={{ opacity: textOpacity, y: textY, filter: textBlur }}
              className="max-md:opacity-100! max-md:transform-none! max-md:filter-none!"
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
                className="display mt-6 text-balance text-[length:var(--text-display)] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
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
                className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium"
              >
                {t("lead")}
              </motion.p>
            </motion.div>

            {/* Trust bar — magnetic badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <motion.ul
                style={{ opacity: textOpacity, y: badgesY }}
                className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 max-md:opacity-100! max-md:transform-none!"
              >
                <MagneticWrapper>
                  <li className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-white transition-colors hover:bg-black/20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                    <ShieldCheck className="h-5 w-5 text-[var(--color-blue)]" aria-hidden />
                    {t("trust.verified")}
                  </li>
                </MagneticWrapper>
                <MagneticWrapper>
                  <li className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-white transition-colors hover:bg-black/20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                    <Umbrella className="h-5 w-5 text-[var(--color-blue)]" aria-hidden />
                    {t("trust.insured")}
                  </li>
                </MagneticWrapper>
                <MagneticWrapper>
                  <li className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-white transition-colors hover:bg-black/20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                    <Lock className="h-5 w-5 text-[var(--color-blue)]" aria-hidden />
                    {t("trust.escrow")}
                  </li>
                </MagneticWrapper>
              </motion.ul>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div
                style={{ opacity: textOpacity, y: badgesY }}
                className="mt-8 flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-md:opacity-100! max-md:transform-none!"
              >
                <div className="flex -space-x-2.5" aria-hidden>
                  {proofNames.map((n, i) => (
                    <AvatarInitials key={n} name={n} size="sm" tone={i} className="ring-2 ring-black" />
                  ))}
                </div>
                <p className="text-sm font-medium text-white/90">
                  <span className="inline-flex items-center gap-1 font-bold text-white">
                    <StarIcon className="h-3.5 w-3.5 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden />
                    4,9
                  </span>{" "}
                  · {t("social")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* Gradient transition dark → white (covers the scroll overshoot area) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-b from-transparent via-white/80 to-white md:h-[25vh]" />
    </section>
  );
}
