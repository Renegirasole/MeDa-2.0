/**
 * Motor financiero de MeDa — tipos.
 * Todo en euros y meses. Sin dependencias de UI ni de IA.
 */

export interface FinancialProfile {
  /** Ingresos netos mensuales */
  monthlyIncome: number;
  /** Gastos de vida mensuales (sin cuotas de deudas) */
  monthlyExpenses: number;
  /** Cuotas mensuales de deudas actuales (préstamos, tarjetas…) */
  monthlyDebtPayments: number;
  /** Ahorros disponibles hoy */
  savings: number;
  /** Colchón de emergencia deseado, en meses de gastos */
  emergencyMonths: number;
  /** Gastos futuros ya conocidos en los próximos 12 meses */
  upcomingExpenses: number;
}

export interface PurchaseInput {
  /** Precio del bien (0 si es solo un gasto mensual) */
  price: number;
  /** Entrada pagada con ahorros (solo si se financia) */
  downPayment: number;
  /** Plazo de financiación en meses. 0 = pago al contado */
  termMonths: number;
  /** TIN anual en % */
  annualRate: number;
  /** Gastos iniciales únicos: impuestos, fianza, matrícula… */
  upfrontCosts: number;
  /** Cuota principal mensual: alquiler, gimnasio… */
  monthlyFee: number;
  /** Gastos mensuales asociados: seguro, combustible, suministros… */
  monthlyRunningCosts: number;
}

export type Verdict = "yes" | "tight" | "risky" | "no";

export type FactorId = "effort" | "margin" | "cushion";

export interface ScoreFactor {
  id: FactorId;
  weight: number;
  /** Valor medido (ratio o meses) */
  value: number;
  /** Referencia con la que se compara */
  reference: number;
  /** Subnota 0–10 */
  score: number;
}

export type FlagCode =
  | "no_income"
  | "not_enough_savings"
  | "upcoming_uncovered"
  | "negative_margin"
  | "cushion_critical"
  | "cushion_below_target"
  | "over_guideline"
  | "high_interest";

export interface ScoreCap {
  flag: FlagCode;
  max: number;
}

export interface AffordabilityResult {
  score: number;
  verdict: Verdict;
  /** Nota antes de aplicar topes */
  rawScore: number;
  appliedCap: ScoreCap | null;
  factors: ScoreFactor[];
  flags: FlagCode[];

  freeCashBefore: number;
  cashOutlay: number;
  loanAmount: number;
  monthlyPayment: number;
  /** Coste real mensual: cuota + cuota fija + gastos asociados */
  monthlyTotal: number;
  /** Lo que te queda libre cada mes después de la compra */
  marginAfter: number;
  effortRatio: number;
  guideline: number;
  savingsAfter: number;
  cushionMonths: number;
  cushionTargetMonths: number;
  totalInterest: number;
  /** Lo que acabas pagando por el bien (entrada + cuotas + gastos iniciales) */
  totalPaid: number;
  /** Coste de uso durante 12 meses (coste mensual × 12) */
  yearlyCost: number;
}

export type PlanTier = "budget" | "value" | "top";

export interface Plan {
  tier: PlanTier;
  factor: number;
  purchase: PurchaseInput;
  result: AffordabilityResult;
}
