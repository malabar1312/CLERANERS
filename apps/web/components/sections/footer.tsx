import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { asArray } from "@/lib/utils";
import { FooterWaitlistForm } from "./footer-waitlist-form";

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

/**
 * `<Footer />` — noir editorial. 3 columnas + wachtlijst (Server Action +
 * honeypot). KvK/BTW placeholder `····` hasta lanzamiento.
 */
export async function Footer() {
  const t = await getTranslations("footer");
  const columns = ["platform", "support", "legal"] as const;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-noir)] text-[var(--color-ivory)]">
      <Container size="wide">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo tone="onDark" size="lg" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-ivory-dim)]">{t("tagline")}</p>

            <div className="mt-8 max-w-sm">
              <p className="kicker text-[var(--color-acid)]">{t("waitlist.title")}</p>
              <p className="mt-2 text-sm text-[var(--color-ivory-dim)]">{t("waitlist.body")}</p>
              <div className="mt-3.5">
                <FooterWaitlistForm />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            {columns.map((key) => {
              const col = t.raw(`columns.${key}`) as FooterColumn | undefined;
              const links = asArray<FooterLink>(col?.links);
              return (
                <nav key={key} aria-label={col?.title}>
                  <h2 className="kicker text-[var(--color-ivory-dim)]">{col?.title}</h2>
                  <ul className="mt-4 space-y-3">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-[var(--color-ivory-2)] transition-colors hover:text-[var(--color-acid)]">
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

        <div className="flex flex-col gap-3 border-t border-[var(--color-line)] py-6 text-xs text-[var(--color-ivory-dim)] sm:flex-row sm:items-center sm:justify-between">
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
