/**
 * Datos por país para estimar viajes a cualquier parte del mundo.
 *
 * `PRICE_INDEX` compara el coste turístico medio (alojamiento, comida,
 * transporte local) con Madrid = 1. Es una aproximación orientativa para los
 * destinos que no están en el catálogo curado de `lib/data/travel.ts`, que
 * lleva cifras revisadas a mano. El precio real siempre se ve al reservar.
 *
 * Códigos ISO 3166-1 alfa-2 (los mismos que devuelve el buscador de lugares).
 */

export const PRICE_INDEX: Record<string, number> = {
  // Europa occidental y nórdica
  ES: 1, PT: 0.85, FR: 1.25, AD: 1, MC: 1.9, IT: 1.1, SM: 1, VA: 1.1, MT: 0.95,
  GB: 1.45, IE: 1.4, BE: 1.2, NL: 1.35, LU: 1.4, DE: 1.15, AT: 1.2, CH: 1.9, LI: 1.8,
  DK: 1.5, SE: 1.35, NO: 1.7, FI: 1.35, IS: 1.8,
  // Europa central y oriental
  PL: 0.7, CZ: 0.8, SK: 0.75, HU: 0.7, SI: 0.9, HR: 0.95, BA: 0.6, RS: 0.6, ME: 0.75, MK: 0.55, AL: 0.6,
  GR: 0.9, CY: 1, BG: 0.55, RO: 0.6, MD: 0.5, UA: 0.5, BY: 0.5, LT: 0.75, LV: 0.75, EE: 0.85,
  RU: 0.7, GE: 0.55, AM: 0.55, AZ: 0.6, TR: 0.6,
  // Oriente Medio y norte de África
  MA: 0.55, DZ: 0.5, TN: 0.5, EG: 0.45, IL: 1.5, JO: 0.85, LB: 0.8, AE: 1.4, QA: 1.3, SA: 1.1, OM: 1, BH: 1.1, KW: 1.1,
  // África subsahariana
  SN: 0.65, CV: 0.75, KE: 0.7, TZ: 0.75, ZA: 0.6, MU: 0.9, MG: 0.5, NG: 0.6, GH: 0.6, ET: 0.5, RW: 0.7, NA: 0.7, BW: 0.8,
  // Asia
  JP: 1.15, KR: 1, CN: 0.75, HK: 1.4, MO: 1.2, TW: 0.9, SG: 1.5, TH: 0.5, VN: 0.45, KH: 0.45, LA: 0.45, MY: 0.55,
  ID: 0.5, PH: 0.5, IN: 0.4, LK: 0.45, NP: 0.4, MV: 1.6, PK: 0.4, BD: 0.4, MN: 0.55, KZ: 0.55, UZ: 0.45,
  // América
  US: 1.5, CA: 1.3, MX: 0.65, CU: 0.7, DO: 0.8, PR: 1.2, JM: 0.9, BS: 1.5, CR: 0.85, PA: 0.8, GT: 0.55, HN: 0.55,
  NI: 0.5, SV: 0.55, BZ: 0.8, CO: 0.55, VE: 0.6, EC: 0.6, PE: 0.55, BO: 0.45, CL: 0.75, AR: 0.6, UY: 0.85, PY: 0.5, BR: 0.65,
  // Oceanía
  AU: 1.35, NZ: 1.3, FJ: 0.9, PF: 1.6,
};

/** Índice de precios de un país respecto a Madrid. 1 si no lo tenemos. */
export function priceIndex(code: string | null | undefined): number {
  if (!code) return 1;
  return PRICE_INDEX[code.toUpperCase()] ?? 1;
}

/**
 * Países entre los que un viaje por tierra (tren, bus, coche) es razonable.
 * Entre países fuera de este bloque, el planificador propone avión.
 */
export const CONTINENTAL_EUROPE: ReadonlySet<string> = new Set([
  "ES", "PT", "FR", "AD", "MC", "IT", "SM", "VA", "CH", "LI", "AT", "DE", "BE", "NL", "LU", "GB",
  "DK", "SE", "NO", "FI", "PL", "CZ", "SK", "HU", "SI", "HR", "BA", "RS", "ME", "MK", "AL", "GR",
  "BG", "RO", "LT", "LV", "EE",
]);

/**
 * UE + Espacio Económico Europeo + Suiza. Dentro de esta zona la mayoría de
 * tarifas móviles españolas incluyen roaming, así que no sugerimos eSIM.
 */
export const ROAMING_EUROPE: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "CH", "AD", "MC", "SM", "VA",
]);

/** Países sin eSIM de Airalo (sanciones o sin cobertura). */
const NO_ESIM: ReadonlySet<string> = new Set(["RU", "BY", "IR", "KP", "SY", "CU"]);

/** Nombres de Airalo que no coinciden con el nombre en inglés estándar. */
const ESIM_SLUG: Record<string, string> = {
  CZ: "czech-republic",
  TR: "turkey",
  US: "united-states",
  GB: "united-kingdom",
  KR: "south-korea",
  AE: "united-arab-emirates",
  VN: "vietnam",
  HK: "hong-kong",
  MO: "macau",
  TW: "taiwan",
  LA: "laos",
  MD: "moldova",
  BA: "bosnia-and-herzegovina",
  MK: "north-macedonia",
  DO: "dominican-republic",
  CI: "ivory-coast",
};

export const slugify = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Slug de la página de eSIM de Airalo para un país (CH → switzerland), o null si no aplica. */
export function esimSlug(code: string | null | undefined): string | null {
  if (!code) return null;
  const upper = code.toUpperCase();
  if (NO_ESIM.has(upper)) return null;
  if (ESIM_SLUG[upper]) return ESIM_SLUG[upper];
  let name: string | undefined;
  try {
    name = new Intl.DisplayNames(["en"], { type: "region" }).of(upper);
  } catch {
    return null;
  }
  if (!name || name === upper) return null;
  return slugify(name);
}

/** ¿Tiene sentido ofrecer eSIM? Solo fuera de la zona de roaming europeo y en otro país. */
export function needsEsim(from: string, to: string | null): boolean {
  if (!to || from === to) return false;
  return !ROAMING_EUROPE.has(to);
}
