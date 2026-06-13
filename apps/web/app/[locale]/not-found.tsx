"use client";

import { useTranslations } from "next-intl";
import { Compass, Home, Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui/button-variants";
import { Link } from "@/i18n/navigation";

/**
 * 404 de marca — reemplaza el default genérico de Next (que rompía la estética
 * quiet-luxury). Client component con `useTranslations`: toma los mensajes del
 * NextIntlClientProvider del layout, así funciona tanto para `notFound()`
 * explícitos (perfil de cleaner inexistente) como para URLs sin ruta (vía el
 * catch-all `[...rest]`). Mismo lenguaje visual que el error boundary.
 */
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--color-white)] text-[var(--color-ink)]">
      <Container size="sm" className="flex flex-col items-center py-20 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-blue-soft)]">
          <Compass className="h-8 w-8 text-[var(--color-blue)]" aria-hidden="true" />
        </span>
        <p className="label mt-6 text-[var(--color-blue)]" translate="no">
          {t("eyebrow")}
        </p>
        <h1 className="display mt-3 text-[length:var(--text-headline)] text-[var(--color-ink)]">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-md text-pretty text-lg leading-relaxed text-[var(--color-muted)]">
          {t("body")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={buttonStyles({ variant: "accent", size: "lg" })}>
            <Home className="h-4 w-4" aria-hidden="true" />
            {t("home")}
          </Link>
          <Link href="/schoonmakers" className={buttonStyles({ variant: "outline", size: "lg" })}>
            <Search className="h-4 w-4" aria-hidden="true" />
            {t("browse")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
