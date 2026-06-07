"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Star as StarIcon, ShieldCheck, Umbrella, Lock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { HeroWaitlist } from "./hero-waitlist";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "motion/react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * `<Hero />` — STITCH Quiet-Luxury + Scroll-triggered Video
 *
 * Performance optimizations:
 * 1. H.264 MP4 all-keyframe → hardware-decoded seeking on all devices
 * 2. requestAnimationFrame-gated seeking → max 1 seek per paint frame
 * 3. 135vh scroll container → less travel for 8s video = higher fidelity
 * 4. useSpring for smooth visual interpolation
 * ────────────────────────────────────────────────────────── */
export function Hero() {
  const t = useTranslations("hero");
  const proofNames = ["Sofia R", "Maria G", "Laura M", "Elena S", "Carmen P"];

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const [isFocused, setIsFocused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* ── Parallax layers ─────────────────────────────────── */
  const textY = useTransform(scrollYProgress, [0, 0.8], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textBlur = useTransform(scrollYProgress, [0, 0.45], ["blur(0px)", "blur(8px)"]);
  const badgesY = useTransform(scrollYProgress, [0, 0.45], [0, -30]);

  /* ── SVG progress ring ───────────────────────────────── */
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 90 });
  const ringOffset = useTransform(smoothProgress, [0, 1], [100.53, 0]);

  /* ── RAF-gated video seeking ─────────────────────────── */
  const seekVideo = useCallback((progress: number) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const v = videoRef.current;
      if (v && v.duration && Number.isFinite(v.duration)) {
        const target = progress * v.duration;
        // Only seek if distance is meaningful (avoids micro-stutters)
        if (Math.abs(v.currentTime - target) > 0.02) {
          v.currentTime = target;
        }
      }
    });
  }, []);

  useMotionValueEvent(scrollYProgress, "change", seekVideo);

  // Initial video load stabilization
  useEffect(() => {
    const unsub = scrollYProgress.on("change", seekVideo);
    if (videoRef.current) {
      videoRef.current.currentTime = 0.01;
    }
    return () => {
      unsub();
      cancelAnimationFrame(rafRef.current);
    };
  }, [scrollYProgress, seekVideo]);

  return (
    <section ref={containerRef} className="relative h-[135vh] bg-[var(--color-dark)]">

      {/* ── Sticky viewport ─────────────────────────────── */}
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">

        {/* Video — H.264 MP4 primary (hw-decoded) */}
        <video
          ref={videoRef}
          preload="auto"
          muted
          playsInline
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out",
            isFocused ? "blur-xl brightness-50 scale-[1.03]" : "blur-0 brightness-100 scale-100",
          )}
        >
          <source src="/hero/before-after.mp4" type="video/mp4" />
        </video>

        {/* Film Grain — editorial texture (muy sutil) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* ── Content ───────────────────────────────────── */}
        <Container size="wide" className="relative z-20 w-full pt-[calc(var(--nav-h-sm)+2.5rem)]">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-16">

            {/* ── Left column ────────────────────────────── */}
            <div className="max-w-xl">

              {/* Headline block — parallax + cinematic blur */}
              <motion.div
                style={{ opacity: textOpacity, y: textY, filter: textBlur }}
                className={cn("transition-opacity duration-500", isFocused ? "opacity-30" : "opacity-100")}
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

              {/* Waitlist form — stays above focus blur */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="relative z-30 mt-8"
              >
                <motion.div style={{ opacity: textOpacity, y: badgesY }}>
                  <HeroWaitlist
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </motion.div>
              </motion.div>

              {/* Trust bar — magnetic badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                <motion.ul
                  style={{ opacity: textOpacity, y: badgesY }}
                  className={cn(
                    "mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 transition-opacity duration-500",
                    isFocused ? "opacity-30" : "opacity-100",
                  )}
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
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.div
                  style={{ opacity: textOpacity, y: badgesY }}
                  className={cn(
                    "mt-8 flex items-center gap-3 transition-opacity duration-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
                    isFocused ? "opacity-30" : "opacity-100",
                  )}
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

            {/* ── Right column: scroll CTA + progress ring ─ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="hidden lg:flex"
            >
              <motion.div
                style={{ opacity: textOpacity, y: badgesY }}
                className={cn(
                  "flex flex-col items-end justify-center transition-opacity duration-500",
                  isFocused ? "opacity-0" : "opacity-100",
                )}
              >
              <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-black/40 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                {/* Progress ring */}
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="2" />
                    <motion.circle
                      cx="18" cy="18" r="16" fill="none"
                      className="stroke-[var(--color-blue)]"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="100.53"
                      style={{ strokeDashoffset: ringOffset }}
                    />
                  </svg>
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="h-1 w-1 rounded-full bg-white"
                  />
                </div>
                <p className="text-sm font-medium text-white/80">
                  Scroll para ver la<br />
                  <span className="font-bold text-white">transformación</span>
                </p>
              </div>
              </motion.div>
            </motion.div>

          </div>
        </Container>
      </div>
    </section>
  );
}
