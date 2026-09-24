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
  h2b: process.env.NEXT_PUBLIC_AFF_H2B,
  lineadirecta: process.env.NEXT_PUBLIC_AFF_LINEADIRECTA,
  assistcard: process.env.NEXT_PUBLIC_AFF_ASSISTCARD,
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
      partner: "Línea Directa",
      kind: "compare",
      label: "Calcula el seguro antes de comprar",
      detail: "Es el gasto que más mueve tu cuota real. Presupuesto gratis",
      href: affiliate("lineadirecta", "https://www.lineadirecta.com/seguros-coche/", "coche"),
    },
    {
      partner: "coches.net",
      kind: "search",
      label: cap ? `Coches hasta ${formatEUR(cap)} en coches.net` : "Buscar en coches.net",
      detail: cap ? "Búsqueda ya filtrada por lo que te da" : undefined,
      href: affiliate("cochesnet", coches.toString(), "coche"),
    },
    {
      partner: "AutoScout24",
      kind: "search",
      label: cap ? `Coches hasta ${formatEUR(cap)} en AutoScout24` : "Buscar en AutoScout24",
      href: affiliate("autoscout24", autoscout.toString(), "coche"),
    },
  ];
}

function moto(ctx: DealContext): OutboundLink[] {
  const cap = valid(ctx.budget) ? floorTo(ctx.budget, 100) : undefined;
  const motos = new URL("https://motos.coches.net/segunda-mano/");
  if (cap) motos.searchParams.set("MaxPrice", String(cap));
  return [
    {
      partner: "Línea Directa",
      kind: "compare",
      label: "Calcula el seguro de moto",
      detail: "Presupuesto gratis y sin compromiso",
      href: affiliate("lineadirecta", "https://www.lineadirecta.com/seguros-moto/", "moto"),
    },
    {
      partner: "motos.net",
      kind: "search",
      label: cap ? `Motos hasta ${formatEUR(cap)} en motos.net` : "Buscar en motos.net",
      detail: cap ? "Búsqueda ya filtrada por lo que te da" : undefined,
      href: affiliate("cochesnet", motos.toString(), "moto"),
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
      partner: "h2b Hipotecas",
      kind: "compare",
      label: loan ? `Compara hipotecas para ${formatEUR(loan)}` : "Compara hipotecas",
      detail: "Un bróker negocia con los bancos por ti. Gratis para ti",
      href: affiliate("h2b", "https://www.h2bhipotecas.com/", "vivienda"),
    },
    {
      partner: "Fotocasa",
      kind: "search",
      label: cap ? `Pisos hasta ${formatEUR(cap)} en Fotocasa` : "Buscar en Fotocasa",
      detail: cap ? "Búsqueda ya filtrada por lo que te da" : undefined,
      href: affiliate("fotocasa", fotocasa.toString(), "vivienda"),
    },
  ];
}

function rentHome(ctx: DealContext): OutboundLink[] {
  const cap = valid(ctx.budget) ? floorTo(ctx.budget, 10) : undefined;
  const fotocasa = new URL("https://www.fotocasa.es/es/alquiler/viviendas/espana/todas-las-zonas/l");
  if (cap) fotocasa.searchParams.set("maxPrice", String(cap));
  return [
    {
      partner: "Línea Directa",
      kind: "compare",
      label: "Calcula el seguro de hogar",
      detail: "Muchos caseros lo piden. Presupuesto gratis",
      href: affiliate("lineadirecta", "https://www.lineadirecta.com/seguros-hogar/", "alquiler"),
    },
    {
      partner: "Fotocasa",
      kind: "search",
      label: cap ? `Alquileres hasta ${formatEUR(cap)} al mes` : "Buscar alquiler en Fotocasa",
      detail: cap ? "Búsqueda ya filtrada por lo que te da" : undefined,
      href: affiliate("fotocasa", fotocasa.toString(), "alquiler"),
    },
  ];
}

