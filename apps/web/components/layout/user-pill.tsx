"use client";

import { Link } from "@/i18n/navigation";
import { ChevronRight, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * `<UserPill />` — accesso directo al dashboard del usuario logueado.
 * Importado tanto en la top bar desktop como en el drawer móvil.
 *
 * Si el usuario es cleaner, `href` apunta a `/dashboard/cleaner`;
 * si es cliente, a `/dashboard`.
 */
export function UserPill({
  name,
  role,
  tone = "onLight",
  className,
}: {
  name: string;
  role: "client" | "cleaner";
  tone?: "onLight" | "onDark";
  className?: string;
}) {
  const href = role === "cleaner" ? "/dashboard/cleaner" : "/dashboard";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full px-2 py-1.5 pr-3 transition",
        tone === "onDark"
          ? "border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15"
          : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)]",
        className,
      )}
      aria-label={`Mijn dashboard — ${name}`}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
          tone === "onDark"
            ? "bg-white/20 text-white"
            : "bg-[var(--color-blue-soft)] text-[var(--color-primary)]",
        )}
        aria-hidden
      >
        {initials || <UserRound className="h-3.5 w-3.5" />}
      </span>
      <span className="max-w-[7rem] truncate text-sm font-medium">{name}</span>
      <ChevronRight
        className="h-3.5 w-3.5 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-90"
        aria-hidden
      />
    </Link>
  );
}
