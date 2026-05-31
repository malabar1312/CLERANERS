/**
 * Shared nav link config — used by `<Nav />` and `<Drawer />` so the link
 * list lives in exactly one place. Labels resolve via next-intl `nav.*` keys.
 */
export type NavLink = { href: string; labelKey: string };

export const navLinks: NavLink[] = [
  { href: "/#hoe-het-werkt", labelKey: "howItWorks" },
  { href: "/schoonmakers", labelKey: "schoonmakers" },
  { href: "/voor-schoonmakers", labelKey: "forCleaners" },
  { href: "/#faq", labelKey: "faq" },
];
