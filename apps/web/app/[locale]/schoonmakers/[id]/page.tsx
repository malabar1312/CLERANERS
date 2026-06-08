import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  BadgeCheck,
  Star as StarIcon,
  MapPin,
  Clock,
  Languages,
  Check,
  ShieldCheck,
  Lock,
  CalendarX2,
  Users,
  Umbrella,
} from "lucide-react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { BookingButton } from "@/components/domain/booking-flow";
import { FavoriteButton } from "@/components/domain/favorite-button";
import { TrackCleanerView } from "@/components/analytics/track-view";
import { Link } from "@/i18n/navigation";
import { asArray } from "@/lib/utils";
import { getCleanerProfileById, getCleanerIds } from "@/lib/data/cleaners";
import { getFavoriteIds } from "@/lib/data/favorites";
import { featuredReviews } from "@/lib/mock/reviews";

// ISR: refleja cleaners reales añadidos a Supabase sin rebuild completo.
export const revalidate = 60;
// Permite slugs de cleaners reales que no estaban en el build inicial.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getCleanerIds()).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getCleanerProfileById(id);
  return { title: profile ? profile.name : "Schoonmaker" };
}

const guaranteeIcons = [ShieldCheck, Lock, CalendarX2];
const trustIcons = [BadgeCheck, ShieldCheck, Users, Umbrella, Lock];

