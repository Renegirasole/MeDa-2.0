import type { AffordabilityResult, FactorId, ScoreFactor } from "@/lib/engine";
import { FLAG_COPY } from "@/lib/copy";
import { formatEUR, formatMonths, formatPct } from "@/lib/format";

/**
 * Lectura rápida del resultado para la interfaz.
 * Igual que template.ts: solo cifras que ya calculó el motor, nunca nuevas.
 */

/** Dato del factor en lenguaje llano ("22 % de tu sueldo"). */
export function factorValue(f: ScoreFactor): string {
  if (f.id === "effort") return `${formatPct(f.value)} de tu sueldo`;
  if (f.id === "margin") return f.value < 0 ? "Te falta dinero" : `${formatPct(f.value)} libre`;
  return formatMonths(f.value);
}

/** Referencia con la que se compara ("recomendado: hasta 20 %"). */
export function factorReference(f: ScoreFactor): string {
  if (f.id === "effort") return `Recomendado: hasta ${formatPct(f.reference)}`;
  if (f.id === "margin") return `Ideal: desde ${formatPct(f.reference)}`;
  return f.reference > 0 ? `Tu objetivo: ${formatMonths(f.reference)}` : "Sin objetivo";
}

const REASON: Record<FactorId, (r: AffordabilityResult) => string> = {
  effort: (r) =>
    `Cada mes se lleva el ${formatPct(r.effortRatio)} de tu sueldo, y para este gasto lo recomendable es no pasar del ${formatPct(r.guideline)}.`,
  margin: (r) =>
    r.marginAfter >= 0
      ? `Después te quedarían ${formatEUR(r.marginAfter)} libres al mes: poco margen para imprevistos.`
      : `Cada mes te faltarían ${formatEUR(-r.marginAfter)}.`,
  cushion: (r) =>
    `Tu colchón bajaría a ${formatMonths(r.cushionMonths)} de gastos, y quieres tener ${formatMonths(r.cushionTargetMonths)}.`,
};

/** El factor que más baja la nota. */
export function weakestFactor(r: AffordabilityResult): ScoreFactor {
  return r.factors.reduce((min, f) => (f.score < min.score ? f : min), r.factors[0]);
}

/** Una frase: por qué sale esta nota. */
export function mainReason(r: AffordabilityResult): string {
  if (r.appliedCap) return FLAG_COPY[r.appliedCap.flag];
  const weakest = weakestFactor(r);
  if (weakest.score >= 8) {
    return `Te cuesta ${formatEUR(r.monthlyTotal)} al mes, te quedan ${formatEUR(r.marginAfter)} libres y tu colchón sigue en pie.`;
  }
  return REASON[weakest.id](r);
}

/** Avisos secundarios: todo lo que el motor marcó, menos lo ya dicho en la frase principal. */
export function secondaryNotes(r: AffordabilityResult): string[] {
  const reasonIsEffort = !r.appliedCap && weakestFactor(r).id === "effort" && weakestFactor(r).score < 8;
  return r.flags
    .filter((f) => f !== r.appliedCap?.flag && !(reasonIsEffort && f === "over_guideline"))
    .map((f) => FLAG_COPY[f]);
}
