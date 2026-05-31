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
type Tone = "auto" | "onDark" | "onLight";

/**
 * `<Nav />` — top bar fija con paridad móvil 100%.
 *
 * - Modo `auto` (default): transparent sobre el hero oscuro (scroll < 10px),
 *   blanco + sombra desde el scroll. Para páginas SIN hero oscuro (dashboard,
 *   listings) pasar `tone="onLight"` para forzar el modo claro permanente.
 * - Estado logueado: pasar `user` (futuro: server-prop hidratado).
 * - Scroll listener con throttle vía `requestAnimationFrame` — sin re-render
 *   en cada pixel de scroll.
 */
export function Nav({
  tone: toneProp = "auto",
  initialUser = null,
}: {
  tone?: Tone;
  initialUser?: CurrentUser;
}) {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.scrollY > 10;
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user] = useState<CurrentUser>(initialUser);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (toneProp !== "auto") return; // no scroll tracking necesario
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
  }, [toneProp]);

  const tone: "onDark" | "onLight" =
    toneProp === "auto" ? (scrolled ? "onLight" : "onDark") : toneProp;

  // White bar appears either: forced onLight, or auto+scrolled.
  const isLightBar = tone === "onLight";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all",
          "duration-[var(--dur-mid)] ease-[var(--ease-out)]",
          isLightBar
            ? "border-b border-[var(--color-border)] bg-white/92 backdrop-blur-lg saturate-150 shadow-[var(--shadow-sm)]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <Container size="wide">
          <div className="flex h-[var(--nav-h)] items-center justify-between sm:h-[var(--nav-h-sm)]">
            <Link href="/" className="flex items-center" aria-label="cleaners — home">
              <Logo tone={tone} size="md" />
            </Link>

            {/* Desktop links */}
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Hoofdnavigatie">
              {navLinks.map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium",
                    "transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)]",
                    tone === "onDark"
                      ? "text-white/85 hover:bg-white/10 hover:text-white"
                      : "text-[var(--color-ink-2)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)]",
                  )}
                >
                  {t(labelKey)}
                </Link>
              ))}
            </nav>

            {/* Desktop right */}
            <div className="hidden items-center gap-2 lg:flex">
              {user ? (
                <UserPill name={user.name} role={user.role} tone={tone} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className={buttonStyles({
                      variant: tone === "onDark" ? "ghost-on-dark" : "ghost",
                      size: "sm",
                    })}
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/signup"
                    className={buttonStyles({ variant: "primary", size: "sm" })}
                  >
                    {t("signup")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile right */}
            <div className="flex items-center gap-2 lg:hidden">
              {user ? (
                <UserPill name={user.name} role={user.role} tone={tone} />
              ) : (
                <Link
                  href="/login"
                  className={buttonStyles({
                    variant: tone === "onDark" ? "ghost-on-dark" : "ghost",
                    size: "sm",
                    className: "px-3",
                  })}
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
                  "flex h-10 w-10 items-center justify-center rounded-full transition",
                  "duration-[var(--dur-base)] ease-[var(--ease-out)]",
                  tone === "onDark"
                    ? "border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-primary)]",
                )}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
      />
    </>
  );
}
