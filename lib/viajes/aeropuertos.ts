/**
 * Aeropuertos de España para elegir desde dónde volar. Coordenadas del
 * aeropuerto. `size` simplifica la oferta de rutas: 3 = gran hub, 2 = buena
 * oferta internacional, 1 = regional con pocas rutas.
 */

export type Island = "mallorca" | "ibiza" | "menorca" | "tenerife" | "gran-canaria" | "lanzarote" | "fuerteventura";

export interface Airport {
  iata: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
  size: 1 | 2 | 3;
  island?: Island;
}

export const AIRPORTS: Airport[] = [
  { iata: "MAD", name: "Madrid-Barajas", city: "Madrid", lat: 40.4983, lon: -3.5676, size: 3 },
  { iata: "BCN", name: "Barcelona-El Prat", city: "Barcelona", lat: 41.2974, lon: 2.0833, size: 3 },
  { iata: "AGP", name: "Málaga-Costa del Sol", city: "Málaga", lat: 36.6749, lon: -4.4991, size: 3 },
  { iata: "ALC", name: "Alicante-Elche", city: "Alicante", lat: 38.2822, lon: -0.5582, size: 3 },
  { iata: "PMI", name: "Palma de Mallorca", city: "Palma", lat: 39.5517, lon: 2.7388, size: 3, island: "mallorca" },
  { iata: "SVQ", name: "Sevilla", city: "Sevilla", lat: 37.418, lon: -5.8931, size: 2 },
  { iata: "VLC", name: "Valencia", city: "Valencia", lat: 39.4893, lon: -0.4816, size: 2 },
  { iata: "BIO", name: "Bilbao", city: "Bilbao", lat: 43.3011, lon: -2.9106, size: 2 },
  { iata: "SCQ", name: "Santiago-Rosalía de Castro", city: "Santiago de Compostela", lat: 42.8963, lon: -8.4151, size: 2 },
  { iata: "IBZ", name: "Ibiza", city: "Ibiza", lat: 38.8729, lon: 1.3731, size: 2, island: "ibiza" },
  { iata: "TFS", name: "Tenerife Sur", city: "Tenerife", lat: 28.0445, lon: -16.5725, size: 3, island: "tenerife" },
  { iata: "TFN", name: "Tenerife Norte", city: "Santa Cruz de Tenerife", lat: 28.4827, lon: -16.3415, size: 2, island: "tenerife" },
  { iata: "LPA", name: "Gran Canaria", city: "Las Palmas de Gran Canaria", lat: 27.9319, lon: -15.3866, size: 3, island: "gran-canaria" },
  { iata: "ACE", name: "Lanzarote", city: "Arrecife", lat: 28.9455, lon: -13.6052, size: 2, island: "lanzarote" },
  { iata: "FUE", name: "Fuerteventura", city: "Puerto del Rosario", lat: 28.4527, lon: -13.8638, size: 2, island: "fuerteventura" },
  { iata: "MAH", name: "Menorca", city: "Mahón", lat: 39.8626, lon: 4.2186, size: 1, island: "menorca" },
  { iata: "GRX", name: "Granada-Jaén", city: "Granada", lat: 37.1887, lon: -3.7774, size: 1 },
  { iata: "XRY", name: "Jerez", city: "Jerez de la Frontera", lat: 36.7446, lon: -6.0601, size: 1 },
  { iata: "LEI", name: "Almería", city: "Almería", lat: 36.8439, lon: -2.3701, size: 1 },
  { iata: "RMU", name: "Región de Murcia", city: "Murcia", lat: 37.803, lon: -1.125, size: 1 },
  { iata: "OVD", name: "Asturias", city: "Oviedo / Gijón", lat: 43.5636, lon: -6.0346, size: 1 },
  { iata: "SDR", name: "Santander", city: "Santander", lat: 43.4271, lon: -3.82, size: 1 },
  { iata: "VGO", name: "Vigo", city: "Vigo", lat: 42.2318, lon: -8.6268, size: 1 },
  { iata: "LCG", name: "A Coruña", city: "A Coruña", lat: 43.3021, lon: -8.3773, size: 1 },
  { iata: "ZAZ", name: "Zaragoza", city: "Zaragoza", lat: 41.6662, lon: -1.0415, size: 1 },
  { iata: "REU", name: "Reus", city: "Tarragona", lat: 41.1474, lon: 1.1672, size: 1 },
  { iata: "GRO", name: "Girona", city: "Girona", lat: 41.901, lon: 2.7606, size: 1 },
  { iata: "VIT", name: "Vitoria", city: "Vitoria-Gasteiz", lat: 42.8828, lon: -2.7244, size: 1 },
  { iata: "EAS", name: "San Sebastián", city: "San Sebastián", lat: 43.3565, lon: -1.7906, size: 1 },
  { iata: "PNA", name: "Pamplona", city: "Pamplona", lat: 42.77, lon: -1.6463, size: 1 },
  { iata: "BJZ", name: "Badajoz", city: "Badajoz", lat: 38.8913, lon: -6.8213, size: 1 },
];

const R = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Un punto a menos de esto de un aeropuerto de isla se considera en esa isla. */
export const ISLAND_RADIUS_KM = 80;
/** Radio en el que se prefiere un aeropuerto con buenas rutas antes que el más cercano. */
export const HUB_RADIUS_KM = 220;

/** Isla balear o canaria de un punto de España, si está junto al aeropuerto de una isla. */
export function islandAt(lat: number, lon: number): Island | undefined {
  let best: { a: Airport; km: number } | undefined;
  for (const a of AIRPORTS) {
    const km = distanceKm(lat, lon, a.lat, a.lon);
    if (!best || km < best.km) best = { a, km };
  }
  return best && best.a.island && best.km <= ISLAND_RADIUS_KM ? best.a.island : undefined;
}

export interface AirportChoice {
  /** Desde donde conviene volar: el más cercano con buenas rutas */
  recommended: Airport;
  /** El más cercano, si es otro (suele tener menos rutas) */
  nearest: Airport;
  /** Kilómetros en línea recta de casa al recomendado */
  km: number;
}

/**
 * Aeropuerto de salida en España: el más cercano con buena oferta de rutas
 * (tamaño 2 o más) dentro de 220 km; si no hay, el más cercano. En una isla,
 * siempre uno de esa isla. Jerez → Sevilla, avisando de que Jerez está más cerca.
 */
export function chooseAirports(point: { lat: number; lon: number; island?: Island }): AirportChoice {
  const candidates = AIRPORTS.filter((a) => (point.island ? a.island === point.island : !a.island));
  const ranked = candidates
    .map((a) => ({ a, km: distanceKm(point.lat, point.lon, a.lat, a.lon) }))
    .sort((x, y) => x.km - y.km);
  const nearest = ranked[0];
  const hub = ranked.find((c) => c.a.size >= 2 && c.km <= HUB_RADIUS_KM);
  const chosen = hub ?? nearest;
  return { recommended: chosen.a, nearest: nearest.a, km: chosen.km };
}
