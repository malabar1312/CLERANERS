"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Container } from "@/components/layout/container";
import { SearchBar } from "@/components/ui/search-bar";

/**
 * Búsqueda sticky de la landing — comodidad de conversión.
 *
 * Aparece bajo el nav cuando la search del hero (#hero-search) deja de ser
 * usable, y desaparece al llegar al carrusel de cleaners (#schoonmakers):
 * ahí la atención debe estar en los perfiles.
 *
 * Por qué scroll-handler y no IntersectionObserver: en desktop el hero es
 * sticky/cinematic — la search se desvanece por OPACITY (scroll-scrub de
 * Motion) sin salir nunca del viewport, así que un observer no dispara.
 * Leemos la opacity computada + rects en un rAF (solo durante scroll).
 *
 * Solo sm+: en móvil ya existe el StickyMobileCta (bottom) y una segunda
 * barra fija arriba comería media pantalla.
 */
export function StickySearch() {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const heroSearch = document.getElementById("hero-search");
    const carousel = document.getElementById("schoonmakers");
    if (!heroSearch || !carousel) return;

    const heroSection = heroSearch.closest("section");

    // Sin rAF a propósito: el handler es barato (2 rects) y los scroll
    // events ya llegan alineados a frame; rAF se pausa con la pestaña
    // oculta y dejaría el estado congelado.
    const update = () => {
      const vh = window.innerHeight;
      const hsRect = heroSearch.getBoundingClientRect();
      // Cinematic (lg+): el hero es sticky y la search se FUNDE por opacity
      // (scrub de Motion, opacity 0 al 70% del recorrido) sin salir del
      // viewport — replicamos esa matemática en vez de leer la opacity.
      const isCinematic = window.matchMedia("(min-width: 1024px)").matches;
      const scrubTravel = heroSection ? Math.max(heroSection.offsetHeight - vh, 1) : 1;
      const fadedOut = isCinematic && window.scrollY > 0.7 * scrubTravel;
      // <lg (flujo natural): la search sale por arriba físicamente.
      const searchGone = fadedOut || hsRect.bottom < 96;
      // Llegaste al carrusel cuando su top cruza la mitad de la pantalla;
      // de ahí hacia abajo permanece oculta (top sigue siendo < 50%).
      const carouselReached = carousel.getBoundingClientRect().top < vh * 0.5;
      setVisible(searchGone && !carouselReached);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -24 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -24 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-0 top-[calc(var(--nav-h-sm)+0.5rem)] z-30 hidden sm:block"
        >
          <Container size="wide">
            <div className="mx-auto max-w-3xl">
              <SearchBar compact />
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
