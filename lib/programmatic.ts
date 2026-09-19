import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { mortgageRow } from "@/lib/guides/mortgage";

/**
 * SEO programático: respuestas rápidas a búsquedas con cifra
 * («cuánto ganar para una hipoteca de 200.000», «qué coche puedo comprar cobrando 1.500»,
 * «cuánto alquiler puedo pagar con 1.800»). Todo sale de las mismas referencias que el motor.
 */

const range = (from: number, to: number, step: number) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

export const MORTGAGE_AMOUNTS = range(100_000, 400_000, 20_000); // 16 páginas
export const CAR_SALARIES = range(1100, 2700, 100); // 17 páginas
export const RENT_SALARIES = range(1000, 2600, 100); // 17 páginas

// ——— Hipoteca por importe ———

export const mortgageSlug = (loan: number) => `hipoteca-${loan}`;
export function parseMortgageSlug(slug: string): number | null {
  const n = Number(slug.match(/^hipoteca-(\d+)$/)?.[1]);
  return MORTGAGE_AMOUNTS.includes(n) ? n : null;
}
export const mortgageCase = (loan: number) => ({ r30: mortgageRow(loan, 30), r25: mortgageRow(loan, 25) });

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
  /** Precio máximo financiando con la entrada de referencia */
  maxPrice: number;
  /** El presupuesto cubre al menos seguro, gasolina y mantenimiento */
  canRun: boolean;
}

export function carCase(salary: number, months: number = CAR_ASSUMPTIONS.months): CarCase {
  const monthlyBudget = salary * CAR.guideline;
  const payment = Math.max(0, monthlyBudget - CAR_ASSUMPTIONS.running);
  const maxPrice = down(loanFor(payment, CAR_ASSUMPTIONS.rate, months) + CAR_ASSUMPTIONS.downPayment, 100);
  return { salary, monthlyBudget, payment, maxPrice, canRun: monthlyBudget >= CAR_ASSUMPTIONS.running };
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
  /** Renta máxima con la referencia de MeDa (35 % con suministros) */
  maxRent: number;
  /** Renta máxima con la regla del 30 % */
  strictRent: number;
  /** Para entrar: fianza (1 mes) + primer mes */
  moveIn: number;
}

export function rentCase(salary: number): RentCase {
  const maxRent = down(salary * RENT.guideline - RENT_ASSUMPTIONS.utilities, 10);
  const strictRent = down(salary * RENT_ASSUMPTIONS.strictRule - RENT_ASSUMPTIONS.utilities, 10);
  return { salary, maxRent, strictRent, moveIn: maxRent * 2 };
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
