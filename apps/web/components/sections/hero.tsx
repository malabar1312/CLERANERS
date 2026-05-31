import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Star as StarIcon, BadgeCheck, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { HeroSearch } from "./hero-search";

/**
 * `<Hero />` — STITCH Quiet-Luxury. Light, titular Geist (display) con `kiest`
 * en azul eléctrico, search glass, y un showcase de schoonmakers destacados
 * (avatares + datos, sin fotos stock). Termina con sentinel para el sticky-CTA.
 */
export async function Hero() {
  const t = await getTranslations("hero");
  const proofNames = ["Sofia R", "Maria G", "Laura M", "Elena S", "Carmen P"];
  const featured = [
    { id: "sofia-r", name: "Sofia Rodríguez", hood: "De Pijp", rating: 4.9, price: 24, tone: 0 },
    { id: "laura-m", name: "Laura Martinez", hood: "Jordaan", rating: 5.0, price: 28, tone: 2 },
    { id: "carmen-p", name: "Carmen Pérez", hood: "Zuid", rating: 4.9, price: 26, tone: 5 },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--color-white)]">
      {/* faint blue radial accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[460px]"
        style={{ background: "radial-gradient(58% 70% at 50% -5%, rgb(0 102 255 / 0.07) 0%, transparent 70%)" }}
      />

      <Container size="wide" className="relative">
        {/* Headline block */}
        <div className="mx-auto max-w-3xl pt-[calc(var(--nav-h-sm)+3.5rem)] text-center">
          <span className="label inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-1.5 text-[var(--color-slate)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-blue)]" aria-hidden="true" />
            {t("eyebrow")}
          </span>

          <h1 className="display mt-7 text-balance text-[length:var(--text-display)] text-[var(--color-ink)]">
            {t("titleStart")}
            <span className="text-[var(--color-blue)]">{t("titleEmphasis")}</span>
            {t("titleEnd")}
          </h1>

          <p className="measure-short mx-auto mt-6 text-pretty text-lg leading-relaxed text-[var(--color-muted)] sm:text-xl">
            {t("lead")}
          </p>

          <div className="flex justify-center">
            <HeroSearch />
          </div>

          <div className="mt-5">
            <Link
              href="/voor-schoonmakers"
              className="text-sm font-medium text-[var(--color-slate)] underline-offset-4 transition hover:text-[var(--color-blue)]"
            >
              {t("ctaSecondary")}
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {proofNames.map((n, i) => (
                  <AvatarInitials key={n} name={n} size="sm" tone={i} className="ring-2 ring-[var(--color-white)]" />
                ))}
              </div>
              <p className="text-sm text-[var(--color-muted)]">{t("social")}</p>
            </div>
            <span className="hidden h-4 w-px bg-[var(--color-line)] sm:block" aria-hidden="true" />
            <span className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <StarIcon className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
              <span className="font-semibold text-[var(--color-ink)]">4,9</span> {t("trust.rating")}
            </span>
          </div>
        </div>

        {/* Showcase — featured cleaners on a soft panel */}
        <div className="relative mx-auto mt-16 max-w-5xl pb-[var(--space-section-sm)]">
          <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-ambient)] sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {featured.map((c) => (
                <Link
                  key={c.id}
                  href={`/schoonmakers/${c.id}`}
                  className="group rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-5 shadow-[var(--shadow-soft)] transition-all duration-[var(--dur-mid)] ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="flex items-center gap-3">
                    <AvatarInitials name={c.name} size="md" tone={c.tone} online />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="truncate text-sm font-semibold text-[var(--color-ink)]">{c.name}</span>
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                      </div>
                      <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {c.hood}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-3.5">
                    <span className="flex items-center gap-1 text-sm">
                      <StarIcon className="h-3.5 w-3.5 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                      <span className="font-semibold text-[var(--color-ink)]">{c.rating.toFixed(1)}</span>
                    </span>
                    <span className="text-sm text-[var(--color-ink)]">
                      <span className="font-bold">€{c.price}</span>
                      <span className="text-[var(--color-muted)]">{t("perHourShort")}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <div id="hero-end-sentinel" aria-hidden="true" className="h-px w-full" />
    </section>
  );
}
