"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { X, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/[locale]/_actions/auth";
import { Logo } from "@/components/brand/logo";
import { UserPill } from "./user-pill";
import { buttonStyles } from "@/components/ui/button-variants";
import { LocaleSwitcher } from "./locale-switcher";
import { navLinks } from "./links";
import { cn } from "@/lib/utils";

/**
 * `<Drawer />` — overlay móvil Stitch (light). Focus-trap, Esc, scroll-lock.
 * Panel blanco, tinta, hairlines, CTAs negro/azul.
 */
export function Drawer({
  open,
  onClose,
  user,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  user?: { name: string; role: "client" | "cleaner" } | null;
  onLogout?: () => void;
}) {
  const t = useTranslations("nav");
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-drawer"
      className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        role="presentation"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[color:rgb(10_10_10/0.4)] backdrop-blur-sm transition-opacity",
          "duration-[var(--dur-mid)] ease-[var(--ease-out)]",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          "absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col",
          "border-l border-[var(--color-line)] bg-[var(--color-white)] text-[var(--color-ink)] shadow-[var(--shadow-glass)]",
          "transition-transform duration-[var(--dur-mid)] ease-[var(--ease-out)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
          <h2 id="drawer-title" className="sr-only">Menu</h2>
          <Logo size="sm" tone="onLight" />
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
            aria-label="Menu sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {user ? (
            <div className="mb-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <UserPill name={user.name} role={user.role} />
              <Link
                href={user.role === "cleaner" ? "/dashboard/cleaner" : "/dashboard"}
                onClick={onClose}
                className="mt-3 block rounded-xl border border-[var(--color-line)] px-4 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
              >
                {t("myDashboard")}
              </Link>
            </div>
          ) : null}

          <nav className="flex flex-col" aria-label="Mobiele navigatie">
            {navLinks.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="headline border-b border-[var(--color-line)] py-4 text-2xl text-[var(--color-ink)] transition-colors hover:text-[var(--color-blue)]"
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          <div className="mt-6 flex justify-center">
            <LocaleSwitcher />
          </div>
        </div>

        <footer className="border-t border-[var(--color-line)] px-5 py-5">
          {user ? (
            <form action={async () => { onClose(); await signOut(); }}>
              <button
                type="submit"
                className={buttonStyles({ variant: "secondary", size: "lg", fullWidth: true })}
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link href="/login" onClick={onClose} className={buttonStyles({ variant: "secondary", size: "lg", fullWidth: true })}>
                {t("login")}
              </Link>
              <Link href="/signup" onClick={onClose} className={buttonStyles({ variant: "primary", size: "lg", fullWidth: true })}>
                {t("signup")}
              </Link>
            </div>
          )}
        </footer>
      </aside>
    </div>
  );
}
