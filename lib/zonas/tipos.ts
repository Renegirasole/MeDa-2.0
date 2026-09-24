/** Datos de zona y tasación automática. Todo sale de fuentes públicas; ver lib/zonas/datos.ts. */

export type ZoneMode = "venta" | "alquiler";

/** Alquiler declarado a Hacienda (SERPAVI): €/m² al mes, en cuartiles. */
export interface RentStats {
  /** Percentil 25 */
  p25: number;
  /** Mediana */
  median: number;
  /** Percentil 75 */
  p75: number;
  /** Viviendas en alquiler contadas */
  count: number;
  /** Superficie media de esas viviendas (m²) */
  area: number | null;
}

/** Valor tasado medio de vivienda libre (Ministerio de Transportes), €/m². */
export interface SaleStats {
  total: number;
  /** Hasta cinco años de antigüedad */
  new: number | null;
  /** Con más de cinco años */
  old: number | null;
}

export type ZoneLevel = "barrio" | "municipio" | "provincia";

export interface Zone {
  /** Nivel del dato más fino que hemos encontrado para el alquiler */
  level: ZoneLevel;
  muniCode: string;
  muniName: string;
  provCode: string;
  provName: string;
  /** Sección censal (INE), si la hay */
  sectionCode: string | null;
  rent: RentStats | null;
  /** Nivel del dato de alquiler que se está usando */
  rentLevel: ZoneLevel | null;
  /** Alquiler del municipio, para ajustar el precio de venta al barrio */
  muniRent: RentStats | null;
  sale: SaleStats | null;
  saleLevel: ZoneLevel | null;
}

export interface Address {
  id: string;
  /** Dirección completa tal y como la devuelve CartoCiudad */
  label: string;
  muniCode: string;
  muniName: string;
  provName: string;
  postalCode: string;
  lat: number;
  lng: number;
  /** Referencia catastral del edificio, si la hay */
  refCatastral: string | null;
}

/** Vivienda del edificio según Catastro. */
export interface Dwelling {
  /** Referencia catastral completa (20 caracteres) */
  ref: string;
  /** Escalera, planta y puerta ya montados: "Esc. A · 3º · IZ" */
  label: string;
  floor: string;
  /** Planta en número: 0 = bajo, 1 = primero… null si no se sabe */
  level: number | null;
  door: string;
  /** Superficie construida, m² */
  area: number;
  /** Año de construcción */
  year: number | null;
  use: string;
}

/** Anuncios publicados ahora mismo cerca de una dirección (API oficial de idealista). */
export interface ListingStats {
  /** €/m² de los anuncios: percentil 25, mediana y 75 */
  p25: number;
  median: number;
  p75: number;
  /** Anuncios usados */
  count: number;
  /** Metros del piso típico anunciado */
  medianArea: number;
  /** Cada anuncio usado, como [metros, €/m²]: para comparar con pisos de tu tamaño */
  sample: Array<[number, number]>;
  /** Radio de búsqueda en metros */
  radius: number;
  /** Cuándo se consultó (ISO) */
  fetchedAt: string;
  source: "idealista";
}

export interface ZoneEstimate {
  mode: ZoneMode;
  /** Anuncios de tamaño parecido al tuyo con los que se ha calculado (0 = se usó toda la zona) */
  matched?: number;
  /** €/m² usados (al mes en alquiler, de venta en compra) */
  unitPrice: number;
  quick: number;
  market: number;
  ambitious: number;
}
