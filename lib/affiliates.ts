import type { CategorySlug } from "@/lib/data/categories";
import type { PlanTier } from "@/lib/engine";
import { formatEUR } from "@/lib/format";

/**
 * Enlaces de salida a partners. Único punto donde vive la monetización por afiliación.
 *
 * Cada partner puede llevar su enlace de afiliado por variable de entorno (Vercel):
 * una plantilla con `{url}` (URL de destino codificada) o `{raw}` (sin codificar).
 *   Awin:    https://www.awin1.com/cread.php?awinmid=123&awinaffid=456&ued={url}
 *   Propio:  {raw}&aid=789
 * Sin variable, el enlace sale directo con UTM (0 € por clic, pero funciona).
 * Ver docs/AFILIACION.md.
 */
export interface OutboundLink {
  partner: string;
  label: string;
  /** Segunda línea: qué vas a encontrar o por qué te lo enseñamos */
  detail?: string;
  /** compare = comparador que paga por contacto; search = portal con el filtro puesto */
  kind: "compare" | "search" | "shop";
  href: string;
}

/** Lo que el usuario ya nos ha dicho, para no mandarle a una portada vacía. */
export interface DealContext {
  /** Tope de búsqueda: precio (o cuota mensual en gastos recurrentes) con el que le da */
  budget?: number;
  /** Importe a financiar (precio − entrada), si financia */
  loan?: number;
}

// Tienen que ir escritas enteras: Next solo sustituye `process.env.NEXT_PUBLIC_X` literal.
const TEMPLATES: Record<string, string | undefined> = {
  iahorro: process.env.NEXT_PUBLIC_AFF_IAHORRO,
  helpmycash: process.env.NEXT_PUBLIC_AFF_HELPMYCASH,
  rastreator: process.env.NEXT_PUBLIC_AFF_RASTREATOR,
  acierto: process.env.NEXT_PUBLIC_AFF_ACIERTO,
  cochesnet: process.env.NEXT_PUBLIC_AFF_COCHESNET,
  autoscout24: process.env.NEXT_PUBLIC_AFF_AUTOSCOUT24,
  fotocasa: process.env.NEXT_PUBLIC_AFF_FOTOCASA,
  booking: process.env.NEXT_PUBLIC_AFF_BOOKING,
  skyscanner: process.env.NEXT_PUBLIC_AFF_SKYSCANNER,
  // Viajes: casi todos se gestionan con un solo alta en Travelpayouts.
  civitatis: process.env.NEXT_PUBLIC_AFF_CIVITATIS,
  getyourguide: process.env.NEXT_PUBLIC_AFF_GETYOURGUIDE,
  tiqets: process.env.NEXT_PUBLIC_AFF_TIQETS,
  hostelworld: process.env.NEXT_PUBLIC_AFF_HOSTELWORLD,
  welcomepickups: process.env.NEXT_PUBLIC_AFF_WELCOMEPICKUPS,
  airalo: process.env.NEXT_PUBLIC_AFF_AIRALO,
};
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";

function withUtm(url: string, campaign: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "meda");
  u.searchParams.set("utm_medium", "referral");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

/** Aplica la plantilla de afiliado del partner, si existe y es válida. */
export function affiliate(key: string, url: string, campaign: string, template = TEMPLATES[key]): string {
  const target = withUtm(url, campaign);
  const t = template?.trim();
  if (!t || !(t.includes("{url}") || t.includes("{raw}"))) return target;
  const out = t.split("{url}").join(encodeURIComponent(target)).split("{raw}").join(target);
  try {
    return new URL(out).protocol === "https:" ? out : target;
  } catch {
    return target;
  }
}

/** Redondea hacia abajo: nunca enseñamos un tope más alto que el que le da. */
const floorTo = (v: number, step: number) => Math.max(step, Math.floor(v / step) * step);
const valid = (v: number | undefined): v is number => typeof v === "number" && Number.isFinite(v) && v > 0;

