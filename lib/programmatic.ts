import { evaluateOne, maxAffordable, PASSING_SCORE, type FinancialProfile } from "@/lib/engine";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { mortgageIncomeYes, mortgageRow } from "@/lib/guides/mortgage";

/**
 * SEO programático: respuestas rápidas a búsquedas con cifra
 * («cuánto ganar para una hipoteca de 200.000», «qué coche puedo comprar cobrando 1.500»,
 * «cuánto alquiler puedo pagar con 1.800»). Todo sale de las mismas referencias que el motor.
 */

const range = (from: number, to: number, step: number) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

/**
 * Supuestos para comprobar la cifra con el motor completo.
 * La regla de la categoría solo mira el esfuerzo mensual; la calculadora mira
 * además el margen que queda, el colchón y qué pasa si algo va mal. Estos
 * supuestos son deliberadamente amables —gastos de vida contenidos y los
 * ahorros justos para entrar y tener colchón—, así que la cifra que sale es un
 * techo: con números peores, sale menos.
 */
export const CHECK_ASSUMPTIONS = {
  /** Gastos de vida (sin la compra) como parte del sueldo */
  expensesShare: 0.5,
  emergencyMonths: 3,
} as const;

function checkProfile(salary: number, monthlyCost: number, cashNeeded: number): FinancialProfile {
  const monthlyExpenses = Math.round(salary * CHECK_ASSUMPTIONS.expensesShare);
  return {
    monthlyIncome: salary,
    monthlyExpenses,
    monthlyDebtPayments: 0,
    emergencyMonths: CHECK_ASSUMPTIONS.emergencyMonths,
    upcomingExpenses: 0,
    savings: up(cashNeeded + CHECK_ASSUMPTIONS.emergencyMonths * (monthlyExpenses + monthlyCost), 500),
  };
}

const up = (v: number, step: number) => Math.ceil(v / step) * step;

export const MORTGAGE_AMOUNTS = range(100_000, 400_000, 20_000); // 16 páginas
export const CAR_SALARIES = range(1100, 2700, 100); // 17 páginas
export const RENT_SALARIES = range(1000, 2600, 100); // 17 páginas

// ——— Hipoteca por importe ———

export const mortgageSlug = (loan: number) => `hipoteca-${loan}`;
export function parseMortgageSlug(slug: string): number | null {
  const n = Number(slug.match(/^hipoteca-(\d+)$/)?.[1]);
  return MORTGAGE_AMOUNTS.includes(n) ? n : null;
}
/**
 * Los dos plazos de la página, con el sueldo que hace falta de verdad.
 * `minIncomeEffort` solo mira la regla del 35 %; `income` es el mayor entre esa
 * regla y el sueldo con el que la calculadora entera dice «sí, te da», que en
 * hipotecas pequeñas es más alto porque los gastos de vida no bajan con ellas.
 */
export function mortgageCase(loan: number) {
  const r30 = mortgageRow(loan, 30);
  const r25 = mortgageRow(loan, 25);
  const yes30 = mortgageIncomeYes(loan, 30);
  const yes25 = mortgageIncomeYes(loan, 25);
  return {
    r30,
    r25,
    yes30,
    yes25,
    income30: Math.max(r30.minIncomeEffort, yes30 ?? 0),
    income25: Math.max(r25.minIncomeEffort, yes25 ?? 0),
  };
}

// ——— Coche por sueldo ———

export const CAR = CATEGORY_BY_SLUG.coche;
/** Supuestos de la página: los de la calculadora de coche. */
export const CAR_ASSUMPTIONS = {
  rate: CAR.defaults.annualRate,
  months: CAR.defaults.termMonths,
  downPayment: CAR.defaults.downPayment,
  running: CAR.defaults.monthlyRunningCosts,
} as const;

