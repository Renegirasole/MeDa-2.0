import { CITIES, GUIDES, type City, type Guide } from "./catalogo";

/**
 * Lugares del mundo para el planificador de viajes.
 *
 * Todo lo de aquí es puro: ni red ni React. La llamada al buscador vive en
 * `lib/viajes/fuentes.ts` y el cálculo del viaje, en `lib/viajes/plan.ts`.
 */

/** Ciudad con aeropuerto, tal y como la devuelve el buscador mundial. */
export interface Place {
  /** Código IATA de la ciudad (MOW para Moscú) o del aeropuerto si no hay código de ciudad */
  code: string;
  name: string;
  country: string;
  /** ISO 3166-1 alfa-2 */
  countryCode: string;
  lat: number;
  lon: number;
  /** Nombre en inglés, para partners con slugs en inglés (traslados) */
  nameEn?: string;
}

/** Letras mínimas antes de buscar en el mundo. */
export const MIN_QUERY = 2;

/** Radio dentro del cual un resultado del mundo se considera una ciudad del catálogo. */
export const SAME_CITY_KM = 25;

export const normalize = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Valida lo que llega de la API antes de dejarlo entrar en el motor. */
export function isPlace(value: unknown): value is Place {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.code === "string" &&
    /^[A-Z]{3}$/.test(p.code) &&
    typeof p.name === "string" &&
    p.name.trim().length > 0 &&
    typeof p.country === "string" &&
    typeof p.countryCode === "string" &&
    /^[A-Z]{2}$/.test(p.countryCode) &&
    typeof p.lat === "number" &&
    Number.isFinite(p.lat) &&
    Math.abs(p.lat) <= 90 &&
    typeof p.lon === "number" &&
    Number.isFinite(p.lon) &&
    Math.abs(p.lon) <= 180 &&
    (p.nameEn === undefined || typeof p.nameEn === "string")
  );
}

// ——— Catálogo local (sugerencias instantáneas, sin red) ———

export interface CatalogSuggestion {
  id: string;
  name: string;
  detail: string;
}

function score(name: string, q: string): number {
  const n = normalize(name);
  if (!q) return 1;
  if (n === q) return 3;
  if (n.startsWith(q)) return 2;
  if (n.split(/[\s-]/).some((word) => word.startsWith(q)) || n.includes(q)) return 1;
  return 0;
}

function filter<T extends { name: string }>(items: readonly T[], q: string): T[] {
  const nq = normalize(q);
  return items
    .map((item) => ({ item, points: score(item.name, nq) }))
    .filter((x) => x.points > 0)
    .sort((a, b) => b.points - a.points || a.item.name.localeCompare(b.item.name, "es"))
    .map((x) => x.item);
}

export const searchOrigins = (q: string): CatalogSuggestion[] =>
  filter(CITIES, q).map((c) => ({ id: c.id, name: c.name, detail: c.province === c.name ? "España" : `${c.province}, España` }));

export const searchDestinations = (q: string): CatalogSuggestion[] =>
  filter(GUIDES, q).map((g) => ({ id: g.id, name: g.name, detail: g.countryName }));

function nearest<T extends { lat: number; lon: number }>(items: readonly T[], place: Place): T | undefined {
  let best: { item: T; km: number } | undefined;
  for (const item of items) {
    const km = distanceKm(item.lat, item.lon, place.lat, place.lon);
    if (km <= SAME_CITY_KM && (!best || km < best.km)) best = { item, km };
  }
  return best?.item;
}

/** Ciudad de salida del catálogo que corresponde a un lugar del buscador (solo en España). */
export const catalogOrigin = (place: Place): City | undefined => (place.countryCode === "ES" ? nearest(CITIES, place) : undefined);

/** Destino con guía propia («qué ver») que corresponde a un lugar del buscador. */
export const catalogDestination = (place: Place): Guide | undefined => nearest(GUIDES, place);

// ——— Opciones del buscador ———

export type PlaceSelection = { kind: "catalog"; id: string; name: string } | { kind: "place"; place: Place };

export interface PlaceOption {
  key: string;
  group: "catalogo" | "mundo";
  name: string;
  detail: string;
  selection: PlaceSelection;
}

export const MAX_CATALOG = 6;

export const selectionName = (s: PlaceSelection): string => (s.kind === "place" ? s.place.name : s.name);

/**
 * Mezcla las ciudades del catálogo (instantáneas y con más datos) con las del
 * buscador mundial. Un resultado del mundo que es una ciudad del catálogo se
 * muestra como la del catálogo, sin duplicados.
 */
export function buildOptions(kind: "origin" | "destination", q: string, remote: Place[]): PlaceOption[] {
  const search = kind === "origin" ? searchOrigins : searchDestinations;
  const inCatalog = kind === "origin" ? catalogOrigin : catalogDestination;
  const hasQuery = normalize(q).length > 0;

  const catalog = hasQuery ? search(q).slice(0, MAX_CATALOG) : search("");
  const options: PlaceOption[] = catalog.map(catalogOption);
  const ids = new Set(catalog.map((c) => c.id));

  for (const place of remote) {
    const known = inCatalog(place);
    if (known) {
      if (!ids.has(known.id)) {
        ids.add(known.id);
        const suggestion = search(known.name).find((c) => c.id === known.id);
        if (suggestion) options.push(catalogOption(suggestion));
      }
      continue;
    }
    options.push({
      key: `mundo-${place.code}`,
      group: "mundo",
      name: place.name,
      detail: `${place.country} · ${place.code}`,
      selection: { kind: "place", place },
    });
  }
  return options;
}

// ——— Enlace compartible ———

/**
 * La elección cabe en la URL para poder compartir el viaje: `c:roma` para el
 * catálogo y `p:ZRH:CH:47.37:8.54:Zúrich:Zurich` para el resto, así no hace
 * falta volver a preguntar al buscador al abrir el enlace.
 */
export function encodeSelection(s: PlaceSelection): string {
  if (s.kind === "catalog") return `c:${s.id}`;
  const p = s.place;
  return ["p", p.code, p.countryCode, p.lat.toFixed(4), p.lon.toFixed(4), p.name, p.nameEn ?? "", p.country].join(":");
}

export function decodeSelection(raw: string | undefined | null, kind: "origin" | "destination"): PlaceSelection | null {
  if (!raw) return null;
  if (raw.startsWith("c:")) {
    const id = raw.slice(2);
    const known = (kind === "origin" ? CITIES : GUIDES).find((c) => c.id === id);
    return known ? { kind: "catalog", id: known.id, name: known.name } : null;
  }
  if (!raw.startsWith("p:")) return null;
  const [, code, countryCode, lat, lon, name, nameEn, country] = raw.split(":");
  const place = {
    code,
    countryCode,
    lat: Number(lat),
    lon: Number(lon),
    name,
    country: country || countryCode,
    ...(nameEn ? { nameEn } : {}),
  };
  return isPlace(place) ? { kind: "place", place } : null;
}

const catalogOption = (c: CatalogSuggestion): PlaceOption => ({
  key: `catalogo-${c.id}`,
  group: "catalogo",
  name: c.name,
  detail: c.detail,
  selection: { kind: "catalog", id: c.id, name: c.name },
});
