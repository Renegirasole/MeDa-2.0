/**
 * Cómo cambia el precio tu piso concreto dentro de su zona.
 *
 * El €/m² de la zona es el punto de partida; a partir de ahí, lo que distingue a un piso de
 * otro en el mismo portal: la planta y si hay ascensor, el estado, si es exterior y los extras.
 *
 * Los coeficientes siguen el espíritu de las normas técnicas de valoración catastral
 * (RD 1020/1993, normas 13 a 16: coeficientes por planta, estado de conservación y antigüedad)
 * y son deliberadamente prudentes. Se enseñan uno a uno en pantalla: nada de caja negra.
 */

export type Condition = "reformar" | "normal" | "reformado" | "nuevo";
export type Views = "exterior" | "interior";

export interface Features {
  /** Planta: 0 = bajo, 1 = primero… `null` si no se sabe */
  floor: number | null;
  lift: boolean;
  condition: Condition;
  views: Views;
  /** Metros de terraza */
  terrace: number;
  garage: boolean;
  storage: boolean;
}

export const DEFAULT_FEATURES: Features = {
  floor: null,
  lift: true,
  condition: "normal",
  views: "exterior",
  terrace: 0,
  garage: false,
  storage: false,
};

export const CONDITION_LABEL: Record<Condition, string> = {
  reformar: "Para reformar",
  normal: "En buen estado",
  reformado: "Reformado hace poco",
  nuevo: "A estrenar",
};

/** Estado de conservación: lo que más separa a dos pisos del mismo portal. */
export const CONDITION_FACTOR: Record<Condition, number> = {
  reformar: 0.85,
  normal: 1,
  reformado: 1.08,
  nuevo: 1.15,
};

/** Planta y ascensor. Sin ascensor, cada altura resta; con ascensor, el ático suma. */
export function floorFactor(floor: number | null, lift: boolean): number {
  if (floor === null) return 1;
  if (!lift) {
    if (floor <= 0) return 0.97;
    if (floor === 1) return 0.98;
    if (floor === 2) return 0.95;
    if (floor === 3) return 0.9;
    return 0.85;
  }
  if (floor <= 0) return 0.95;
  if (floor >= 6) return 1.05;
  return 1;
}

export const VIEWS_FACTOR: Record<Views, number> = { exterior: 1.03, interior: 0.93 };

/** Una plaza de garaje y un trastero, en metros equivalentes de vivienda. */
export const EXTRA_AREA = { garage: 12, storage: 4, terraceShare: 0.35 } as const;

export interface Adjustment {
  label: string;
  /** Multiplicador (1,05 = un 5 % más) */
  factor?: number;
  /** Importe añadido en euros (garaje, trastero…) */
  amount?: number;
}

export interface Adjusted {
  /** Precio ajustado a este piso */
  value: number;
  /** Todo lo que ha movido el precio, en orden */
  breakdown: Adjustment[];
}

const floorLabel = (floor: number, lift: boolean) =>
  `${floor <= 0 ? "Bajo" : floor >= 6 ? "Planta alta" : `Planta ${floor}`}${lift ? " con ascensor" : " sin ascensor"}`;

/**
 * Aplica las características al precio de la zona.
 * `unitPrice` es el €/m² que se está usando, para valorar terraza, garaje y trastero.
 */
export function adjustForFeatures(
  base: number,
  f: Features,
  unitPrice: number,
  mode: "venta" | "alquiler",
  /** El precio de partida ya es de obra nueva (valor tasado de vivienda de hasta 5 años) */
  alreadyNew = false,
): Adjusted {
  const breakdown: Adjustment[] = [];
  let value = base;

  // Si el precio de partida ya es de obra nueva, «a estrenar» no puede sumar otra vez.
  const condition = alreadyNew && f.condition === "nuevo" ? 1 : CONDITION_FACTOR[f.condition];
  if (condition !== 1) {
    breakdown.push({ label: CONDITION_LABEL[f.condition], factor: condition });
    value *= condition;
  }

  const floor = floorFactor(f.floor, f.lift);
  if (floor !== 1 && f.floor !== null) {
    breakdown.push({ label: floorLabel(f.floor, f.lift), factor: floor });
    value *= floor;
  }

  const views = VIEWS_FACTOR[f.views];
  if (views !== 1) {
    breakdown.push({ label: f.views === "exterior" ? "Exterior" : "Interior", factor: views });
    value *= views;
  }

  if (f.terrace > 0) {
    const amount = f.terrace * unitPrice * EXTRA_AREA.terraceShare;
    breakdown.push({ label: `Terraza de ${f.terrace} m²`, amount });
    value += amount;
  }
  if (f.garage) {
    const amount = EXTRA_AREA.garage * unitPrice;
    breakdown.push({ label: "Plaza de garaje", amount });
    value += amount;
  }
  if (f.storage) {
    const amount = EXTRA_AREA.storage * unitPrice;
    breakdown.push({ label: "Trastero", amount });
    value += amount;
  }

  const step = mode === "alquiler" ? 10 : 1000;
  return { value: Math.round(value / step) * step, breakdown };
}
