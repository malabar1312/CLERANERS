import type { ReactNode } from "react";
import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/button-variants";

type SecondaryCta = { label: string; href: string };

/**
 * `<PlaceholderPage />` — Stitch Quiet-Luxury. Honest, on-brand stub for routes
 * that are linked from nav/footer but not yet built (product teasers, support,
 * legal). Persistent `<Nav />` + a quiet centered block + `<Footer />`.
 * Server Component, no client JS. Copy is supplied by the caller via next-intl.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  body,
  note,
  backHomeLabel,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  body: ReactNode;
  note?: string;
  backHomeLabel: string;
  secondaryCta?: SecondaryCta;
}) {
  return (
    <>
      <AuthNav />
      <main className="bg-[var(--color-white)] text-[var(--color-ink)]">
        <Container
          as="section"
          size="md"
          className="pt-[calc(var(--nav-h-sm)+4rem)] pb-28 sm:pb-36"
        >
          <p className="label flex items-center gap-2 text-[var(--color-blue)]">
            <span className="h-1.5 w-1.5 bg-[var(--color-blue)]" aria-hidden="true" />
            {eyebrow}
          </p>

          <h1 className="display mt-5 max-w-[18ch] text-balance text-[length:var(--text-display)] text-[var(--color-ink)]">
            {title}
          </h1>

          <p className="measure-prose mt-6 text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
            {body}
          </p>

          {note ? (
            <p className="measure-prose mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
              {note}
            </p>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/" className={buttonStyles({ variant: "primary" })}>
              {backHomeLabel}
            </Link>
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className={buttonStyles({ variant: "outline" })}
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
