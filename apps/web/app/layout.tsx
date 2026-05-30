import type { ReactNode } from "react";

// Root layout is intentionally a pass-through.
// All locale-specific concerns (fonts, intl provider, html lang) live in
// app/[locale]/layout.tsx so they can be configured per-locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