function amazon(query: string, campaign: string, budget?: number): OutboundLink {
  const cap = valid(budget) ? floorTo(budget, 10) : undefined;
  const u = new URL("https://www.amazon.es/s");
  u.searchParams.set("k", query);
  // Amazon filtra por precio en céntimos: p_36:MIN-MAX
  if (cap) u.searchParams.set("rh", `p_36:-${cap * 100}`);
  if (AMAZON_TAG) u.searchParams.set("tag", AMAZON_TAG);
  return {
    partner: "Amazon",
    kind: "shop",
    label: cap ? `Hasta ${formatEUR(cap)} en Amazon` : "Ver precios en Amazon",
    detail: cap ? "Resultados filtrados por lo que te da" : undefined,
    href: withUtm(u.toString(), campaign),
  };
}

function car(ctx: DealContext): OutboundLink[] {
  const cap = valid(ctx.budget) ? floorTo(ctx.budget, 100) : undefined;
  const coches = new URL("https://www.coches.net/segunda-mano/");
  const autoscout = new URL("https://www.autoscout24.es/lst");
  autoscout.searchParams.set("atype", "C");
  autoscout.searchParams.set("cy", "E");
  if (cap) {
    coches.searchParams.set("MaxPrice", String(cap));
    autoscout.searchParams.set("priceto", String(cap));
  }
  return [
    {
      partner: "coches.net",
      kind: "search",
      label: cap ? `Coches hasta ${formatEUR(cap)} en coches.net` : "Buscar en coches.net",
      detail: cap ? "Búsqueda ya filtrada por lo que te da" : undefined,
      href: affiliate("cochesnet", coches.toString(), "coche"),
    },
    {
      partner: "Rastreator",
      kind: "compare",
      label: "Compara el seguro antes de comprar",
      detail: "Es el gasto que más mueve tu cuota real. Gratis y sin compromiso",
      href: affiliate("rastreator", "https://www.rastreator.com/seguros-de-coche", "coche"),
    },
    {
      partner: "AutoScout24",
      kind: "search",
      label: cap ? `Coches hasta ${formatEUR(cap)} en AutoScout24` : "Buscar en AutoScout24",
      href: affiliate("autoscout24", autoscout.toString(), "coche"),
    },
    {
      partner: "Acierto",
      kind: "compare",
      label: "Segunda opinión del seguro en Acierto",
      href: affiliate("acierto", "https://www.acierto.com/seguros-coche/", "coche"),
    },
  ];
}

function moto(ctx: DealContext): OutboundLink[] {
  const cap = valid(ctx.budget) ? floorTo(ctx.budget, 100) : undefined;
  const motos = new URL("https://motos.coches.net/segunda-mano/");
  if (cap) motos.searchParams.set("MaxPrice", String(cap));
  return [
    {
      partner: "motos.net",
      kind: "search",
      label: cap ? `Motos hasta ${formatEUR(cap)} en motos.net` : "Buscar en motos.net",
      detail: cap ? "Búsqueda ya filtrada por lo que te da" : undefined,
      href: affiliate("cochesnet", motos.toString(), "moto"),
    },
    {
      partner: "Rastreator",
      kind: "compare",
      label: "Compara el seguro de moto",
      detail: "Gratis y sin compromiso",
      href: affiliate("rastreator", "https://www.rastreator.com/seguros-de-moto", "moto"),
    },
  ];
}

function buyHome(ctx: DealContext): OutboundLink[] {
  const cap = valid(ctx.budget) ? floorTo(ctx.budget, 1000) : undefined;
  const loan = valid(ctx.loan) ? floorTo(ctx.loan, 1000) : undefined;
  const fotocasa = new URL("https://www.fotocasa.es/es/comprar/viviendas/espana/todas-las-zonas/l");
  if (cap) fotocasa.searchParams.set("maxPrice", String(cap));
  return [
    {
      partner: "iAhorro",
      kind: "compare",
      label: loan ? `Compara hipotecas para ${formatEUR(loan)}` : "Compara hipotecas",
      detail: "Un bróker busca la mejor oferta entre bancos. Gratis para ti",
      href: affiliate("iahorro", "https://www.iahorro.com/hipotecas", "vivienda"),
    },
    {
      partner: "Fotocasa",
      kind: "search",
      label: cap ? `Pisos hasta ${formatEUR(cap)} en Fotocasa` : "Buscar en Fotocasa",
      detail: cap ? "Búsqueda ya filtrada por lo que te da" : undefined,
      href: affiliate("fotocasa", fotocasa.toString(), "vivienda"),
    },
    {
      partner: "HelpMyCash",
      kind: "compare",
      label: "Segunda opinión en HelpMyCash",
      detail: "Comparador independiente de hipotecas",
      href: affiliate("helpmycash", "https://www.helpmycash.com/hipotecas/", "vivienda"),
    },
  ];
}

