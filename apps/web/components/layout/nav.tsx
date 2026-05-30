"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { Drawer } from "./drawer";
import { UserPill } from "./user-pill";
import { cn } from "@/lib/utils";

type CurrentUser = { name: string; role: "client" | "cleaner" } | null;

/**
 * `<Nav />` — top bar fija con paridad móvil 100%.
 *
 * Comportamiento (heredado del MVP):
 *  - Hasta ~10px de scroll: transparente sobre el hero oscuro (tone=onDark).
 *  - A partir de ahí: blanco con sombra y borde sutil.
 *  - En móvil: hamburger → `<Drawer />` con estado logueado/no-logueado.
 *  - El estado logueado se hidrata en cliente desde Supabase (Fase 2 cablea getUser).
 */
export function Nav() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Supabase user hydration — wired in Fase 2 once env vars exist.
  // useEffect(() => {
  //   const supa = createSupabaseBrowserClient();
  //   supa.auth.getUser().then(({ data }) => { ... });
  // }, []);

  const tone = scrolled ? "onLight" : "onDark";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "border-b border-[var(--color-border)] bg-white/85 backdrop-blur-lg shadow-[var(--shadow-sm)]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <Container size="wide">
          <div className="flex h-16 items-center justify-between sm:h-[72px]">
            <Link href="/" className="flex items-center" aria-label="cleaners — home">
              <Logo tone={tone} size="md" />
            </Link>

            {/* Desktop links */}
            <nav className="hidden items-center gap-1 lg:flex">
              {[
                { href: "/#hoe-het-werkt", label: t("howItWorks") },
                { href: "/schoonmakers", label: t("schoonmakers") },
                { href: "/voor-schoonmakers", label: t("forCleaners") },
                { href: "/#faq", label: t("faq") },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition",
                    tone === "onDark"
                      ? "text-white/85 hover:bg-white/10 hover:text-white"
                      : "text-[var(--color-ink-2)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)]",
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop right */}
            <div className="hidden items-center gap-2 lg:flex">
              {user ? (
                <UserPill name={user.name} role={user.role} tone={tone} />
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant={tone === "onDark" ? "ghost-on-dark" : "ghost"}
                      size="sm"
                    >
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm">
                      {t("signup")}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile right: pill if logged + auth or hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              {user ? (
                <UserPill name={user.name} role={user.role} tone={tone} />
              ) : (
                <Link href="/login">
                  <Button
                    variant={tone === "onDark" ? "ghost-on-dark" : "ghost"}
                    size="sm"
                    className="px-3"
                  >
                    {t("login")}
                  </Button>
                </Link>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Menu openen"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition",
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
        onLogout={() => setUser(null)}
      />
    </>
  );
}
