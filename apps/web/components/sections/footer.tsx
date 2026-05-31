import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { asArray } from "@/lib/utils";
import { FooterWaitlistForm } from "./footer-waitlist-form";

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

/**
 * `<Footer />` — pie de página. 3 columnas de navegación + bloque wachtlijst,
 * y franja inferior con KvK/BTW (placeholder `····` hasta que Antonio
 * entregue los reales — ver tooltip) + copyright.
 */
export async function Footer() {
  const t = await getTranslations("footer");
  const columns = ["platform", "support", "legal"] as const;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[var(--color-navy)] text-white">
      <Container size="wide">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-8">
          {/* Brand + waitlist */}
          <div className="lg:col-span-4">
            <Logo tone="onDark" size="lg" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">{t("tagline")}</p>

            <div className="mt-7 max-w-sm">
              <p className="text-sm font-semibold text-white">{t("waitlist.title")}</p>
              <p className="mt-1 text-sm text-white/55">{t("waitlist.body")}</p>
              <div className="mt-3.5">
                <FooterWaitlistForm />
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            {columns.map((key) => {
              const col = t.raw(`columns.${key}`) as FooterColumn | undefined;
              const links = asArray<FooterLink>(col?.links);
              return (
                <nav key={key} aria-label={col?.title}>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                    {col?.title}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-white/65 transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              );
            })}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("company.copy", { year })}</p>
          <p className="flex items-center gap-4">
            <span title={t("company.kvkTooltip")}>{t("company.kvk")}</span>
            <span title={t("company.kvkTooltip")}>{t("company.btw")}</span>
            <span translate="no">Amsterdam · NL</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
