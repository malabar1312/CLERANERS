import { AuthNav } from "@/components/layout/auth-nav";
import { Footer } from "@/components/sections/footer";
import { Container } from "@/components/layout/container";

type Section = { id: string; title: string; body: string };

/**
 * `<LegalPage />` — página legal Stitch Quiet-Luxury. Server Component, 0 JS.
 * Recibe secciones ya traducidas desde el caller (via next-intl t.raw()).
 * Tabla de contenidos + secciones numeradas + fecha de actualización.
 */
export function LegalPage({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <>
      <AuthNav />
      <main className="min-h-screen bg-[var(--color-white)] text-[var(--color-ink)]">
        <header className="border-b border-[var(--color-line)] pt-[calc(var(--nav-h-sm)+3.5rem)] pb-10">
          <Container size="md">
            <p className="label flex items-center gap-2 text-[var(--color-blue)]">
              <span className="h-1.5 w-1.5 bg-[var(--color-blue)]" aria-hidden="true" />
              {eyebrow}
            </p>
            <h1 className="display mt-4 max-w-[18ch] text-balance text-[length:var(--text-display)] text-[var(--color-ink)]">
              {title}
            </h1>
            <p className="mt-3 text-sm text-[var(--color-muted)]">{lastUpdated}</p>
          </Container>
        </header>

        <Container size="md" className="py-12">
          <p className="measure-prose text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
            {intro}
          </p>

          {/* TOC */}
          <nav className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5" aria-label="Inhoudsopgave">
            <p className="label text-[var(--color-slate)]">Inhoud</p>
            <ol className="mt-3 space-y-1.5">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-[var(--color-muted)] underline-offset-4 transition-colors hover:text-[var(--color-blue)] hover:underline"
                  >
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="mt-10 space-y-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id}>
                <h2 className="headline text-xl text-[var(--color-ink)]">
                  {i + 1}. {s.title}
                </h2>
                <div className="measure-prose mt-3 text-[15px] leading-relaxed text-[var(--color-slate)] whitespace-pre-line">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
