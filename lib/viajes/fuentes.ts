import { isPlace, MIN_QUERY, type Place } from "./lugares";

/**
 * Fuentes externas del planificador de viajes. Solo se llaman desde el
 * servidor (`app/api/lugares`, `app/api/vuelos`) para poder cachear y cambiar
 * de proveedor sin tocar la interfaz.
 *
 * - Autocompletado de ciudades: API pública de Aviasales, sin token.
 * - Precios de vuelo: Aviasales Data API (Travelpayouts). Necesita
 *   `TRAVELPAYOUTS_TOKEN`; sin él, el planificador sigue funcionando con la
 *   estimación por distancia. El token NUNCA lleva prefijo NEXT_PUBLIC_.
 */

const AUTOCOMPLETE = "https://autocomplete.travelpayouts.com/places2";
const PRICES = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";
const MAX_PLACES = 8;
const IATA = /^[A-Z]{3}$/;

// ——— Ciudades del mundo ———

interface RawPlace {
  type?: unknown;
  code?: unknown;
  name?: unknown;
  country_code?: unknown;
  country_name?: unknown;
  city_code?: unknown;
  city_name?: unknown;
  coordinates?: { lat?: unknown; lon?: unknown } | null;
}

const isCode = (v: unknown): v is string => typeof v === "string" && IATA.test(v);
const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export function placesUrl(term: string, locale = "es"): string {
  const params = new URLSearchParams({ term, locale });
  params.append("types[]", "city");
  params.append("types[]", "airport");
  return `${AUTOCOMPLETE}?${params.toString()}`;
}

/**
 * Convierte la respuesta en ciudades únicas. Los aeropuertos se agrupan en su
 * ciudad (LHR → Londres, LON), de modo que el precio cubre todos sus aeropuertos.
 */
export function normalizePlaces(json: unknown, max = MAX_PLACES, english?: unknown): Place[] {
  if (!Array.isArray(json)) return [];
  const englishNames = new Map(english === undefined ? [] : normalizePlaces(english, 50).map((p) => [p.code, p.name]));
  const seen = new Set<string>();
  const places: Place[] = [];

  for (const item of json as RawPlace[]) {
    if (!item || typeof item !== "object") continue;
    if (item.type !== "city" && item.type !== "airport") continue;

    const isAirport = item.type === "airport";
    const code = isAirport && isCode(item.city_code) ? item.city_code : item.code;
    const name = isAirport && isText(item.city_name) ? item.city_name : item.name;
    const lat = item.coordinates?.lat;
    const lon = item.coordinates?.lon;

    if (!isCode(code) || !isText(name) || !isNumber(lat) || !isNumber(lon)) continue;
    if (typeof item.country_code !== "string" || !/^[A-Z]{2}$/.test(item.country_code)) continue;
    if (seen.has(code)) continue;

    seen.add(code);
    const nameEn = englishNames.get(code);
    places.push({
      code,
      name: name.trim(),
      country: isText(item.country_name) ? item.country_name.trim() : item.country_code,
      countryCode: item.country_code,
      lat,
      lon,
      ...(nameEn ? { nameEn } : {}),
    });
    if (places.length >= max) break;
  }
  return places.filter(isPlace);
}

export async function searchPlaces(term: string, locale = "es"): Promise<Place[]> {
  const clean = term.trim().slice(0, 60);
  if (clean.length < MIN_QUERY) return [];
  const ask = (lang: string) =>
    fetch(placesUrl(clean, lang), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 * 7 },
      signal: AbortSignal.timeout(6000),
    });
  // El nombre en inglés solo sirve para enlaces de partners: si falla, seguimos sin él.
  const [res, resEn] = await Promise.all([ask(locale), locale === "en" ? null : ask("en").catch(() => null)]);
  if (!res.ok) throw new Error(`Autocompletado respondió ${res.status}`);
  const english = resEn?.ok ? await resEn.json().catch(() => null) : null;
  return normalizePlaces(await res.json(), MAX_PLACES, english);
}

// ——— Precios de vuelo ———

export interface FlightPrice {
  /** Ida y vuelta por persona, en euros */
  perPerson: number;
  /** Mes consultado, YYYY-MM */
  month: string;
  airline: string | null;
  stops: number;
  link: string | null;
  /** true cuando el enlace lleva nuestro marker y la reserva nos paga comisión */
  affiliate: boolean;
}

interface RawTicket {
  price?: number;
  airline?: string;
  transfers?: number;
  return_transfers?: number;
  link?: string;
}

export const flightsUrl = (from: string, to: string, month: string, token: string): string =>
  `${PRICES}?${new URLSearchParams({
    origin: from,
    destination: to,
    departure_at: month,
    return_at: month,
    one_way: "false",
    currency: "eur",
    market: "es",
    sorting: "price",
    limit: "5",
    token,
  })}`;

export function normalizeFlights(json: unknown, month: string, marker?: string): FlightPrice | null {
  if (!json || typeof json !== "object") return null;
  const { success, data } = json as { success?: boolean; data?: unknown };
  if (!success || !Array.isArray(data)) return null;

  const tickets = (data as RawTicket[]).filter((t) => typeof t.price === "number" && t.price > 0);
  if (tickets.length === 0) return null;
  const best = tickets.reduce((a, b) => ((b.price ?? Infinity) < (a.price ?? Infinity) ? b : a));

  let link: string | null = null;
  if (best.link) {
    const url = new URL(best.link, "https://www.aviasales.com");
    if (marker) url.searchParams.set("marker", marker);
    link = url.toString();
  }

  return {
    perPerson: Math.round(best.price as number),
    month,
    airline: best.airline ?? null,
    stops: Math.max(best.transfers ?? 0, best.return_transfers ?? 0),
    link,
    affiliate: Boolean(marker && link),
  };
}

/** Mes siguiente al de hoy, en YYYY-MM. Es el horizonte típico de una escapada. */
export function nextMonth(today = new Date()): string {
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * El vuelo ida y vuelta más barato visto para ese mes. Son precios que otras
 * personas han encontrado en búsquedas recientes (la API los guarda unos días),
 * no una cotización en directo: en la web se dice así.
 */
export async function flightPrice(from: string, to: string, month = nextMonth()): Promise<FlightPrice | null> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token || !IATA.test(from) || !IATA.test(to) || !/^\d{4}-\d{2}$/.test(month)) return null;
  const marker = process.env.TRAVELPAYOUTS_MARKER || undefined;

  const res = await fetch(flightsUrl(from, to, month, token), {
    headers: { "Accept-Encoding": "gzip, deflate" },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  return normalizeFlights(await res.json(), month, marker);
}
