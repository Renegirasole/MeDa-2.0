import { clamp, piecewise, round } from "./math";
import type { ScoreCap, ScoreFactor, Verdict } from "./types";

/**
 * Reglas de puntuación. Públicas y documentadas en /como-calculamos.
 * Cualquier cambio aquí debe reflejarse en esa página.
 */
export const WEIGHTS = { effort: 0.4, margin: 0.3, cushion: 0.3 } as const;

export const VERDICT_THRESHOLDS: ReadonlyArray<readonly [number, Verdict]> = [
  [7, "yes"],
  [5, "tight"],
  [3, "risky"],
  [0, "no"],
];

/**
 * Esfuerzo = coste mensual / ingresos, relativo a la referencia de la categoría.
 * Estar justo en la referencia es un aprobado raspado (5), no un notable: la
 * referencia es un techo recomendado, no un objetivo al que aspirar.
 */
export const EFFORT_CURVE = [
  [0.5, 10],
  [0.75, 8],
  [1, 5],
  [1.5, 1.5],
  [2, 0],
] as const;

/** Margen libre tras la compra, como fracción de ingresos. */
export const MARGIN_CURVE = [
  [0, 3],
  [0.1, 7],
  [0.2, 10],
] as const;

/** Colchón tras la compra, como fracción del colchón objetivo. */
export const CUSHION_CURVE = [
  [0, 0],
  [0.5, 4],
  [1, 8],
  [1.5, 10],
] as const;

export const CAPS = {
  not_enough_savings: 1.5,
  negative_margin: 2.5,
  upcoming_uncovered: 2.5,
  cushion_critical: 4.9,
  cushion_below_target: 6.9,
} as const;

/**
 * Topes por pasarse de la referencia de la categoría, de más grave a menos.
 * `[veces la referencia, nota máxima]`: gastar el doble de lo recomendable no
 * puede salir aprobado por muchos ahorros que haya detrás.
 */
export const EFFORT_CAPS = [
  [1.5, 4],
  [1.25, 5.5],
  [1, 6.9],
] as const;

/**
 * Prueba de estrés: la nota se calcula otra vez con los ingresos bajados y, en
 * préstamos largos (hipotecas, donde el tipo suele ser variable), con el
 * interés subido. La nota final no puede separarse de la estresada más de
 * `maxGap`, así que una compra que solo aguanta si nada va mal no aprueba.
 */
export const STRESS = {
  incomeDrop: 0.1,
  rateRise: 2,
  longTermMonths: 120,
  maxGap: 2,
} as const;

export function effortFactor(effortRatio: number, guideline: number): ScoreFactor {
  const rel = guideline > 0 ? effortRatio / guideline : Infinity;
  return {
    id: "effort",
    weight: WEIGHTS.effort,
    value: effortRatio,
    reference: guideline,
    score: round(piecewise(rel, EFFORT_CURVE), 1),
  };
}

export function marginFactor(marginAfter: number, income: number): ScoreFactor {
  const share = income > 0 ? marginAfter / income : -1;
  return {
    id: "margin",
    weight: WEIGHTS.margin,
    value: share,
    reference: 0.2,
    score: share < 0 ? 0 : round(piecewise(share, MARGIN_CURVE), 1),
  };
}

export function cushionFactor(cushionMonths: number, targetMonths: number): ScoreFactor {
  const rel = targetMonths > 0 ? cushionMonths / targetMonths : cushionMonths > 0 ? 2 : 0;
  return {
    id: "cushion",
    weight: WEIGHTS.cushion,
    value: cushionMonths,
    reference: targetMonths,
    score: round(piecewise(Math.max(0, rel), CUSHION_CURVE), 1),
  };
}

/** Suelo al combinar: un 0 limpio dejaría la nota en 0 pase lo que pase. */
const FACTOR_FLOOR = 0.1;

/**
 * Media geométrica ponderada, no media normal: los factores se multiplican en
 * vez de sumarse, así que un factor malo no se compensa con otros buenos.
 * Tener mucho colchón (un stock que se gasta una vez) no hace sana una cuota
 * alta (un flujo que vuelve cada mes).
 */
export function combineFactors(factors: ScoreFactor[]): number {
  if (factors.length === 0) return 0;
  const totalWeight = factors.reduce((acc, f) => acc + f.weight, 0);
  if (totalWeight <= 0) return 0;
  const logSum = factors.reduce((acc, f) => acc + f.weight * Math.log(Math.max(f.score, FACTOR_FLOOR)), 0);
  return clamp(Math.exp(logSum / totalWeight), 0, 10);
}

/** Tope por esfuerzo, si el coste mensual se pasa de la referencia. */
export function effortCap(effortRatio: number, guideline: number): number | null {
  if (guideline <= 0) return null;
  const rel = effortRatio / guideline;
  for (const [times, max] of EFFORT_CAPS) if (rel > times) return max;
  return null;
}

export function strongestCap(caps: ScoreCap[]): ScoreCap | null {
  return caps.reduce<ScoreCap | null>((min, c) => (min === null || c.max < min.max ? c : min), null);
}

export function verdictFor(score: number): Verdict {
  for (const [threshold, verdict] of VERDICT_THRESHOLDS) if (score >= threshold) return verdict;
  return "no";
}