export default async function CleanerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const profile = await getCleanerProfileById(id);
  if (!profile) notFound();

  const t = await getTranslations("cleanerProfile");
  const included = asArray<string>(t.raw("included"));
  const guarantees = asArray<string>(t.raw("book.guarantees"));
  const trustItems = asArray<{ title: string; proof: string }>(t.raw("trust.items"));
  const favoriteIds = await getFavoriteIds();
  const isFavorited = favoriteIds.includes(profile.id);

  // Deterministic 3 reviews per cleaner from the shared pool.
  const offset = Math.max(0, (await getCleanerIds()).indexOf(id));
  const reviews = [0, 1, 2]
    .map((k) => featuredReviews[(offset + k) % featuredReviews.length])
    .filter((r): r is (typeof featuredReviews)[number] => Boolean(r));

  return (
    <>
      <AuthNav />
      <TrackCleanerView cleanerId={profile.id} />
      <main className="min-h-screen bg-[var(--bg)] text-[var(--color-ink)]">
        <Container size="wide" className="pt-[calc(var(--nav-h-sm)+2rem)] pb-[var(--space-section)]">
          <Link
            href="/schoonmakers"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-blue)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("back")}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-16">
            {/* Main column */}
            <div className="lg:col-span-2">
              {/* Identity & Photo hero */}
              <div className="flex flex-col gap-8 border-b border-[var(--color-line)] pb-12 sm:flex-row sm:items-start">
                <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-[2rem] shadow-xl shadow-black/5 sm:h-72 sm:w-64">
                  {profile.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-2)] text-5xl font-bold text-[var(--color-muted)]">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                  {profile.online && (
                    <div className="absolute right-4 top-4 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm" />
                  )}
                </div>

                <div className="flex flex-col justify-center pt-2 sm:pt-6">
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-display text-4xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-5xl">
                      {profile.name}
                    </h1>
                    {profile.verified && (
                      <BadgeCheck className="mt-2 h-8 w-8 shrink-0 text-[var(--color-blue)]" aria-label="Geverifieerd" />
                    )}
                    <span className="mt-2">
                      <FavoriteButton
                        cleanerId={profile.id}
                        initialFavorited={isFavorited}
                        variant="light"
                      />
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-base text-[var(--color-slate)]">
                    <span className="flex items-center gap-2">
                      <StarIcon className="h-5 w-5 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                      <strong className="font-bold text-[var(--color-ink)]">{profile.rating.toFixed(1)}</strong>
                      <span>({profile.reviews} {t("reviewsWord")})</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[var(--color-muted)]" aria-hidden="true" />
                      {profile.hood}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[var(--color-muted)]" aria-hidden="true" />
                      {t("respondsIn", { mins: profile.responseMins })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust panel */}
              <section className="border-b border-[var(--color-line)] py-12">
                <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  {t("trust.title", { name: profile.name })}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-slate)]">
                  {t("trust.lead")}
                </p>
                <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  {trustItems.map((item, i) => {
                    const Icon = trustIcons[i] ?? BadgeCheck;
                    return (
                      <li key={item.title} className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-blue)]/10">
                          <Icon className="h-5 w-5 text-[var(--color-blue)]" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">{item.proof}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Wat als het misgaat — la red de seguridad */}
                <div className="mt-8 rounded-2xl border border-[var(--color-blue)]/20 bg-[var(--color-blue-soft)] p-5">
                  <p className="flex items-center gap-2 font-semibold text-[var(--color-ink)]">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                    {t("trust.guaranteeTitle")}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-slate)]">
                    {t("trust.guaranteeBody")}
                  </p>
                </div>

                <p className="mt-8 flex items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
                  <ShieldCheck className="h-5 w-5 text-[var(--color-blue)]" aria-hidden="true" />
                  {t("trust.seal")}
                </p>
              </section>

              {/* About */}
              <section className="border-b border-[var(--color-line)] py-12">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-blue)]">
                  {t("aboutTitle")}
                </h2>
                <p className="mt-6 text-pretty text-xl leading-relaxed tracking-tight text-[var(--color-ink)] sm:text-2xl">
                  {profile.bio}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-medium text-[var(--color-muted)]">
                  <span className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-[var(--color-blue)]" aria-hidden="true" />
                    {t("speaks")}: {profile.languages.join(" · ")}
                  </span>
                  <span className="h-4 w-px bg-[var(--color-line)]" />
                  <span>{t("since", { year: profile.since })}</span>
                </div>
              </section>

              {/* Specialties */}
              <section className="border-b border-[var(--color-line)] py-12">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-blue)]">
                  {t("specialtiesTitle")}
                </h2>
                <ul className="mt-6 flex flex-wrap gap-3">
                  {profile.specialties.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-[var(--color-line)] bg-[var(--color-white)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] shadow-sm"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Included */}
              <section className="border-b border-[var(--color-line)] py-12">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-blue)]">
                  {t("includedTitle")}
                </h2>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-base text-[var(--color-slate)]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue)]/10 text-[var(--color-blue)]">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Reviews */}
              <section className="py-12">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                    {t("reviewsTitle")}
                  </h2>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
                    <StarIcon className="h-5 w-5 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                    <strong className="text-[var(--color-ink)]">{profile.rating.toFixed(1)}</strong>
                    · {profile.reviews} {t("reviewsWord")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{t("reviewsVerifiedNote")}</p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {reviews.map((review) => (
                    <Card key={review.id} variant="white" padding="lg" className="flex flex-col shadow-xl shadow-black/5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1" aria-hidden="true">
                          {Array.from({ length: review.rating }).map((_, idx) => (
                            <StarIcon key={idx} className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" />
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-blue)]/5 px-2 py-1 text-[11px] font-bold text-[var(--color-blue)]">
                          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                          {t("verifiedBooking")}
                        </span>
                      </div>
                      <blockquote className="mt-5 flex-1 text-pretty text-base leading-relaxed text-[var(--color-slate)]">
                        &quot;{review.quote}&quot;
                      </blockquote>
                      <p className="mt-6 text-sm font-medium text-[var(--color-muted)]">
                        <strong className="text-[var(--color-ink)]">{review.author}</strong> · {review.hood} · {review.date}
                      </p>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar — booking card */}
            <aside className="lg:col-span-1">
              <Card
                variant="white"
                padding="lg"
                className="sticky top-[calc(var(--nav-h-sm)+2rem)] shadow-2xl shadow-black/5 ring-1 ring-black/5"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">{t("book.from")}</span>
                  <span className="font-display text-5xl font-extrabold tracking-tight text-[var(--color-ink)]">€{profile.pricePerHour}</span>
                  <span className="text-sm font-medium text-[var(--color-muted)]">{t("book.perHour")}</span>
                </div>

                <div className="mt-8">
                  <BookingButton
                    cleaner={{
                      id: profile.id,
                      name: profile.name,
                      pricePerHour: profile.pricePerHour,
                      hood: profile.hood,
                      tone: profile.tone,
                    }}
                  />
                </div>

                <p className="mt-6 border-t border-[var(--color-line)] pt-6 text-center text-xs font-medium text-[var(--color-muted)]">
                  {t("book.feeNote")}
                </p>

                <ul className="mt-6 space-y-4 rounded-2xl bg-[var(--color-surface-2)] p-6">
                  {guarantees.map((g, i) => {
                    const Icon = guaranteeIcons[i] ?? ShieldCheck;
                    return (
                      <li key={g} className="flex items-start gap-3 text-sm font-medium text-[var(--color-slate)]">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                        {g}
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </aside>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
