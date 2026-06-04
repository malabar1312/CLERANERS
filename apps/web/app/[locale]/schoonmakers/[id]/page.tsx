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
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { BookingButton } from "@/components/domain/booking-flow";
import { Link } from "@/i18n/navigation";
import { asArray } from "@/lib/utils";
import { getCleanerProfile, cleanerIds } from "@/lib/mock/cleaners";
import { TrackCleanerView } from "@/components/analytics/track-view";
import { featuredReviews } from "@/lib/mock/reviews";

export function generateStaticParams() {
  return cleanerIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = getCleanerProfile(id);
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

  const profile = getCleanerProfile(id);
  if (!profile) notFound();

  const t = await getTranslations("cleanerProfile");
  const included = asArray<string>(t.raw("included"));
  const guarantees = asArray<string>(t.raw("book.guarantees"));
  const trustItems = asArray<{ title: string; proof: string }>(t.raw("trust.items"));

  // Deterministic 3 reviews per cleaner from the shared pool.
  const offset = Math.max(0, cleanerIds().indexOf(id));
  const reviews = [0, 1, 2]
    .map((k) => featuredReviews[(offset + k) % featuredReviews.length])
    .filter((r): r is (typeof featuredReviews)[number] => Boolean(r));

  return (
    <>
      <AuthNav />
      <TrackCleanerView cleanerId={profile.id} />
      <main className="min-h-screen bg-[var(--color-dark)] text-[var(--color-dark-ink)]">
        <Container size="wide" className="pt-[calc(var(--nav-h-sm)+2rem)] pb-[var(--space-section)]">
          <Link
            href="/schoonmakers"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-dark-muted)] transition-colors hover:text-[var(--color-blue)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("back")}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-12">
            {/* Main column */}
            <div className="lg:col-span-2">
              {/* Identity */}
              <div className="flex flex-col gap-5 border-b border-[var(--color-dark-line)] pb-10 sm:flex-row sm:items-center">
                <AvatarInitials name={profile.name} size="xl" tone={profile.tone} online={profile.online} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h1 className="headline text-[length:var(--text-headline)] text-[var(--color-dark-ink)]">
                      {profile.name}
                    </h1>
                    {profile.verified && (
                      <BadgeCheck className="h-6 w-6 shrink-0 text-[var(--color-blue)]" aria-label="Geverifieerd" />
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-dark-muted)]">
                    <span className="flex items-center gap-1.5">
                      <StarIcon className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                      <span className="font-semibold text-[var(--color-dark-ink)]">{profile.rating.toFixed(1)}</span>
                      {profile.reviews} {t("reviewsWord")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      {profile.hood}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {t("respondsIn", { mins: profile.responseMins })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust panel — por qué es seguro dejar entrar a esta persona */}
              <section className="border-b border-[var(--color-dark-line)] py-10">
                <h2 className="headline text-2xl text-[var(--color-dark-ink)]">
                  {t("trust.title", { name: profile.name })}
                </h2>
                <p className="measure-prose mt-3 text-sm leading-relaxed text-[var(--color-dark-muted)]">
                  {t("trust.lead")}
                </p>
                <ul className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {trustItems.map((item, i) => {
                    const Icon = trustIcons[i] ?? BadgeCheck;
                    return (
                      <li key={item.title} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:rgb(0_102_255/0.12)]">
                          <Icon className="h-[18px] w-[18px] text-[var(--color-blue)]" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold text-[var(--color-dark-ink)]">{item.title}</p>
                          <p className="mt-0.5 text-sm text-[var(--color-dark-muted)]">{item.proof}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Wat als het misgaat — la red de seguridad */}
                <div className="mt-7 rounded-2xl border border-[color:rgb(0_102_255/0.25)] bg-[color:rgb(0_102_255/0.07)] p-5">
                  <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--color-dark-ink)]">
                    <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
                    {t("trust.guaranteeTitle")}
                  </p>
                  <p className="measure-prose mt-2 text-sm leading-relaxed text-[var(--color-dark-muted)]">
                    {t("trust.guaranteeBody")}
                  </p>
                </div>

                {/* Sello */}
                <p className="label mt-5 inline-flex items-center gap-2 text-[var(--color-dark-muted)]">
                  <BadgeCheck className="h-4 w-4 text-[var(--color-blue)]" aria-hidden="true" />
                  {t("trust.seal")}
                </p>
              </section>

              {/* About */}
              <section className="border-b border-[var(--color-dark-line)] py-10">
                <h2 className="label text-[var(--color-blue)]">{t("aboutTitle")}</h2>
                <p className="measure-prose mt-4 text-pretty text-lg leading-relaxed text-[var(--color-dark-ink)] opacity-90">
                  {profile.bio}
                </p>
                <p className="mt-6 flex items-center gap-2 text-sm text-[var(--color-dark-muted)]">
                  <Languages className="h-4 w-4 text-[var(--color-blue)]" aria-hidden="true" />
                  {t("speaks")}: {profile.languages.join(" · ")}
                  <span className="text-[var(--color-dark-line)]">|</span>
                  {t("since", { year: profile.since })}
                </p>
              </section>

              {/* Specialties */}
              <section className="border-b border-[var(--color-dark-line)] py-10">
                <h2 className="label text-[var(--color-blue)]">{t("specialtiesTitle")}</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {profile.specialties.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-[var(--color-dark-line)] bg-[var(--color-dark-2)] px-4 py-2 text-sm font-medium text-[var(--color-dark-ink)]"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Included */}
              <section className="border-b border-[var(--color-dark-line)] py-10">
                <h2 className="label text-[var(--color-blue)]">{t("includedTitle")}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[15px] text-[var(--color-dark-ink)]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue)] text-[var(--color-blue-ink)]">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Reviews */}
              <section className="py-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="label text-[var(--color-blue)]">{t("reviewsTitle")}</h2>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-dark-muted)]">
                    <StarIcon className="h-4 w-4 fill-[var(--color-blue)] text-[var(--color-blue)]" aria-hidden="true" />
                    <strong className="font-semibold text-[var(--color-dark-ink)]">{profile.rating.toFixed(1)}</strong>
                    · {profile.reviews} {t("reviewsWord")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-dark-muted)]">{t("reviewsVerifiedNote")}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {reviews.map((review) => (
                    <Card key={review.id} variant="dark" padding="md" className="flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-0.5" aria-hidden="true">
                          {Array.from({ length: review.rating }).map((_, idx) => (
                            <StarIcon key={idx} className="h-3.5 w-3.5 fill-[var(--color-blue)] text-[var(--color-blue)]" />
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-blue)]">
                          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                          {t("verifiedBooking")}
                        </span>
                      </div>
                      <blockquote className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-[var(--color-dark-ink)] opacity-90">
                        {review.quote}
                      </blockquote>
                      <p className="mt-4 text-xs text-[var(--color-dark-muted)]">
                        {review.author} · {review.hood} · {review.date}
                      </p>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar — booking card */}
            <aside className="lg:col-span-1">
              <Card variant="dark" padding="lg" className="lg:sticky lg:top-[calc(var(--nav-h-sm)+1.5rem)]">
                <div className="flex items-baseline gap-1.5">
                  <span className="label text-[var(--color-dark-muted)]">{t("book.from")}</span>
                  <span className="font-display text-4xl text-[var(--color-dark-ink)]">€{profile.pricePerHour}</span>
                  <span className="text-sm text-[var(--color-dark-muted)]">{t("book.perHour")}</span>
                </div>

                <div className="mt-5">
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

                <p className="mt-5 border-t border-[var(--color-dark-line)] pt-5 text-xs text-[var(--color-dark-muted)]">
                  {t("book.feeNote")}
                </p>

                <ul className="mt-5 space-y-3">
                  {guarantees.map((g, i) => {
                    const Icon = guaranteeIcons[i] ?? ShieldCheck;
                    return (
                      <li key={g} className="flex items-center gap-2.5 text-sm text-[var(--color-dark-ink)]">
                        <Icon className="h-4 w-4 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
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
