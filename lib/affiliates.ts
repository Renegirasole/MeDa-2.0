import type { CategorySlug } from "@/lib/data/categories";
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

export function travelLinks(destination: string): OutboundLink[] {
  const booking = new URL("https://www.booking.com/searchresults.es.html");
  booking.searchParams.set("ss", destination);
  return [
    {
      partner: "Booking.com",
      kind: "search",
      label: `Alojamiento en ${destination}`,
      detail: "Búsqueda con el destino ya puesto",
      href: affiliate("booking", booking.toString(), "viajes"),
    },
    { partner: "Skyscanner", kind: "search", label: "Buscar vuelos", href: affiliate("skyscanner", "https://www.skyscanner.es/", "viajes") },
  ];
}
