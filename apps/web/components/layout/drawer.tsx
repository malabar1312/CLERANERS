"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { X, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { UserPill } from "./user-pill";
import { buttonStyles } from "@/components/ui/button-variants";
import { navLinks } from "./links";
import { cn } from "@/lib/utils";

/**
 * `<Drawer />` — overlay móvil noir editorial. Focus-trap, Esc, scroll-lock.
 * Panel casi-negro, texto marfil, hairlines, CTA lima ácida.
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
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
          "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity",
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
          "border-l border-[var(--color-line)] bg-[var(--color-noir)] text-[var(--color-ivory)] shadow-[var(--shadow-modal)]",
          "transition-transform duration-[var(--dur-mid)] ease-[var(--ease-out)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
          <h2 id="drawer-title" className="sr-only">Menu</h2>
          <Logo size="sm" tone="onDark" />
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--color-ivory-dim)] transition-colors hover:bg-[var(--color-noir-2)] hover:text-[var(--color-ivory)]"
            aria-label="Menu sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {user ? (
            <div className="mb-6 rounded-lg border border-[var(--color-line)] bg-[var(--color-noir-2)] p-4">
              <UserPill name={user.name} role={user.role} tone="onDark" />
              <Link
                href={user.role === "cleaner" ? "/dashboard/cleaner" : "/dashboard"}
                onClick={onClose}
                className="mt-3 block rounded-md border border-[var(--color-line)] px-4 py-3 text-sm font-medium text-[var(--color-ivory)] transition hover:border-[var(--color-acid)] hover:text-[var(--color-acid)]"
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
                className="headline border-b border-[var(--color-line)] py-4 text-2xl text-[var(--color-ivory)] transition-colors hover:text-[var(--color-acid)]"
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <footer className="border-t border-[var(--color-line)] px-5 py-5">
          {user ? (
            <button
              type="button"
              className={buttonStyles({ variant: "secondary", size: "lg", fullWidth: true })}
              onClick={() => {
                onLogout?.();
                onClose();
              }}
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
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
