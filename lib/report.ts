import { HOUSING, MORTGAGE_ASSUMPTIONS, mortgageRow } from "@/lib/guides/mortgage";
import { carCase, loanFor, rentCase } from "@/lib/programmatic";

/**
 * Informe «¿Qué le da a un joven en 2026?».
 * Punto de partida: salario bruto mensual medio por edad del INE (Decil de salarios del empleo principal,
 * EPA, año 2024). El neto es una aproximación redonda y conservadora: depende de la retención de cada uno.
 */
export const REPORT_SOURCE = {
  name: "INE · Decil de salarios del empleo principal (EPA), año 2024",
  url: "https://www.ine.es/dyngs/Prensa/dsEPA2024.htm",
} as const;

export const REPORT_PROFILES = [
  { id: "16-24", label: "De 16 a 24 años", gross: 1372.8, net: 1200 },
  { id: "25-34", label: "De 25 a 34 años", gross: 2131.6, net: 1700 },
] as const;

/** Parte del sueldo que se ahorra en el escenario del informe. */
export const SAVING_RATE = 0.15;

/** Hipoteca máxima para que cuota + gastos de la casa no pasen de la referencia (35 %). */
export function maxMortgage(net: number) {
  const payment = net * HOUSING.guideline - MORTGAGE_ASSUMPTIONS.running;
  return Math.floor(loanFor(payment, MORTGAGE_ASSUMPTIONS.rate, MORTGAGE_ASSUMPTIONS.years * 12) / 1000) * 1000;
}

export function reportRow(net: number) {
  const rent = rentCase(net);
  const car = carCase(net);
  const loan = maxMortgage(net);
  const house = mortgageRow(loan);
  const saving = Math.round(net * SAVING_RATE);
  /** Años ahorrando el 15 % para reunir la entrada y los gastos de esa casa */
  const yearsToBuy = house.cashNeeded / saving / 12;
  return { net, rent, car, loan, house, saving, yearsToBuy };
}
