import { loanPayment } from "@/lib/engine";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";

/**
 * Números de la guía «Cuánto cuesta de verdad un coche al mes».
 * Mismos supuestos que la calculadora de coche; los gastos al mes se desglosan como ejemplo.
 */
export const CAR = CATEGORY_BY_SLUG.coche;

export const CAR_GUIDE = {
  downPayment: CAR.defaults.downPayment,
  months: CAR.defaults.termMonths,
  rate: CAR.defaults.annualRate,
  running: CAR.defaults.monthlyRunningCosts,
} as const;

/**
 * Reparto orientativo de los gastos al mes (suma = gastos de la calculadora).
 * Cada coche y cada conductor es distinto: por eso la calculadora deja cambiarlo.
 */
export const RUNNING_EXAMPLE = [
  { label: "Gasolina o carga", value: 90, hint: "Unos 1.000 km al mes" },
  { label: "Seguro", value: 45, hint: "Unos 540 € al año" },
  { label: "Mantenimiento y neumáticos", value: 40, hint: "Revisiones, ruedas, averías pequeñas" },
  { label: "Aparcamiento, ITV y otros", value: 15, hint: "Según la ciudad" },
  { label: "Impuesto de circulación", value: 10, hint: "Unos 120 € al año, según el municipio" },
] as const;

export interface CarRow {
  price: number;
  loan: number;
  payment: number;
  monthlyTotal: number;
  /** Intereses pagados en todo el préstamo */
  interest: number;
  /** Sueldo neto para que todo el coche no pase del 20 % */
  minIncome: number;
}

export function carRow(price: number, months: number = CAR_GUIDE.months, rate: number = CAR_GUIDE.rate): CarRow {
  const loan = Math.max(0, price - CAR_GUIDE.downPayment);
  const payment = loanPayment(loan, rate, months);
  const monthlyTotal = payment + CAR_GUIDE.running;
  return {
    price,
    loan,
    payment,
    monthlyTotal,
    interest: payment * months - loan,
    minIncome: Math.ceil(monthlyTotal / CAR.guideline / 10) * 10,
  };
}

export const CAR_PRICES = [10_000, 13_000, 16_000, 20_000, 25_000, 30_000] as const;
export const CAR_TERMS = [36, 48, 60, 84] as const;