function rentHome(ctx: DealContext): OutboundLink[] {
  const cap = valid(ctx.budget) ? floorTo(ctx.budget, 10) : undefined;
  const fotocasa = new URL("https://www.fotocasa.es/es/alquiler/viviendas/espana/todas-las-zonas/l");
  if (cap) fotocasa.searchParams.set("maxPrice", String(cap));
  return [
    {
      partner: "Fotocasa",
      kind: "search",
      label: cap ? `Alquileres hasta ${formatEUR(cap)} al mes` : "Buscar alquiler en Fotocasa",
      detail: cap ? "Búsqueda ya filtrada por lo que te da" : undefined,
      href: affiliate("fotocasa", fotocasa.toString(), "alquiler"),
    },
    {
      partner: "Rastreator",
      kind: "compare",
      label: "Compara el seguro de hogar",
      detail: "Muchos caseros lo piden. Gratis y sin compromiso",
      href: affiliate("rastreator", "https://www.rastreator.com/seguros-de-hogar", "alquiler"),
    },
  ];
}

function trip(): OutboundLink[] {
  return [
    { partner: "Skyscanner", kind: "search", label: "Buscar vuelos", href: affiliate("skyscanner", "https://www.skyscanner.es/", "viaje") },
    { partner: "Booking.com", kind: "search", label: "Buscar alojamiento", href: affiliate("booking", "https://www.booking.com/", "viaje") },
  ];
}

const BY_CATEGORY: Record<CategorySlug, (ctx: DealContext) => OutboundLink[]> = {
  coche: car,
  "comprar-vivienda": buyHome,
  "alquilar-vivienda": rentHome,
  tecnologia: (ctx) => [amazon("portátil", "tecnologia", ctx.budget)],
  viaje: trip,
  estudios: () => [],
  moto,
  // Deporte es cuota mensual (gimnasio): ese tope no sirve para filtrar equipación.
  deporte: () => [amazon("equipación deporte", "deporte")],
  mascota: (ctx) => [amazon("accesorios mascota", "mascota", ctx.budget)],
  otro: () => [],
};

export const dealLinks = (slug: CategorySlug, ctx: DealContext = {}): OutboundLink[] => BY_CATEGORY[slug](ctx);

/** Lo que hace falta para enlazar los servicios de un viaje ya calculado. */
export interface TripLinkContext {
  /** Nombre del destino tal y como se enseña */
  destination: string;
  /** ISO 3166-1 alfa-2 del destino, para la eSIM */
  country: string | null;
  /** ISO del país desde el que se sale: dentro del roaming europeo no ofrecemos eSIM */
  originCountry: string;
  /** Ciudad de Welcome Pickups, si cubren el destino */
  transferSlug: string | null;
  /** Slug de país de Airalo, si tiene cobertura */
  esimSlug: string | null;
  /** Plan elegido: cada uno lleva a un tipo de alojamiento y de actividades */
  tier: PlanTier;
  /** Se vuela: solo entonces tienen sentido el vuelo y el traslado del aeropuerto */
  flying: boolean;
  /** Enlace real al vuelo más barato encontrado (ya lleva nuestro marker) */
  flightHref?: string | null;
  travelers: number;
}

