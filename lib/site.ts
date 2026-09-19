export const SITE = {
  name: "MeDa",
  tagline: "Saber si te da, antes de comprar.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://meda.app",
  description:
    "¿Me da para esto? Calcula gratis si te da para un coche, una casa, un alquiler o un viaje con tus ingresos, gastos y ahorros. Nota de 0 a 10 y 3 planes.",
  /** Datos del titular para Aviso legal (LSSI). Completar antes de publicar. */
  /** ID de editor de Google AdSense (ca-pub-…). Vacío = sin anuncios. */
  adsenseClient: normalizeAdsenseId(process.env.NEXT_PUBLIC_ADSENSE_CLIENT),
  owner: {
    legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "Titular de MeDa",
    taxId: process.env.NEXT_PUBLIC_LEGAL_TAX_ID ?? "",
    address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? "",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@meda.app",
  },
} as const;

/** Acepta "ca-pub-123…", "pub-123…" o solo los dígitos y devuelve "ca-pub-123…". */
function normalizeAdsenseId(raw: string | undefined): string {
  const digits = raw?.trim().match(/(\d{10,})/)?.[1];
  return digits ? `ca-pub-${digits}` : "";
}

/** Navegación principal: las cuatro herramientas. */
export const NAV = [
  { href: "/calculadoras", label: "¿Me da?" },
  { href: "/viajes", label: "Viajes" },
  { href: "/comparar", label: "Comparar ofertas" },
  { href: "/tasador", label: "Tasador" },
] as const;

/** Rutas de "tus cosas": se guardan solo en este dispositivo. */
export const PERSONAL_NAV = [
  { href: "/mi-situacion", label: "Mis números", description: "Ingresos, gastos y ahorros" },
  { href: "/combinar", label: "Mi lista", description: "Todo lo que quieres, junto" },
] as const;

/**
 * Quién hay detrás (E-E-A-T: en finanzas, Google y la gente quieren saberlo).
 * `sameAs`: perfiles públicos (LinkedIn, X…) cuando los queráis enlazar.
 */
export const TEAM: ReadonlyArray<{ name: string; role: string; sameAs?: readonly string[] }> = [
  { name: "René", role: "Cofundador" },
  { name: "Alberto", role: "Cofundador" },
];

/** Última revisión de las reglas y los textos (formato ISO). Cambiadla cuando revisáis algo. */
export const CONTENT_REVIEWED = "2026-09-19";

/** Información y transparencia. */
export const INFO_NAV = [
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/guias", label: "Guías" },
  { href: "/como-calculamos", label: "Cómo calculamos" },
  { href: "/anunciate", label: "Anúnciate en MeDa" },
] as const;
