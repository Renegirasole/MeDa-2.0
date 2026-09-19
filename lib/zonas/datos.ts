import MUNIS from "@/lib/data/zonas/municipios.json";
import SECCIONES from "@/lib/data/zonas/secciones.json";
import type { RentStats, SaleStats, Zone } from "./tipos";

/**
 * Datos de zona, solo servidor (los JSON pesan ~1,4 MB).
 *
 * - Alquiler: Sistema Estatal de Referencia del Precio del Alquiler de Vivienda (MIVAU),
 *   explotación de datos fiscales. €/m² al mes en vivienda colectiva, por sección censal y municipio.
 * - Venta: valor tasado medio de vivienda libre (Ministerio de Transportes), €/m² por municipio
 *   (más de 25.000 habitantes) y por provincia.
 *
 * Se regeneran con `python scripts/datos-tasador.py <carpeta>`.
 */

type RentTuple = [number, number, number, number, number | null];
type SaleTuple = [number, number | null, number | null];
interface MuniRow {
  n: string;
  p: string;
  r: RentTuple | null;
  s: SaleTuple | null;
}
interface ProvRow {
  n: string;
  r: RentTuple | null;
  s: number | null;
}
/** [distrito+sección, lat, lng, p25, mediana, p75, viviendas] */
type SectionRow = [string, number, number, number, number, number, number];

const DB = MUNIS as unknown as {
  meta: { rentYear: number; salePeriod: string };
  municipios: Record<string, MuniRow>;
  provincias: Record<string, ProvRow>;
};
const SECTIONS = SECCIONES as unknown as Record<string, SectionRow[]>;

export const ZONE_SOURCES = {
  rentYear: DB.meta.rentYear,
  salePeriod: DB.meta.salePeriod,
} as const;

const rent = (t: RentTuple | null): RentStats | null =>
  t ? { p25: t[0], median: t[1], p75: t[2], count: t[3], area: t[4] } : null;

const sale = (t: SaleTuple | null): SaleStats | null => (t ? { total: t[0], new: t[1], old: t[2] } : null);

/** Distancia aproximada en metros (suficiente para elegir la sección censal más cercana). */
function distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat1 - lat2) * 111_320;
  const dLng = (lng1 - lng2) * 111_320 * Math.cos((lat1 * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** Sección censal del municipio cuyo centro queda más cerca del punto. */
function nearestSection(muniCode: string, lat: number, lng: number): SectionRow | null {
  const list = SECTIONS[muniCode];
  if (!list?.length) return null;
  let best = list[0];
  let bestD = Infinity;
  for (const s of list) {
    const d = distance(lat, lng, s[1], s[2]);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  // Si el punto cae lejísimos de cualquier sección con datos, no es representativo.
  return bestD > 6000 ? null : best;
}

export function findZone(muniCode: string, lat: number | null, lng: number | null): Zone | null {
  const muni = DB.municipios[muniCode];
  const provCode = muni?.p ?? muniCode.slice(0, 2);
  const prov = DB.provincias[provCode];
  if (!muni && !prov) return null;

  const section = lat !== null && lng !== null ? nearestSection(muniCode, lat, lng) : null;
  const muniRent = rent(muni?.r ?? null);
  const provRent = rent(prov?.r ?? null);
  const sectionRent: RentStats | null = section
    ? { p25: section[3], median: section[4], p75: section[5], count: section[6], area: null }
    : null;

  const [zoneRent, rentLevel] = sectionRent
    ? ([sectionRent, "barrio"] as const)
    : muniRent
      ? ([muniRent, "municipio"] as const)
      : provRent
        ? ([provRent, "provincia"] as const)
        : ([null, null] as const);

  const muniSale = sale(muni?.s ?? null);
  const provSale = prov?.s ? { total: prov.s, new: null, old: null } : null;
  const [zoneSale, saleLevel] = muniSale
    ? ([muniSale, "municipio"] as const)
    : provSale
      ? ([provSale, "provincia"] as const)
      : ([null, null] as const);

  return {
    level: rentLevel ?? saleLevel ?? "provincia",
    muniCode,
    muniName: muni?.n ?? "",
    provCode,
    provName: prov?.n ?? "",
    sectionCode: section ? muniCode + section[0] : null,
    rent: zoneRent,
    rentLevel,
    muniRent,
    sale: zoneSale,
    saleLevel,
  };
}
