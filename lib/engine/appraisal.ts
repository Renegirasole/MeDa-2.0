import { quantile } from "./math";

/**
 * Tasador por comparables: solo usa los anuncios que introduce el usuario.
 * No hay datos de mercado inventados.
 */

export interface AreaComparable {
  price: number;
  area: number;
}

export interface KmComparable {
  price: number;
  km: number;
}

export interface Appraisal {
  quick: number;
  market: number;
  ambitious: number;
  /** €/m² de mercado (solo inmuebles) */
  unitPrice: number | null;
  used: number;
}

export const MIN_COMPARABLES = 3;

const roundTo = (v: number, step: number) => Math.round(v / step) * step;

export function appraiseByArea(comps: AreaComparable[], area: number, step = 1000): Appraisal | null {
  const valid = comps.filter((c) => c.price > 0 && c.area > 0);
  if (valid.length < MIN_COMPARABLES || area <= 0) return null;
  const unit = valid.map((c) => c.price / c.area);
  const [q1, q2, q3] = [0.25, 0.5, 0.75].map((q) => quantile(unit, q));
  return {
    quick: roundTo(q1 * area, step),
    market: roundTo(q2 * area, step),
    ambitious: roundTo(q3 * area, step),
    unitPrice: q2,
    used: valid.length,
  };
}

/** Regresión lineal precio ~ km. Si los km no varían, equivale a la media. */
export function appraiseByKm(comps: KmComparable[], km: number, step = 100): Appraisal | null {
  const valid = comps.filter((c) => c.price > 0 && c.km >= 0);
  if (valid.length < MIN_COMPARABLES || km < 0) return null;
  const n = valid.length;
  const mx = valid.reduce((a, c) => a + c.km, 0) / n;
  const my = valid.reduce((a, c) => a + c.price, 0) / n;
  const sxx = valid.reduce((a, c) => a + (c.km - mx) ** 2, 0);
  const slope = sxx > 0 ? valid.reduce((a, c) => a + (c.km - mx) * (c.price - my), 0) / sxx : 0;
  // Más km nunca suben el precio: si los datos dicen lo contrario, se ignora la pendiente.
  const b = Math.min(0, slope);
  const predicted = my + b * (km - mx);
  const residuals = valid.map((c) => c.price - (my + b * (c.km - mx)));
  return {
    quick: Math.max(0, roundTo(predicted + quantile(residuals, 0.25), step)),
    market: Math.max(0, roundTo(predicted, step)),
    ambitious: Math.max(0, roundTo(predicted + quantile(residuals, 0.75), step)),
    unitPrice: null,
    used: n,
  };
}
