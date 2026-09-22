import { MIN_SAMPLE, quantile } from "./estadistica";
import type { ListingStats, Zone, ZoneEstimate, ZoneMode } from "./tipos";

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

/**
 * Precio con los anuncios que hay ahora mismo cerca (idealista). Es precio de salida,
 * el que se pide: para decidir a cuánto poner el tuyo es justo lo que interesa.
 *
 * Un estudio de 40 m² vale más por metro que un piso de 120, así que, si hay bastantes,
 * solo se comparan los anuncios de tamaño parecido al tuyo (±35 %).
 */
export function estimateFromListings(stats: ListingStats, mode: ZoneMode, area: number): ZoneEstimate | null {
  if (area <= 0) return null;
  const step = mode === "alquiler" ? 10 : 1000;

  const similar = (stats.sample ?? []).filter(([size]) => size >= area * 0.65 && size <= area * 1.35).map(([, unit]) => unit);
  const use =
    similar.length >= MIN_SAMPLE
      ? (() => {
          const sorted = [...similar].sort((a, b) => a - b);
          return { p25: quantile(sorted, 0.25), median: quantile(sorted, 0.5), p75: quantile(sorted, 0.75), matched: similar.length };
        })()
      : { p25: stats.p25, median: stats.median, p75: stats.p75, matched: 0 };

  return {
    mode,
    unitPrice: use.median,
    quick: roundTo(use.p25 * area, step),
    market: roundTo(use.median * area, step),
    ambitious: roundTo(use.p75 * area, step),
    matched: use.matched,
  };
}

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
