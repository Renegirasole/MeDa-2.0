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

/** Esfuerzo = coste mensual / ingresos, relativo a la referencia de la categoría. */
export const EFFORT_CURVE = [
  [0.5, 10],
  [1, 6],
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

export function combineFactors(factors: ScoreFactor[]): number {
  return clamp(factors.reduce((acc, f) => acc + f.score * f.weight, 0), 0, 10);
}

export function strongestCap(caps: ScoreCap[]): ScoreCap | null {
  return caps.reduce<ScoreCap | null>((min, c) => (min === null || c.max < min.max ? c : min), null);
}

export function verdictFor(score: number): Verdict {
  for (const [threshold, verdict] of VERDICT_THRESHOLDS) if (score >= threshold) return verdict;
  return "no";
}
