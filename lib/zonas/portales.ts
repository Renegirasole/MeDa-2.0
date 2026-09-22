import { get, put } from "@vercel/blob";
import { MIN_SAMPLE, quantile } from "./estadistica";
import type { ListingStats, ZoneMode } from "./tipos";

/**
 * Precios de los anuncios que hay ahora mismo cerca de una dirección, con la API oficial
 * de idealista (https://developers.idealista.com/). Solo servidor.
 *
 * Hace falta pedirles una llave (formulario de su web) y ponerla en las variables
 * IDEALISTA_API_KEY e IDEALISTA_SECRET. Sin llave, MeDa sigue con los datos oficiales
 * del Ministerio: esto es un extra, nunca un requisito.
 *
 * Nunca se raspa la web de ningún portal: sus condiciones lo prohíben.
 *
 * La llave tiene cupo de peticiones, así que cada consulta se guarda por celdas de unos
 * 500 m durante un mes (Vercel Blob). Dos vecinos de la misma calle gastan una sola petición.
 */

const TOKEN_URL = "https://api.idealista.com/oauth/token";
const SEARCH_URL = "https://api.idealista.com/3.5/es/search";
const CACHE_PREFIX = "portales/";
const CACHE_DAYS = 30;
/** Radio de búsqueda: lo bastante cerca para que sea tu zona, no tu ciudad. */
export const RADIUS_M = 750;


export const portalsConfigured = () =>
  Boolean(process.env.IDEALISTA_API_KEY && process.env.IDEALISTA_SECRET && process.env.BLOB_READ_WRITE_TOKEN);

interface Listing {
  price?: unknown;
  size?: unknown;
  propertyType?: unknown;
  operation?: unknown;
}

/**
 * De la lista de anuncios a €/m² en cuartiles. Se quitan los anuncios raros
 * (garajes colados, pisos enormes, precios imposibles) con el criterio de Tukey.
 */
export function aggregateListings(listings: Listing[], radius = RADIUS_M, now = new Date()): ListingStats | null {
  const units: number[] = [];
  const areas: number[] = [];
  for (const l of listings) {
    const price = typeof l.price === "number" ? l.price : NaN;
    const size = typeof l.size === "number" ? l.size : NaN;
    if (!Number.isFinite(price) || !Number.isFinite(size) || size < 20 || size > 500 || price <= 0) continue;
    units.push(price / size);
    areas.push(size);
  }
  if (units.length < MIN_SAMPLE) return null;

  const sorted = [...units].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const clean = sorted.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
  if (clean.length < MIN_SAMPLE) return null;

  const sortedAreas = [...areas].sort((a, b) => a - b);
  const round = (v: number) => Math.round(v * 100) / 100;
  const low = q1 - 1.5 * iqr;
  const high = q3 + 1.5 * iqr;
  const sample: Array<[number, number]> = [];
  for (let i = 0; i < units.length; i++) {
    if (units[i] >= low && units[i] <= high) sample.push([Math.round(areas[i]), round(units[i])]);
  }
  return {
    p25: round(quantile(clean, 0.25)),
    median: round(quantile(clean, 0.5)),
    p75: round(quantile(clean, 0.75)),
    count: clean.length,
    medianArea: Math.round(quantile(sortedAreas, 0.5)),
    sample,
    radius,
    fetchedAt: now.toISOString(),
    source: "idealista",
  };
}

/** Celda de ~500 m: redondear a tres decimales es 0,001° ≈ 110 m, y agrupamos de cinco en cinco. */
export function cellId(lat: number, lng: number): string {
  const snap = (v: number) => (Math.round(v * 200) / 200).toFixed(3);
  return `${snap(lat)}_${snap(lng)}`;
}

const cachePath = (mode: ZoneMode, lat: number, lng: number) => `${CACHE_PREFIX}${mode}/${cellId(lat, lng)}.json`;

const fresh = (stats: ListingStats, now: Date) =>
  now.getTime() - new Date(stats.fetchedAt).getTime() < CACHE_DAYS * 24 * 60 * 60 * 1000;

async function readCache(path: string): Promise<ListingStats | null> {
  try {
    const res = await get(path, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    return JSON.parse(await new Response(res.stream).text()) as ListingStats;
  } catch {
    return null;
  }
}

async function writeCache(path: string, stats: ListingStats) {
  try {
    await put(path, JSON.stringify(stats), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch {
    // Si el almacén falla, la cifra sigue siendo buena: solo gastaremos otra petición.
  }
}

let token: { value: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  if (token && token.expires > Date.now() + 30_000) return token.value;
  const basic = Buffer.from(`${process.env.IDEALISTA_API_KEY}:${process.env.IDEALISTA_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: "grant_type=client_credentials&scope=read",
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`token → ${res.status}`);
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("token vacío");
  token = { value: data.access_token, expires: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return token.value;
}

async function search(mode: ZoneMode, lat: number, lng: number): Promise<ListingStats | null> {
  const body = new URLSearchParams({
    country: "es",
    operation: mode === "alquiler" ? "rent" : "sale",
    propertyType: "homes",
    center: `${lat},${lng}`,
    distance: String(RADIUS_M),
    maxItems: "50",
    numPage: "1",
    order: "distance",
    sort: "asc",
  });
  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`search → ${res.status}`);
  const data = (await res.json()) as { elementList?: Listing[] };
  return aggregateListings(data.elementList ?? []);
}

/**
 * Anuncios de la zona. Devuelve null sin llave, sin cobertura o si el portal falla:
 * el Tasador sigue funcionando con los datos oficiales.
 */
export async function listingStats(mode: ZoneMode, lat: number, lng: number): Promise<ListingStats | null> {
  if (!portalsConfigured()) return null;
  const path = cachePath(mode, lat, lng);
  const now = new Date();
  const cached = await readCache(path);
  if (cached && fresh(cached, now)) return cached;
  try {
    const stats = await search(mode, lat, lng);
    if (stats) await writeCache(path, stats);
    return stats ?? cached;
  } catch {
    return cached; // Cupo agotado o portal caído: lo último que sabíamos, si lo hay.
  }
}
