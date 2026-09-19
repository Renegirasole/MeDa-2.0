import MUNIS from "@/lib/data/zonas/municipios.json";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { mortgageRow, MORTGAGE_ASSUMPTIONS, type MortgageRow } from "@/lib/guides/mortgage";

/**
 * Precio de la vivienda por municipio (solo servidor): las páginas /precio-vivienda/…
 *
 * Mismos datos que el Tasador (ver lib/zonas/datos.ts): valor tasado del Ministerio de
 * Transportes y alquiler declarado a Hacienda. Aquí solo se usan los municipios que tienen
 * valor tasado propio, es decir, los de más de 25.000 habitantes.
 */

interface Row {
  n: string;
  p: string;
  r: [number, number, number, number, number | null] | null;
  s: [number, number | null, number | null] | null;
}

const DB = MUNIS as unknown as {
  meta: { rentYear: number; salePeriod: string; nationalSale: number | null };
  municipios: Record<string, Row>;
  provincias: Record<string, { n: string; r: Row["r"]; s: number | null }>;
};

export const PRICE_SOURCES = DB.meta;

export const HOUSING = CATEGORY_BY_SLUG["comprar-vivienda"];
export const RENTING = CATEGORY_BY_SLUG["alquilar-vivienda"];

/** Tamaños de piso de las tablas: del pequeño al familiar. */
export const AREAS = [50, 60, 70, 80, 90, 100, 120] as const;
export const HEADLINE_AREA = 80;

/** "Palmas de Gran Canaria, Las" → "Las Palmas de Gran Canaria"; "Castellón/Castelló" → "Castellón" */
export function townName(name: string): string {
  const [base, article] = name.split("/")[0].split(/,\s*/);
  return article ? `${article} ${base}` : base;
}

/** "Palmas de Gran Canaria, Las" → "las-palmas-de-gran-canaria" */
export function townSlug(name: string): string {
  return townName(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface Town {
  code: string;
  slug: string;
  name: string;
  provCode: string;
  provName: string;
  /** €/m² de venta (valor tasado medio) */
  saleUnit: number;
  /** €/m² al mes de alquiler: mediana, P25 y P75 */
  rentUnit: number | null;
  rentLow: number | null;
  rentHigh: number | null;
  /** Superficie media de las viviendas alquiladas, m² */
  typicalArea: number | null;
  /** €/m² de venta de la provincia y de España */
  provUnit: number | null;
  nationalUnit: number | null;
}

const town = (code: string, row: Row): Town | null => {
  if (!row.s) return null;
  const prov = DB.provincias[row.p];
  return {
    code,
    slug: townSlug(row.n),
    name: townName(row.n),
    provCode: row.p,
    provName: prov?.n ? townName(prov.n) : "",
    saleUnit: row.s[0],
    rentUnit: row.r?.[1] ?? null,
    rentLow: row.r?.[0] ?? null,
    rentHigh: row.r?.[2] ?? null,
    typicalArea: row.r?.[4] ?? null,
    provUnit: prov?.s ?? null,
    nationalUnit: DB.meta.nationalSale,
  };
};

export const TOWNS: Town[] = Object.entries(DB.municipios)
  .map(([code, row]) => town(code, row))
  .filter((t): t is Town => t !== null)
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

export const TOWN_BY_SLUG: Record<string, Town> = Object.fromEntries(TOWNS.map((t) => [t.slug, t]));

export const TOWN_PATHS = TOWNS.map((t) => `/precio-vivienda/${t.slug}`);

export interface TownCase {
  area: number;
  price: number;
  /** Hipoteca por el 80 % del precio, a 30 años */
  mortgage: MortgageRow;
  /** Alquiler al mes con la mediana del municipio */
  rent: number | null;
  /** Sueldo neto para que el alquiler y los suministros no pasen de la referencia */
  rentIncome: number | null;
}

const up = (v: number, step: number) => Math.ceil(v / step) * step;

export function townCase(t: Town, area: number): TownCase {
  const price = Math.round((t.saleUnit * area) / 1000) * 1000;
  const rent = t.rentUnit ? Math.round((t.rentUnit * area) / 10) * 10 : null;
  return {
    area,
    price,
    mortgage: mortgageRow(price * MORTGAGE_ASSUMPTIONS.financedShare),
    rent,
    rentIncome: rent ? up((rent + RENTING.defaults.monthlyRunningCosts) / RENTING.guideline, 10) : null,
  };
}

/** Municipios de la misma provincia, para enlazar entre ellos. */
export const neighbours = (t: Town, max = 8): Town[] => TOWNS.filter((x) => x.provCode === t.provCode && x.code !== t.code).slice(0, max);

/** Cuánto se separa el municipio de la media de España, en tanto por uno. */
export const vsNational = (t: Town): number | null => (t.nationalUnit ? t.saleUnit / t.nationalUnit - 1 : null);
