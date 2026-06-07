import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { asArray } from "@/lib/utils";
import { FooterWaitlistForm } from "./footer-waitlist-form";

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

/**
 * `<Footer />` — Stitch Quiet-Luxury. Cierre oscuro premium. 3 columnas +
 * wachtlijst (Server Action + honeypot). KvK/BTW placeholder `····` hasta
 * lanzamiento.
 */
export async function Footer() {
  const t = await getTranslations("footer");
  const columns = ["platform", "support", "legal"] as const;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 bg-black/[0.02] text-black">
      <Container size="wide">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo tone="onLight" size="lg" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-black/60">{t("tagline")}</p>

            <div className="mt-10 max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-blue)]">{t("waitlist.title")}</p>
              <p className="mt-2 text-sm text-black/60">{t("waitlist.body")}</p>
              <div className="mt-4">
                <FooterWaitlistForm />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-2 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            {columns.map((key) => {
              const col = t.raw(`columns.${key}`) as FooterColumn | undefined;
              const links = asArray<FooterLink>(col?.links);
              return (
                <nav key={key} aria-label={col?.title}>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black">{col?.title}</h2>
                  <ul className="mt-6 space-y-4">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm font-medium text-black/60 transition-colors hover:text-[var(--color-blue)]">
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

        <div className="flex flex-col gap-3 border-t border-black/10 py-8 text-xs font-medium text-black/40 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("company.copy", { year })}</p>
          <p className="flex items-center gap-6">
            <span title={t("company.kvkTooltip")} className="hover:text-black/60 transition-colors">{t("company.kvk")}</span>
            <span title={t("company.kvkTooltip")} className="hover:text-black/60 transition-colors">{t("company.btw")}</span>
            <span translate="no">Amsterdam · NL</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
