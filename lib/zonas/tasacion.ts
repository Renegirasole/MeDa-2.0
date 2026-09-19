import type { Zone, ZoneEstimate, ZoneMode } from "./tipos";

/**
 * Precio estimado a partir de los datos de zona. Reglas públicas (ver /como-calculamos):
 *
 * Alquiler: €/m² al mes de tu barrio, en cuartiles. Rápido = P25, mercado = mediana, sin prisa = P75.
 * Venta:    valor tasado del municipio ajustado a tu barrio con la relación entre el alquiler del
 *           barrio y el del municipio (los barrios caros para alquilar también lo son para comprar).
 *           El abanico es la mitad del que tienen los alquileres del barrio, porque los pisos en venta
 *           de una misma zona se parecen más entre sí que los alquileres.
 */

const roundTo = (v: number, step: number) => Math.round(v / step) * step;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Cuánto se desvía el barrio del municipio. Acotado para que un dato raro no dispare el precio. */
export function neighbourhoodFactor(zone: Zone): number {
  if (zone.rentLevel !== "barrio" || !zone.rent || !zone.muniRent?.median) return 1;
  return clamp(zone.rent.median / zone.muniRent.median, 0.6, 1.8);
}

/** €/m² de venta del barrio: el valor tasado del municipio, movido por el factor de barrio. */
export function saleUnitPrice(zone: Zone, year: number | null): number | null {
  const sale = zone.sale;
  if (!sale) return null;
  const byAge = year !== null && new Date().getFullYear() - year <= 5 ? sale.new : sale.old;
  return (byAge ?? sale.total) * neighbourhoodFactor(zone);
}

/** €/m² de alquiler al mes del barrio (mediana). */
export const rentUnitPrice = (zone: Zone): number | null => zone.rent?.median ?? null;

export function estimate(zone: Zone, mode: ZoneMode, area: number, year: number | null = null): ZoneEstimate | null {
  if (area <= 0) return null;

  if (mode === "alquiler") {
    const r = zone.rent;
    if (!r) return null;
    return {
      mode,
      unitPrice: r.median,
      quick: roundTo(r.p25 * area, 10),
      market: roundTo(r.median * area, 10),
      ambitious: roundTo(r.p75 * area, 10),
    };
  }

  const unit = saleUnitPrice(zone, year);
  if (!unit) return null;
  // Abanico: la raíz del que tienen los alquileres del barrio (misma zona, pisos más parecidos).
  const spread = zone.rent?.median ? zone.rent : null;
  const low = spread ? clamp(Math.sqrt(spread.p25 / spread.median), 0.8, 1) : 0.92;
  const high = spread ? clamp(Math.sqrt(spread.p75 / spread.median), 1, 1.25) : 1.08;
  const market = unit * area;
  return {
    mode,
    unitPrice: unit,
    quick: roundTo(market * low, 1000),
    market: roundTo(market, 1000),
    ambitious: roundTo(market * high, 1000),
  };
}
