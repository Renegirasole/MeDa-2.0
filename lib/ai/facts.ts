import type { AffordabilityResult } from "@/lib/engine";
import { FLAG_COPY, VERDICT_COPY } from "@/lib/copy";
import { formatEUR, formatMonths, formatPct, formatScore } from "@/lib/format";

/**
 * Único paquete de datos que recibe la IA.
 * Cifras ya calculadas y formateadas por el motor. Nada de datos personales en bruto.
 */
export type Facts = Record<string, string>;

export const MAX_FACTS = 24;
export const MAX_FACT_LENGTH = 120;

export function buildFacts(r: AffordabilityResult, what: string): Facts {
  const facts: Facts = {
    que_quiere: what,
    veredicto: VERDICT_COPY[r.verdict].label,
    nota: `${formatScore(r.score)} sobre 10`,
    coste_mensual_total: formatEUR(r.monthlyTotal),
    cuota_prestamo: formatEUR(r.monthlyPayment),
    porcentaje_de_ingresos: formatPct(r.effortRatio),
    porcentaje_recomendado: formatPct(r.guideline),
    margen_libre_al_mes: formatEUR(r.marginAfter),
    pago_con_ahorros: formatEUR(r.cashOutlay),
    colchon_restante: formatMonths(r.cushionMonths),
    colchon_objetivo: formatMonths(r.cushionTargetMonths),
    intereses_totales: formatEUR(r.totalInterest),
    total_pagado: formatEUR(r.totalPaid),
  };
  r.flags.forEach((f, i) => {
    facts[`aviso_${i + 1}`] = FLAG_COPY[f];
  });
  return facts;
}

export function isFacts(v: unknown): v is Facts {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const entries = Object.entries(v);
  return (
    entries.length > 0 &&
    entries.length <= MAX_FACTS &&
    entries.every(([k, val]) => /^[a-z_0-9]{1,40}$/.test(k) && typeof val === "string" && val.length <= MAX_FACT_LENGTH)
  );
}
