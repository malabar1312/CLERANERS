"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { X, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { UserPill } from "./user-pill";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * `<Drawer />` — overlay móvil con navegación principal.
 *
 * Estado logueado: pill al usuario + "Mijn dashboard" + Uitloggen.
 * Estado no-logueado: links + CTAs Inloggen/Aanmelden.
 *
 * Se monta una sola vez en `<Nav />` y vive controlado por `open`/`onClose`.
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

  // Lock scroll cuando el drawer está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[var(--color-navy)]/55 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-[var(--ease-out)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <Logo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {user ? (
            <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <UserPill name={user.name} role={user.role} />
              <Link
                href={user.role === "cleaner" ? "/dashboard/cleaner" : "/dashboard"}
                onClick={onClose}
                className="mt-3 block rounded-xl bg-white px-4 py-3 text-sm font-medium text-[var(--color-ink)] shadow-[var(--shadow-sm)] transition hover:text-[var(--color-primary)]"
              >
                {t("myDashboard")}
              </Link>
            </div>
          ) : null}

          <nav className="flex flex-col gap-1">
            {[
              { href: "/#hoe-het-werkt", label: t("howItWorks") },
              { href: "/schoonmakers", label: t("schoonmakers") },
              { href: "/voor-schoonmakers", label: t("forCleaners") },
              { href: "/#faq", label: t("faq") },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="rounded-xl px-3 py-3 text-base font-medium text-[var(--color-ink-2)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)]"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <footer className="border-t border-[var(--color-border)] px-5 py-5">
          {user ? (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => {
                onLogout?.();
                onClose();
              }}
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </Button>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link href="/login" onClick={onClose}>
                <Button variant="secondary" size="lg" className="w-full">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/signup" onClick={onClose}>
                <Button variant="primary" size="lg" className="w-full">
                  {t("signup")}
                </Button>
              </Link>
            </div>
          )}
        </footer>
      </aside>
    </div>
  );
}
