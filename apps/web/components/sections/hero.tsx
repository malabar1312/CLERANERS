import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ShieldCheck, Lock, Star as StarIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Star } from "@/components/brand/star";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { HeroSearch } from "./hero-search";

/**
 * `<Hero />` — primera pantalla. Navy con mesh + dot grid, título editorial
 * (palabra `kiest` en gradient italic), search bar, trust badges y prueba
 * social. Termina con un sentinel invisible que el sticky-CTA observa.
 *
 * Server Component. La búsqueda (`<HeroSearch />`) es un island cliente que
 * hace scroll a la grid de schoonmakers (no navega — locale-safe, sin 404).
 */
export async function Hero() {
  const t = await getTranslations("hero");
  const proofNames = ["Sofia R", "Maria G", "Laura M", "Elena S", "Carmen P"];

  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-navy)] text-white">
      {/* Mesh glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-hero-mesh opacity-90" />
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-dots-light opacity-50 [mask-image:radial-gradient(70%_60%_at_50%_30%,#000_0%,transparent_75%)]"
      />

      <Container size="wide">
        <div className="mx-auto flex max-w-3xl flex-col items-center pt-32 pb-20 text-center sm:pt-40 sm:pb-28">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur">
            <Star className="h-3.5 w-3.5 text-[var(--color-blue-light)]" />
            {t("eyebrow")}
          </span>

          {/* Title — editorial split */}
          <h1 className="font-display mt-7 text-balance leading-[1.04] tracking-[var(--text-tracking-display)] text-[length:var(--text-display-1)]">
            {t("titleStart")}
            <em className="text-gradient-light not-italic font-display italic">{t("titleEmphasis")}</em>
            {t("titleEnd")}
          </h1>

          {/* Lead */}
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/75 sm:text-xl">
            {t("lead")}
          </p>

          {/* Search bar */}
          <HeroSearch />

          {/* Secondary CTA */}
          <div className="mt-5">
            <Link
              href="/voor-schoonmakers"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/70 underline-offset-4 transition hover:text-white"
            >
              {t("ctaSecondary")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Trust badges */}
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/65">
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-blue-light)]" aria-hidden="true" />
              {t("trust.verified")}
            </li>
            <li className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-[var(--color-blue-light)]" aria-hidden="true" />
              {t("trust.escrow")}
            </li>
            <li className="inline-flex items-center gap-2">
              <StarIcon className="h-4 w-4 fill-[var(--color-warning)] text-[var(--color-warning)]" aria-hidden="true" />
              {t("trust.rating")}
            </li>
          </ul>

          {/* Social proof */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-3" aria-hidden="true">
              {proofNames.map((n, i) => (
                <AvatarInitials key={n} name={n} size="sm" tone={i} className="ring-2 ring-[var(--color-navy)]" />
              ))}
            </div>
            <p className="text-sm text-white/60">{t("social")}</p>
          </div>
        </div>
      </Container>

      {/* Sentinel for sticky CTA observer */}
      <div id="hero-end-sentinel" aria-hidden="true" className="h-px w-full" />
    </section>
  );
}
