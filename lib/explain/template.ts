import type { AffordabilityResult } from "@/lib/engine";
import { FLAG_COPY, VERDICT_COPY } from "@/lib/copy";
import { formatEUR, formatMonths, formatPct, formatScore } from "@/lib/format";

/**
 * Explicación determinista: siempre disponible, sin IA.
 * Solo usa cifras que ya calculó el motor.
 */
export function explainResult(r: AffordabilityResult, what: string): string[] {
  const out: string[] = [];
  out.push(
    `${VERDICT_COPY[r.verdict].label}. Con lo que nos has contado, ${what} saca un ${formatScore(r.score)} sobre 10.`,
  );

  const parts: string[] = [];
  if (r.monthlyPayment > 0) parts.push(`${formatEUR(r.monthlyPayment)} de cuota`);
  const rest = r.monthlyTotal - r.monthlyPayment;
  if (rest > 0) parts.push(`${formatEUR(rest)} de gastos`);
  if (r.monthlyTotal > 0) {
    out.push(
      `Cada mes te costaría ${formatEUR(r.monthlyTotal)}${parts.length > 1 ? ` (${parts.join(" y ")})` : ""}, el ${formatPct(r.effortRatio)} de tus ingresos. Lo recomendable para este gasto es no pasar del ${formatPct(r.guideline)}.`,
    );
  }

  out.push(
    r.marginAfter >= 0
      ? `Después te quedarían ${formatEUR(r.marginAfter)} libres al mes.`
      : `Te faltarían ${formatEUR(-r.marginAfter)} cada mes para llegar.`,
  );

  if (r.cashOutlay > 0) {
    out.push(
      `Pagarías ${formatEUR(r.cashOutlay)} de tus ahorros y te quedaría un colchón de ${formatMonths(r.cushionMonths)} de gastos (tu objetivo: ${formatMonths(r.cushionTargetMonths)}).`,
    );
  }

  if (r.totalInterest > 0) {
    out.push(`Solo en intereses pagarías ${formatEUR(r.totalInterest)}.`);
  }

  if (r.appliedCap) {
    out.push(`Tu nota sería ${formatScore(r.rawScore)}, pero la limitamos a ${formatScore(r.appliedCap.max)} porque: ${FLAG_COPY[r.appliedCap.flag].toLowerCase()}`);
  }
  return out;
}
