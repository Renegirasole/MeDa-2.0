import type { Offer, PurchaseInput } from "@/lib/engine";

const car = (price: number, annualRate: number, upfrontCosts: number): PurchaseInput => ({
  price,
  downPayment: 3000,
  termMonths: 60,
  annualRate,
  upfrontCosts,
  monthlyFee: 0,
  monthlyRunningCosts: 200,
});

/** Ejemplo de la home y del comparador: mismo coche, tres concesionarios. */
export const EXAMPLE_OFFERS: Offer[] = [
  { id: "a", name: "Concesionario A", purchase: car(17500, 9.9, 300) },
  { id: "b", name: "Concesionario B", purchase: car(18200, 5.5, 300) },
  { id: "c", name: "Concesionario C", purchase: car(17900, 7.5, 900) },
];

/** Ejemplo de la simulación en vivo de la home. */
export const LIVE_EXAMPLE = {
  item: "un BMW Serie 3 de segunda mano",
  price: 16000,
} as const;

export const TRIP_EXAMPLE = { origin: "sevilla", destination: "roma", nights: 3, travelers: 2 } as const;
