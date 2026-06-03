import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Star as StarIcon, BadgeCheck, ShieldCheck, Umbrella, Lock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { HeroWaitlist } from "./hero-waitlist";

/**
 * `<Hero />` — STITCH Quiet-Luxury + calidez. Split Airbnb-style waitlist-first:
 * a la izquierda titular Geist con `kiest` en azul, captura de wachtlijst
 * (CTA dominante), trust-bar (geverifieerd · verzekerd €300k · escrow) y prueba
 * social; a la derecha una foto real de interior con una card de schoonmaker.
 */
export async function Hero() {
  const t = await getTranslations("hero");
  const proofNames = ["Sofia R", "Maria G", "Laura M", "Elena S", "Carmen P"];

  return (
    <section className="relative overflow-hidden bg-[var(--color-white)]">
      {/* warm whisper wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 55% at 12% 8%, rgb(224 162 58 / 0.06) 0%, transparent 60%)" }}
      />

      <Container size="wide">
        <div className="grid items-center gap-12 pt-[calc(var(--nav-h-sm)+2.5rem)] pb-[var(--space-section-sm)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ---------- Left: message + search + trust ---------- */}
          <div className="max-w-xl">
            <span className="label inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-cream)] px-3.5 py-1.5 text-[var(--color-slate)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-blue)]" aria-hidden="true" />
              {t("eyebrow")}
            </span>

            <h1 className="display mt-6 text-balance text-[length:var(--text-display)] text-[var(--color-ink)]">
              {t("titleStart")}
              <span className="text-[var(--color-blue)]">{t("titleEmphasis")}</span>
              {t("titleEnd")}
            </h1>

            <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
              {t("lead")}
            </p>

            <HeroWaitlist />

            {/* Trust-bar — el diferencial sube arriba del fold */}
            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <li className="flex items-center gap-2 text-sm font-medium text-[var(--color-slate)]">
                <ShieldCheck className="h-[18px] w-[18px] text-[var(--color-blue)]" aria-hidden="true" />
                {t("trust.verified")}
              </li>
              <li className="flex items-center gap-2 text-sm font-medium text-[var(--color-slate)]">
                <Umbrella className="h-[18px] w-[18px] text-[var(--color-blue)]" aria-hidden="true" />
                {t("trust.insured")}
              </li>
              <li className="flex items-center gap-2 text-sm font-medium text-[var(--color-slate)]">
                <Lock className="h-[18px] w-[18px] text-[var(--color-blue)]" aria-hidden="true" />
                {t("trust.escrow")}
              </li>
            </ul>

            {/* Social proof */}
            <div className="mt-7 flex items-center gap-3">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {proofNames.map((n, i) => (
                  <AvatarInitials key={n} name={n} size="sm" tone={i} className="ring-2 ring-[var(--color-white)]" />
                ))}
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-ink)]">
                  <StarIcon className="h-3.5 w-3.5 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                  4,9
                </span>{" "}
                · {t("social")}
              </p>
            </div>

            <div className="mt-6">
              <Link
                href="/voor-schoonmakers"
                className="text-sm font-medium text-[var(--color-slate)] underline-offset-4 transition hover:text-[var(--color-blue)]"
              >
                {t("ctaSecondary")} →
              </Link>
            </div>
          </div>

          {/* ---------- Right: real photo + floating cleaner card ---------- */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-[var(--color-line)] shadow-[var(--shadow-ambient)] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src="/hero/interior.jpg"
                alt={t("photoAlt")}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              {/* verified pill on image */}
              <span className="glass absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] shadow-[var(--shadow-soft)]">
                <BadgeCheck className="h-4 w-4 text-[var(--color-blue)]" aria-hidden="true" />
                {t("trust.verified")}
              </span>

              {/* floating cleaner card */}
              <Link
                href="/schoonmakers/sofia-r"
                className="absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-ambient)] transition-transform duration-[var(--dur-mid)] ease-[var(--ease-out)] hover:-translate-y-0.5 sm:left-auto sm:w-72"
              >
                <AvatarInitials name="Sofia Rodríguez" size="md" tone={0} online />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-sm font-semibold text-[var(--color-ink)]">Sofia Rodríguez</span>
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                    <span className="inline-flex items-center gap-0.5">
                      <StarIcon className="h-3 w-3 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                      4,9
                    </span>
                    · De Pijp
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--color-ink)]">€24<span className="text-xs font-normal text-[var(--color-muted)]">{t("perHourShort")}</span></p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-blue)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-blue)]" aria-hidden="true" />
                    {t("available")}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Container>

      <div id="hero-end-sentinel" aria-hidden="true" className="h-px w-full" />
    </section>
  );
}
