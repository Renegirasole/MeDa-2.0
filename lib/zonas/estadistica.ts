/** Cuartiles y mínimos compartidos por el servidor y el navegador (sin dependencias). */

/** Percentil de una lista ya ordenada, interpolando entre los dos valores vecinos. */
export const quantile = (sorted: number[], q: number): number => {
  const pos = (sorted.length - 1) * q;
  const low = Math.floor(pos);
  const high = Math.ceil(pos);
  return sorted[low] + (sorted[high] - sorted[low]) * (pos - low);
};

/** Anuncios mínimos para dar una cifra: con menos, la zona no está representada. */
export const MIN_SAMPLE = 8;