/** Capital que se puede pedir con una cuota dada (sistema francés, a la inversa). */
export function loanFor(payment: number, annualRatePct: number, months: number): number {
  if (payment <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return payment * months;
  return (payment * (1 - Math.pow(1 + r, -months))) / r;
}

const down = (v: number, step: number) => Math.floor(v / step) * step;

export interface CarCase {
  salary: number;
  /** Lo que el coche puede costar al mes en total (20 % del sueldo) */
  monthlyBudget: number;
  /** Lo que queda para la cuota tras seguro, gasolina y mantenimiento */
  payment: number;
  /** Precio máximo que aprueba la calculadora entera */
  maxPrice: number;
  /** Precio máximo mirando solo la referencia del 20 % */
  maxPriceRule: number;
  /** El presupuesto cubre al menos seguro, gasolina y mantenimiento */
  canRun: boolean;
}

/** Perfil con el que se comprueba la cifra de la página del coche. */
export const carProfile = (salary: number) =>
  checkProfile(salary, salary * CAR.guideline, CAR_ASSUMPTIONS.downPayment + CAR.defaults.upfrontCosts);

export function carCase(salary: number, months: number = CAR_ASSUMPTIONS.months): CarCase {
  const monthlyBudget = salary * CAR.guideline;
  const payment = Math.max(0, monthlyBudget - CAR_ASSUMPTIONS.running);
  const maxPriceRule = down(loanFor(payment, CAR_ASSUMPTIONS.rate, months) + CAR_ASSUMPTIONS.downPayment, 100);
  const profile = carProfile(salary);
  const purchase = { ...CAR.defaults, price: Math.max(maxPriceRule, 1000), termMonths: months };
  const best = maxAffordable(profile, purchase, CAR.guideline, PASSING_SCORE);
  const maxPrice = best ? Math.min(down(best.purchase.price, 100), maxPriceRule) : 0;
  return { salary, monthlyBudget, payment, maxPrice, maxPriceRule, canRun: monthlyBudget >= CAR_ASSUMPTIONS.running };
}

export const carSlug = (salary: number) => `coche-con-${salary}`;
export function parseCarSlug(slug: string): number | null {
  const n = Number(slug.match(/^coche-con-(\d+)$/)?.[1]);
  return CAR_SALARIES.includes(n) ? n : null;
}

// ——— Alquiler por sueldo ———

export const RENT = CATEGORY_BY_SLUG["alquilar-vivienda"];
export const RENT_ASSUMPTIONS = {
  utilities: RENT.defaults.monthlyRunningCosts,
  /** La regla más citada, más prudente que la referencia de MeDa */
  strictRule: 0.3,
} as const;

export interface RentCase {
  salary: number;
  /** Renta máxima que aprueba la calculadora entera */
  maxRent: number;
  /** Renta máxima mirando solo la referencia de MeDa (35 % con suministros) */
  maxRentRule: number;
  /** Renta máxima con la regla del 30 % */
  strictRent: number;
  /** Para entrar: fianza (1 mes) + primer mes */
  moveIn: number;
}

export function rentCase(salary: number): RentCase {
  const maxRentRule = down(salary * RENT.guideline - RENT_ASSUMPTIONS.utilities, 10);
  const strictRent = down(salary * RENT_ASSUMPTIONS.strictRule - RENT_ASSUMPTIONS.utilities, 10);
  const purchaseFor = (rent: number) => ({
    price: 0,
    downPayment: 0,
    termMonths: 0,
    annualRate: 0,
    upfrontCosts: rent * 2,
    monthlyFee: rent,
    monthlyRunningCosts: RENT_ASSUMPTIONS.utilities,
  });
  const profile = checkProfile(salary, maxRentRule + RENT_ASSUMPTIONS.utilities, maxRentRule * 2);
  const passes = (rent: number) => evaluateOne(profile, purchaseFor(rent), RENT.guideline).score >= PASSING_SCORE;
  let maxRent = maxRentRule;
  if (!passes(maxRentRule)) {
    let lo = 0;
    let hi = maxRentRule;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (passes(mid)) lo = mid;
      else hi = mid;
    }
    maxRent = down(lo, 10);
  }
  return { salary, maxRent, maxRentRule, strictRent, moveIn: maxRent * 2 };
}

export const rentSlug = (salary: number) => `sueldo-${salary}`;
export function parseRentSlug(slug: string): number | null {
  const n = Number(slug.match(/^sueldo-(\d+)$/)?.[1]);
  return RENT_SALARIES.includes(n) ? n : null;
}

/** Vecinos para enlazar entre páginas (dos por debajo y dos por encima). */
export function neighbors<T>(list: readonly T[], value: T, span = 2): T[] {
  const i = list.indexOf(value);
  return list.slice(Math.max(0, i - span), i + span + 1);
}

export const PROGRAMMATIC_PATHS = [
  ...MORTGAGE_AMOUNTS.map((v) => `/cuanto-ganar-para/${mortgageSlug(v)}`),
  ...CAR_SALARIES.map((v) => `/que-puedo-permitirme/${carSlug(v)}`),
  ...RENT_SALARIES.map((v) => `/alquiler-maximo/${rentSlug(v)}`),
];

/** Fecha de las cifras de estas páginas (se recalculan en cada despliegue). */
export const PROGRAMMATIC_UPDATED = "2026-09-19";
