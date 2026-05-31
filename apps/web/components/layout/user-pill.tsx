"use client";

import { Link } from "@/i18n/navigation";
import { ChevronRight, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * `<UserPill />` — acceso directo al dashboard. Stitch (light): hairline +
 * superficie blanca, chip de iniciales negro, acento azul en hover.
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
  const onDark = tone === "onDark";

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full px-2 py-1.5 pr-3 transition",
        "duration-[var(--dur-base)] ease-[var(--ease-out)]",
        onDark
          ? "border border-[var(--color-dark-line)] bg-[var(--color-dark-2)] text-[var(--color-dark-ink)] hover:border-[var(--color-blue)]"
          : "border border-[var(--color-line)] bg-[var(--color-white)] text-[var(--color-ink)] hover:border-[var(--color-ink)] hover:shadow-[var(--shadow-xs)]",
        className,
      )}
      aria-label={`Mijn dashboard — ${name}`}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-[var(--color-primary-foreground)]"
        aria-hidden="true"
      >
        {initials || <UserRound className="h-3.5 w-3.5" />}
      </span>
      <span className="max-w-[6rem] truncate text-sm font-medium sm:max-w-[10rem]">{name}</span>
      <ChevronRight className="h-3.5 w-3.5 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-90" aria-hidden="true" />
    </Link>
  );
}
