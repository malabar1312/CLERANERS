"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { Container } from "./container";
import { buttonStyles } from "@/components/ui/button-variants";
import { Drawer } from "./drawer";
import { UserPill } from "./user-pill";
import { LocaleSwitcher } from "./locale-switcher";
import { navLinks } from "./links";
import { cn } from "@/lib/utils";

type CurrentUser = { name: string; role: "customer" | "cleaner" } | null;

/**
 * `<Nav />` — Stitch: barra superior flotante glassmorphic, persistente.
 * Texto tinta sobre claro. Al scroll gana borde + opacidad. Scroll rAF.
 */
export function Nav({ initialUser = null }: { initialUser?: CurrentUser }) {
  const t = useTranslations("nav");
  /* Siempre false en el primer render (= SSR) para no romper la hidratación;
     el valor real se sincroniza en el effect de abajo antes del primer paint útil. */
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user] = useState<CurrentUser>(initialUser);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // La restauración de scroll del navegador ocurre antes de hidratar:
    // sincroniza el estado real al montar.
    setScrolled(window.scrollY > 10);
    const onScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = window.requestAnimationFrame(() => {
        setScrolled((prev) => {
          const next = window.scrollY > 10;
          return prev === next ? prev : next;
        });
        rafId.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current !== null) window.cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          "glass fixed inset-x-0 top-0 z-40 transition-all",
          "duration-[var(--dur-mid)] ease-[var(--ease-out)]",
          scrolled
            ? "border-b border-[var(--color-line)] shadow-[var(--shadow-xs)]"
            : "border-b border-transparent",
        )}
      >
        <Container size="wide">
          <div className="flex h-[var(--nav-h)] items-center justify-between sm:h-[var(--nav-h-sm)]">
            <Link href="/" className="flex items-center" aria-label="cleaners — home">
              <Logo tone="onLight" size="md" />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Hoofdnavigatie">
              {navLinks.map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-display rounded-full px-3.5 py-2 text-sm font-medium text-[var(--color-slate)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
                >
                  {t(labelKey)}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <LocaleSwitcher />
              {user ? (
                <UserPill name={user.name} />
              ) : (
                <>
                  <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm" })}>
                    {t("login")}
                  </Link>
                  <Link href="/signup" className={buttonStyles({ variant: "primary", size: "sm" })}>
                    {t("signup")}
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {user ? (
                <UserPill name={user.name} />
              ) : (
                <>
                  <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm", className: "px-3 text-xs sm:text-sm" })}>
                    {t("login")}
                  </Link>
                  <Link href="/signup" className={buttonStyles({ variant: "primary", size: "sm", className: "px-3 text-xs sm:text-sm" })}>
                    {t("signup")}
                  </Link>
                </>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Menu openen"
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-white)] text-[var(--color-ink)] transition hover:bg-[var(--color-surface-2)]"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />
    </>
  );
}
