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
import { navLinks } from "./links";
import { cn } from "@/lib/utils";

type CurrentUser = { name: string; role: "client" | "cleaner" } | null;

/**
 * `<Nav />` — top bar noir editorial. Texto marfil siempre; al hacer scroll
 * aparece la barra (fondo casi-negro + hairline). Scroll rAF-throttled.
 */
export function Nav({ initialUser = null }: { initialUser?: CurrentUser }) {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.scrollY > 10;
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user] = useState<CurrentUser>(initialUser);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
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
          "fixed inset-x-0 top-0 z-40 transition-all",
          "duration-[var(--dur-mid)] ease-[var(--ease-out)]",
          scrolled
            ? "border-b border-[var(--color-line)] bg-[color:rgb(10_10_11/0.82)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <Container size="wide">
          <div className="flex h-[var(--nav-h)] items-center justify-between sm:h-[var(--nav-h-sm)]">
            <Link href="/" className="flex items-center" aria-label="cleaners — home">
              <Logo tone="onDark" size="md" />
            </Link>

            {/* Desktop links */}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Hoofdnavigatie">
              {navLinks.map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "kicker text-[var(--color-ivory-dim)] transition-colors",
                    "duration-[var(--dur-base)] hover:text-[var(--color-ivory)]",
                  )}
                >
                  {t(labelKey)}
                </Link>
              ))}
            </nav>

            {/* Desktop right */}
            <div className="hidden items-center gap-3 lg:flex">
              {user ? (
                <UserPill name={user.name} role={user.role} tone="onDark" />
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

            {/* Mobile right */}
            <div className="flex items-center gap-2 lg:hidden">
              {user ? (
                <UserPill name={user.name} role={user.role} tone="onDark" />
              ) : (
                <Link
                  href="/login"
                  className={buttonStyles({ variant: "ghost", size: "sm", className: "px-3" })}
                >
                  {t("login")}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Menu openen"
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition",
                  "border border-[var(--color-line)] bg-[color:rgb(245_243_239/0.05)] text-[var(--color-ivory)]",
                  "hover:bg-[color:rgb(245_243_239/0.1)]",
                )}
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
