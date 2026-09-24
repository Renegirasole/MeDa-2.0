import { evaluateOne, loanPayment, PASSING_SCORE, type FinancialProfile, type PurchaseInput } from "@/lib/engine";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";

/**
 * Números de la guía «Qué sueldo necesitas para una hipoteca».
 * Todo sale del motor: si cambian las reglas, la guía cambia sola.
 */
export const HOUSING = CATEGORY_BY_SLUG["comprar-vivienda"];

/** Supuestos de la guía, a la vista del lector. */
export const MORTGAGE_ASSUMPTIONS = {
  /** TIN anual en % */
  rate: 3,
  years: 30,
  /** Parte del precio que suele financiar el banco */
  financedShare: 0.8,
  /** Impuestos, notaría, registro y gestoría sobre el precio (aprox.) */
  upfrontShare: 0.1,
  /** Comunidad, IBI prorrateado y seguro de hogar, al mes */
  running: HOUSING.defaults.monthlyRunningCosts,
  /** Gastos de vida sin la vivienda, para el perfil de referencia */
  livingCosts: 1100,
} as const;

export interface MortgageRow {
  loan: number;
  price: number;
  downPayment: number;
  upfront: number;
  /** Entrada + gastos: lo que hay que tener ahorrado el día de la firma */
  cashNeeded: number;
  payment: number;
  /** Cuota + gastos de la casa */
  monthlyTotal: number;
  /** Sueldo neto mínimo para que el coste mensual no pase de la referencia (35 %) */
  minIncomeEffort: number;
}

const up = (v: number, step: number) => Math.ceil(v / step) * step;

export function mortgagePurchase(loan: number, years: number = MORTGAGE_ASSUMPTIONS.years, rate: number = MORTGAGE_ASSUMPTIONS.rate): PurchaseInput {
  const price = loan / MORTGAGE_ASSUMPTIONS.financedShare;
  return {
    price,
    downPayment: price - loan,
    termMonths: years * 12,
    annualRate: rate,
    upfrontCosts: price * MORTGAGE_ASSUMPTIONS.upfrontShare,
    monthlyFee: 0,
    monthlyRunningCosts: MORTGAGE_ASSUMPTIONS.running,
  };
}

export function mortgageRow(loan: number, years: number = MORTGAGE_ASSUMPTIONS.years, rate: number = MORTGAGE_ASSUMPTIONS.rate): MortgageRow {
  const p = mortgagePurchase(loan, years, rate);
  const payment = loanPayment(loan, rate, years * 12);
  const monthlyTotal = payment + p.monthlyRunningCosts;
  return {
    loan,
    price: p.price,
    downPayment: p.downPayment,
    upfront: p.upfrontCosts,
    cashNeeded: p.downPayment + p.upfrontCosts,
    payment,
    monthlyTotal,
    minIncomeEffort: up(monthlyTotal / HOUSING.guideline, 10),
  };
}

/**
 * Perfil de referencia: gastos de vida fijos y ahorros justos para la entrada,
 * los gastos y el colchón (3 meses) que pide MeDa por defecto. Solo falta el sueldo.
 */
export function referenceProfile(row: MortgageRow): Omit<FinancialProfile, "monthlyIncome"> {
  const emergencyMonths = 3;
  const monthlyExpenses = MORTGAGE_ASSUMPTIONS.livingCosts;
  return {
    monthlyExpenses,
    monthlyDebtPayments: 0,
    emergencyMonths,
    upcomingExpenses: 0,
    savings: up(row.cashNeeded + emergencyMonths * (monthlyExpenses + row.monthlyTotal), 1000),
  };
}

/**
 * Sueldo neto mínimo para que el motor dé `target` (por defecto, «Sí, te da»).
 * La nota nunca baja al subir el sueldo, así que basta una búsqueda binaria.
 */
export function minIncomeFor(
  base: Omit<FinancialProfile, "monthlyIncome">,
  purchase: PurchaseInput,
  guideline: number = HOUSING.guideline,
  target: number = PASSING_SCORE,
): number | null {
  const score = (income: number) => evaluateOne({ ...base, monthlyIncome: income }, purchase, guideline).score;
  let hi = 1000;
  while (score(hi) < target) {
    hi *= 2;
    if (hi > 1_000_000) return null;
  }
  let lo = 0;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (score(mid) >= target) hi = mid;
    else lo = mid;
  }
  return up(hi, 10);
}

/**
 * Sueldo con el que la calculadora entera dice «sí, te da» para esa hipoteca,
 * no solo la referencia del 35 %. Sale siempre igual o más alto que
 * `minIncomeEffort`, porque además del esfuerzo mira margen, colchón y estrés.
 */
export function mortgageIncomeYes(
  loan: number,
  years: number = MORTGAGE_ASSUMPTIONS.years,
  rate: number = MORTGAGE_ASSUMPTIONS.rate,
): number | null {
  const row = mortgageRow(loan, years, rate);
  return minIncomeFor(referenceProfile(row), mortgagePurchase(loan, years, rate));
}

/** El caso titular de la guía: hipoteca de 200.000 €. */
export function headlineCase(loan = 200_000) {
  const row = mortgageRow(loan);
  const profile = referenceProfile(row);
  const purchase = mortgagePurchase(loan);
  const minIncomeYes = minIncomeFor(profile, purchase);
  /** La nota del perfil de referencia cobrando justo el mínimo del 35 % */
  const atEffort = evaluateOne({ ...profile, monthlyIncome: row.minIncomeEffort }, purchase, HOUSING.guideline);
  return { row, profile, purchase, minIncomeYes, atEffort };
}

export const LOAN_TABLE = [100_000, 150_000, 200_000, 250_000, 300_000] as const;
export const RATE_TABLE = [2.5, 3, 3.5, 4] as const;