function trip(): OutboundLink[] {
  return [
    { partner: "Skyscanner", kind: "search", label: "Buscar vuelos", href: affiliate("skyscanner", "https://www.skyscanner.es/", "viaje") },
    { partner: "Booking.com", kind: "search", label: "Buscar alojamiento", href: affiliate("booking", "https://www.booking.com/", "viaje") },
    {
      partner: "Assist Card",
      kind: "compare",
      label: "Seguro de viaje",
      detail: "Asistencia médica y cancelación fuera de España",
      href: affiliate("assistcard", "https://www.assistcard.com/es", "viaje"),
    },
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

// ——— Viajes: reserva paso a paso ———

export type TripMode = "avion" | "tren" | "bus" | "coche";

/** Lo que hace falta para enlazar la reserva de un plan de viaje ya calculado. */
export interface TripStepsContext {
  tier: PlanTier;
  mode: TripMode;
  origin: { name: string; country: string };
  destination: {
    name: string;
    country: string;
    iata: string;
    civitatisSlug?: string | null;
    /** Ciudad de Welcome Pickups, si cubren el destino */
    transferSlug: string | null;
    /** Slug de país de Airalo, solo si hace falta eSIM */
    esimSlug: string | null;
  };
  /** Aeropuerto de salida, si se vuela */
  airport: { iata: string; city: string } | null;
  /** YYYY-MM-DD */
  depart: string;
  /** YYYY-MM-DD */
  return: string;
  travelers: number;
  /** El vuelo real más barato encontrado, con su enlace (ya lleva nuestro marker) */
  flight?: { href: string; perPerson: number } | null;
}

export interface TripStep {
  title: string;
  links: OutboundLink[];
}

const enc = encodeURIComponent;
/** 2026-10-15 → 261015, el formato de fechas de las URLs públicas de Skyscanner */
const shortDate = (iso: string) => iso.replaceAll("-", "").slice(2);
const urlSlug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, "-");

function bookingStay(city: string, ctx: TripStepsContext, opts: { stars?: number; apartments?: boolean; byPrice?: boolean } = {}): string {
  const u = new URL("https://www.booking.com/searchresults.es.html");
  u.searchParams.set("ss", city);
  u.searchParams.set("checkin", ctx.depart);
  u.searchParams.set("checkout", ctx.return);
  u.searchParams.set("group_adults", String(ctx.travelers));
  u.searchParams.set("no_rooms", String(Math.max(1, Math.ceil(ctx.travelers / 2))));
  u.searchParams.set("group_children", "0");
  const filters = [opts.stars ? `class=${opts.stars}` : null, opts.apartments ? "ht_id=201" : null].filter(Boolean).join(";");
  if (filters) u.searchParams.set("nflt", filters);
  if (opts.byPrice) u.searchParams.set("order", "price");
  return u.toString();
}

const gygSearch = (query: string) => `https://www.getyourguide.es/s/?q=${enc(query)}`;

const gyg = (query: string, label: string, detail?: string): OutboundLink => ({
  partner: "GetYourGuide",
  kind: "search",
  label,
  detail,
  href: affiliate("getyourguide", gygSearch(query), "viajes"),
});

const civitatis = (ctx: TripStepsContext, label: string): OutboundLink =>
  ctx.destination.civitatisSlug
    ? {
        partner: "Civitatis",
        kind: "search",
        label,
        detail: "En español",
        href: affiliate("civitatis", `https://www.civitatis.com/es/${ctx.destination.civitatisSlug}/`, "viajes"),
      }
    : gyg(ctx.destination.name, label);

const tiqets = (city: string, label = "Entradas a museos y monumentos"): OutboundLink => ({
  partner: "Tiqets",
  kind: "search",
  label,
  detail: "Sin colas",
  href: affiliate("tiqets", `https://www.tiqets.com/es/search?q=${enc(city)}`, "viajes"),
});

const blablacar = (ctx: TripStepsContext, label = "Buscar coche compartido o bus"): OutboundLink => ({
  partner: "BlaBlaCar",
  kind: "search",
  label,
  detail: "Con la fecha y las plazas ya puestas",
  href: affiliate(
    "blablacar",
    `https://www.blablacar.es/search?fn=${enc(ctx.origin.name)}&tn=${enc(ctx.destination.name)}&db=${ctx.depart}&seats=${ctx.travelers}`,
    "viajes",
  ),
});

/**
 * Reserva de un plan de viaje, paso a paso y en el orden en que hay que
 * hacerla. Cada enlace abre la búsqueda ya filtrada con las fechas y las
 * personas. El orden es el de utilidad para quien viaja, nunca el de comisión.
 */
export function tripSteps(ctx: TripStepsContext): TripStep[] {
  const { tier, mode, destination: d } = ctx;
  const city = d.name;
  const steps: TripStep[] = [];

  steps.push({
    title: "Cómo llegar desde tu casa",
    links: [
      {
        partner: "Rome2Rio",
        kind: "search",
        label: "Ver cómo llegar puerta a puerta",
        detail: "Todas las formas de ir, con tiempos",
        href: affiliate("rome2rio", `https://www.rome2rio.com/map/${urlSlug(ctx.origin.name)}/${urlSlug(city)}`, "viajes"),
      },
    ],
  });

  if (mode === "avion" && ctx.airport) {
    const o = ctx.airport.iata.toLowerCase();
    const dest = d.iata.toLowerCase();
    const cabin = tier === "top" ? "premiumeconomy" : "economy";
    const links: OutboundLink[] = [];
    if (tier === "budget" && ctx.flight) {
      links.push({ partner: "Aviasales", kind: "search", label: `Ver el vuelo desde ${formatEUR(ctx.flight.perPerson)}`, detail: "El más barato encontrado para esa ruta", href: ctx.flight.href });
    }
    links.push({
      partner: "Skyscanner",
      kind: "search",
      label: "Comparar vuelos",
      detail: "Con tus fechas y viajeros",
      href: affiliate(
        "skyscanner",
        `https://www.skyscanner.es/transporte/vuelos/${o}/${dest}/${shortDate(ctx.depart)}/${shortDate(ctx.return)}/?adultsv2=${ctx.travelers}&cabinclass=${cabin}`,
        "viajes",
      ),
    });
    const q = `Flights from ${ctx.airport.city} to ${city} on ${ctx.depart} through ${ctx.return}`;
    links.push({
      partner: "Google Flights",
      kind: "search",
      label: "Ver en Google Flights",
      href: affiliate("googleflights", `https://www.google.com/travel/flights?q=${enc(q)}&hl=es&curr=EUR`, "viajes"),
    });
    steps.push({ title: tier === "budget" ? "Reserva el vuelo más barato" : "Reserva los vuelos", links });
  } else if (mode === "coche") {
    steps.push({
      title: "Planifica la ruta",
      links: [
        {
          partner: "Google Maps",
          kind: "search",
          label: "Ver ruta en coche",
          href: affiliate(
            "googlemaps",
            `https://www.google.com/maps/dir/?api=1&origin=${enc(ctx.origin.name)}&destination=${enc(city)}&travelmode=driving`,
            "viajes",
          ),
        },
      ],
    });
  } else if (tier === "budget") {
    steps.push({ title: "Reserva bus o coche compartido", links: [blablacar(ctx)] });
  } else {
    steps.push({
      title: "Reserva el tren",
      links: [
        {
          partner: "Google",
          kind: "search",
          label: "Buscar trenes",
          detail: "Horarios y precios de todas las compañías",
          href: affiliate("trenes", `https://www.google.com/search?q=${enc(`tren ${ctx.origin.name} ${city} ${ctx.depart}`)}`, "viajes"),
        },
        blablacar(ctx, "Alternativa más barata"),
      ],
    });
  }

  // En el plan barato se usa el transporte público, así que no hay traslado que reservar.
  if (mode === "avion" && tier !== "budget") {
    const label = tier === "top" ? "Conductor esperándote a la llegada" : "Traslado privado, sin esperas ni maletas a cuestas";
    steps.push({
      title: "Reserva el traslado al hotel",
      links: [
        d.transferSlug
          ? {
              partner: "Welcome Pickups",
              kind: "search",
              label,
              detail: "Precio cerrado",
              href: affiliate("welcomepickups", `https://www.welcomepickups.com/${d.transferSlug}/`, "viajes"),
            }
          : gyg(`traslado aeropuerto ${city}`, label),
      ],
    });
  }

  const booking = (label: string, opts: Parameters<typeof bookingStay>[2], detail = "Con tus fechas y viajeros"): OutboundLink => ({
    partner: "Booking.com",
    kind: "search",
    label,
    detail,
    href: affiliate("booking", bookingStay(city, ctx, opts), "viajes"),
  });
  steps.push({
    title: "Reserva el alojamiento",
    links:
      tier === "budget"
        ? [
            booking("Alojamientos más baratos", { byPrice: true }),
            { partner: "Hostelworld", kind: "search", label: `Hostales en ${city}`, href: affiliate("hostelworld", "https://www.hostelworld.com/", "viajes") },
          ]
        : tier === "value"
          ? [booking("Hoteles 3★", { stars: 3 }), booking("Apartamentos", { apartments: true })]
          : [booking("Hoteles 5★", { stars: 5 })],
  });

  const slug = d.civitatisSlug;
  steps.push({
    title: "Reserva actividades",
    links:
      tier === "budget"
        ? [civitatis(ctx, "Free tours y actividades"), tiqets(city)]
        : tier === "value"
          ? [civitatis(ctx, "Actividades en español"), slug ? gyg(city, "Tours y entradas") : tiqets(city)]
          : [gyg(`tour privado ${city}`, "Tours privados"), slug ? civitatis(ctx, "Actividades en español") : tiqets(city, "Entradas sin colas")],
  });

  const before: OutboundLink[] = [];
  if (d.esimSlug) {
    before.push({
      partner: "Airalo",
      kind: "shop",
      label: "eSIM de datos: sin roaming ni tarjetas",
      href: affiliate("airalo", `https://www.airalo.com/${d.esimSlug}-esim`, "viajes"),
    });
  }
  // Seguro de viaje (Awin): solo cuando se sale del país, que es cuando cubre algo que no cubre la sanidad pública.
  if (d.country !== ctx.origin.country) {
    before.push({
      partner: "Assist Card",
      kind: "compare",
      label: "Seguro de viaje",
      detail: "Asistencia médica y cancelación fuera de España",
      href: affiliate("assistcard", "https://www.assistcard.com/es", "viajes"),
    });
  }
  if (before.length > 0) steps.push({ title: "Antes de salir", links: before });

  return steps;
}

/** Entradas para una atracción concreta del «qué ver». */
export const attractionLink = (attraction: string, city: string): OutboundLink => gyg(`${attraction} ${city}`, "Entradas");

/** Para destinos sin guía propia: tours y entradas ya filtrados por la ciudad. */
export const cityDiscoveryLinks = (city: string): OutboundLink[] => [gyg(city, "Tours y actividades"), tiqets(city, "Entradas sin colas")];
