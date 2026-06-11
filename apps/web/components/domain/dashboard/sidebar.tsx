"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Wallet,
  MessageSquare,
  Settings,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const t = useTranslations("dashboard.sidebar");
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "overview";
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { id: "overview", label: t("overview"), icon: LayoutDashboard },
    { id: "bookings", label: t("bookings"), icon: CalendarCheck },
    { id: "calendar", label: t("calendar"), icon: Calendar },
    { id: "earnings", label: t("earnings"), icon: Wallet },
    { id: "messages", label: t("messages"), icon: MessageSquare },
    { id: "settings", label: t("settings"), icon: Settings },
  ];

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return `?${params.toString()}`;
  };

  const navContent = (
    <>
      <div className="mb-8 px-2 flex flex-col gap-1">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Logo tone="onLight" size="md" />
        </Link>
        <p className="font-display text-[11px] uppercase tracking-wider text-[var(--color-slate)] mt-2">
          {t("title")}
        </p>
      </div>

      <nav className="flex-1 space-y-1.5">
        {links.map(({ id, label, icon: Icon }) => {
          const isActive = view === id;
          return (
            <Link
              key={id}
              href={createQueryString("view", id)}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[var(--color-blue-soft)] text-[var(--color-blue)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                  : "text-[var(--color-slate)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-3 text-sm font-semibold text-white shadow-[var(--shadow-xs)] transition-all hover:bg-[var(--color-blue)] hover:shadow-[var(--shadow-blue)]">
        <Plus className="h-4 w-4" />
        <span>{t("newBooking")}</span>
      </button>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-xs)] lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-[var(--color-ink)]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-[var(--color-ink)]/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — mobile slide-in + desktop fixed */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-slate)] hover:bg-[var(--color-surface-2)] lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
        {navContent}
      </aside>
    </>
  );
}
