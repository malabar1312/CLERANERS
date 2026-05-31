import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowDown, ShieldCheck, Lock, Star as StarIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { HeroSearch } from "./hero-search";

/**
 * `<Hero />` — NOIR EDITORIAL. Negro absoluto, grano de película, frame de
 * lookbook (hairlines + meta), titular GIGANTE en Anton mayúsculas con
 * `KIEST` en lima ácida. La búsqueda es un island cliente (scroll a la grid).
 */
export async function Hero() {
  const t = await getTranslations("hero");
  const proofNames = ["Sofia R", "Maria G", "Laura M", "Elena S", "Carmen P"];

  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[var(--color-noir)] text-[var(--color-ivory)]">
      {/* Film grain */}
      <div aria-hidden="true" className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.12] mix-blend-screen" />
      {/* Acid bleed top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 -z-10 h-[36rem] w-[36rem] rounded-full opacity-[0.10] blur-3xl"
        style={{ background: "radial-gradient(circle, #d4ff3f 0%, transparent 70%)" }}
      />

      {/* Top editorial frame */}
      <Container size="wide">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] py-4 pt-[calc(var(--nav-h-sm)+1.25rem)]">
          <span className="kicker text-[var(--color-ivory-dim)]">{t("eyebrow")}</span>
          <span className="kicker hidden text-[var(--color-ivory-dim)] sm:block" translate="no">
            EST. 2026 — NL
          </span>
        </div>
      </Container>

      {/* Center stage */}
      <Container size="wide" className="flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[var(--color-acid)]" aria-hidden="true" />
          <span className="kicker text-[var(--color-acid)]">{t("eyebrowShort")}</span>
        </div>

        {/* Giant headline */}
        <h1 className="headline mt-7 max-w-[16ch] text-balance text-[length:var(--text-hero)]">
          {t("titleStart")}
          <span className="text-[var(--color-acid)]">{t("titleEmphasis")}</span>
          {t("titleEnd")}
        </h1>

        {/* Lead */}
        <p className="measure-short mt-8 text-pretty text-lg leading-relaxed text-[var(--color-ivory-2)] sm:text-xl">
          {t("lead")}
        </p>

        {/* Search */}
        <HeroSearch />

        {/* Secondary */}
        <Link
          href="/voor-schoonmakers"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ivory-dim)] underline-offset-4 transition hover:text-[var(--color-ivory)]"
        >
          {t("ctaSecondary")}
        </Link>

        {/* Trust + social proof */}
        <div className="mt-14 flex flex-col items-center gap-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <li className="kicker flex items-center gap-2 text-[var(--color-ivory-dim)]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-acid)]" aria-hidden="true" />
              {t("trust.verified")}
            </li>
            <li className="kicker flex items-center gap-2 text-[var(--color-ivory-dim)]">
              <Lock className="h-4 w-4 text-[var(--color-acid)]" aria-hidden="true" />
              {t("trust.escrow")}
            </li>
            <li className="kicker flex items-center gap-2 text-[var(--color-ivory-dim)]">
              <StarIcon className="h-4 w-4 fill-[var(--color-acid)] text-[var(--color-acid)]" aria-hidden="true" />
              {t("trust.rating")}
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5" aria-hidden="true">
              {proofNames.map((n, i) => (
                <AvatarInitials key={n} name={n} size="sm" tone={i} className="ring-2 ring-[var(--color-noir)]" />
              ))}
            </div>
            <p className="text-sm text-[var(--color-ivory-dim)]">{t("social")}</p>
          </div>
        </div>
      </Container>

      {/* Bottom editorial frame */}
      <Container size="wide">
        <div className="flex items-center justify-between border-t border-[var(--color-line)] py-4">
          <span className="kicker flex items-center gap-2 text-[var(--color-ivory-dim)]">
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" aria-hidden="true" />
            {t("scroll")}
          </span>
          <span className="kicker hidden text-[var(--color-ivory-dim)] sm:block" translate="no">
            52.3676° N · 4.9041° E
          </span>
        </div>
      </Container>

      <div id="hero-end-sentinel" aria-hidden="true" className="h-px w-full" />
    </section>
  );
}