const bookingSearch = (city: string, travelers: number, opts: { stars?: number; apartments?: boolean; byPrice?: boolean } = {}) => {
  const rooms = Math.max(1, Math.ceil(travelers / 2));
  const u = new URL("https://www.booking.com/searchresults.es.html");
  u.searchParams.set("ss", city);
  u.searchParams.set("group_adults", String(travelers));
  u.searchParams.set("no_rooms", String(rooms));
  u.searchParams.set("group_children", "0");
  const filters = [opts.stars ? `class=${opts.stars}` : null, opts.apartments ? "ht_id=201" : null].filter(Boolean).join(";");
  if (filters) u.searchParams.set("nflt", filters);
  if (opts.byPrice) u.searchParams.set("order", "price");
  return u.toString();
};

const gygSearch = (query: string) => `https://www.getyourguide.es/s/?q=${encodeURIComponent(query)}`;

/**
 * Servicios de un viaje, por plan. Cada uno paga comisión por reserva
 * (ver docs/AFILIACION.md); sin variable de entorno el enlace funciona igual
 * pero no cobramos. El orden es el de utilidad para quien viaja, nunca el de
 * comisión.
 */
export function travelLinks(ctx: TripLinkContext): OutboundLink[] {
  const { destination: city, tier, travelers } = ctx;
  const links: OutboundLink[] = [];

  if (ctx.flying) {
    links.push(
      ctx.flightHref
        ? { partner: "Aviasales", kind: "search", label: "Ver ese vuelo", detail: "El más barato encontrado para esa ruta", href: ctx.flightHref }
        : { partner: "Skyscanner", kind: "search", label: "Buscar vuelos", href: affiliate("skyscanner", "https://www.skyscanner.es/", "viajes") },
    );
  }

  if (tier === "budget") {
    links.push({
      partner: "Booking.com",
      kind: "search",
      label: `Alojamiento barato en ${city}`,
      detail: "Ordenado por precio",
      href: affiliate("booking", bookingSearch(city, travelers, { byPrice: true }), "viajes"),
    });
    links.push({
      partner: "Hostelworld",
      kind: "search",
      label: "Hostales y habitaciones compartidas",
      href: affiliate("hostelworld", "https://www.hostelworld.com/", "viajes"),
    });
  } else {
    const stars = tier === "top" ? 5 : 3;
    links.push({
      partner: "Booking.com",
      kind: "search",
      label: `Hoteles de ${stars}★ en ${city}`,
      detail: "Búsqueda con el destino y las personas ya puestos",
      href: affiliate("booking", bookingSearch(city, travelers, { stars }), "viajes"),
    });
    if (ctx.flying) {
      links.push(
        ctx.transferSlug
          ? {
              partner: "Welcome Pickups",
              kind: "search",
              label: "Traslado del aeropuerto al hotel",
              detail: "Conductor esperando, precio cerrado",
              href: affiliate("welcomepickups", `https://www.welcomepickups.com/${ctx.transferSlug}/`, "viajes"),
            }
          : {
              partner: "GetYourGuide",
              kind: "search",
              label: "Traslado del aeropuerto al hotel",
              href: affiliate("getyourguide", gygSearch(`traslado aeropuerto ${city}`), "viajes"),
            },
      );
    }
  }

  links.push(
    tier === "top"
      ? {
          partner: "GetYourGuide",
          kind: "search",
          label: `Tours privados y experiencias en ${city}`,
          href: affiliate("getyourguide", gygSearch(city), "viajes"),
        }
      : {
          partner: "Civitatis",
          kind: "search",
          label: tier === "budget" ? `Free tours y actividades en ${city}` : `Visitas guiadas en ${city}`,
          detail: "En español",
          href: affiliate("civitatis", `https://www.civitatis.com/es/buscar?q=${encodeURIComponent(city)}`, "viajes"),
        },
  );

  links.push({
    partner: "Tiqets",
    kind: "search",
    label: "Entradas a museos y monumentos",
    detail: "Sin colas",
    href: affiliate("tiqets", `https://www.tiqets.com/es/search?q=${encodeURIComponent(city)}`, "viajes"),
  });

  if (ctx.esimSlug) {
    links.push({
      partner: "Airalo",
      kind: "shop",
      label: "eSIM con datos para el móvil",
      detail: "Sin roaming ni cambiar de tarjeta",
      href: affiliate("airalo", `https://www.airalo.com/${ctx.esimSlug}-esim`, "viajes"),
    });
  }

  return links;
}
