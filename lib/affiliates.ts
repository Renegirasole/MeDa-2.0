import type { CategorySlug } from "@/lib/data/categories";

/**
 * Enlaces de salida a partners. Único punto donde vive la monetización por afiliación.
 * Sustituir las URLs base por los deep links de cada programa (Awin, Amazon Afiliados,
 * Booking Affiliate Partner, Skyscanner…) en cuanto estén aprobados.
 */
export interface OutboundLink {
  partner: string;
  label: string;
  href: string;
}

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";

function track(url: string, campaign: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "meda");
  u.searchParams.set("utm_medium", "referral");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

function amazon(query: string, campaign: string): OutboundLink {
  const u = new URL("https://www.amazon.es/s");
  u.searchParams.set("k", query);
  if (AMAZON_TAG) u.searchParams.set("tag", AMAZON_TAG);
  return { partner: "Amazon", label: "Ver precios en Amazon", href: track(u.toString(), campaign) };
}

const BY_CATEGORY: Record<CategorySlug, OutboundLink[]> = {
  coche: [
    { partner: "coches.net", label: "Buscar en coches.net", href: track("https://www.coches.net/segunda-mano/", "coche") },
    { partner: "AutoScout24", label: "Buscar en AutoScout24", href: track("https://www.autoscout24.es/", "coche") },
  ],
  "comprar-vivienda": [
    { partner: "idealista", label: "Buscar en idealista", href: track("https://www.idealista.com/", "vivienda") },
    { partner: "Fotocasa", label: "Buscar en Fotocasa", href: track("https://www.fotocasa.es/", "vivienda") },
  ],
  "alquilar-vivienda": [
    { partner: "idealista", label: "Buscar en idealista", href: track("https://www.idealista.com/", "alquiler") },
    { partner: "Fotocasa", label: "Buscar en Fotocasa", href: track("https://www.fotocasa.es/", "alquiler") },
  ],
  tecnologia: [amazon("portátil", "tecnologia")],
  viaje: [
    { partner: "Skyscanner", label: "Buscar vuelos", href: track("https://www.skyscanner.es/", "viaje") },
    { partner: "Booking.com", label: "Buscar alojamiento", href: track("https://www.booking.com/", "viaje") },
  ],
  estudios: [],
  moto: [{ partner: "motos.net", label: "Buscar en motos.net", href: track("https://motos.coches.net/", "moto") }],
  deporte: [amazon("equipación deporte", "deporte")],
  mascota: [amazon("accesorios mascota", "mascota")],
  otro: [],
};

export const dealLinks = (slug: CategorySlug): OutboundLink[] => BY_CATEGORY[slug];

export function travelLinks(destination: string): OutboundLink[] {
  const booking = new URL("https://www.booking.com/searchresults.es.html");
  booking.searchParams.set("ss", destination);
  return [
    { partner: "Skyscanner", label: "Buscar vuelos", href: track("https://www.skyscanner.es/", "viajes") },
    { partner: "Booking.com", label: `Alojamiento en ${destination}`, href: track(booking.toString(), "viajes") },
  ];
}
