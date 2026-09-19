import { evaluateOne } from "./affordability";
import type { AffordabilityResult, FinancialProfile, PurchaseInput } from "./types";

export interface Offer {
  id: string;
  name: string;
  purchase: PurchaseInput;
}

export interface OfferEvaluation extends Offer {
  result: AffordabilityResult;
  /** Lo que pagas por el bien + 12 meses de gastos asociados */
  firstYearCost: number;
}

export interface ComparisonResult {
  ranked: OfferEvaluation[];
  bestId: string | null;
  cheapestId: string | null;
  /** true si la más barata de etiqueta no es la que más te conviene */
  cheapestIsNotBest: boolean;
}

/** Ordena por nota; a igual nota, por lo que pagas en total más el primer año de uso. */
export function compareOffers(profile: FinancialProfile, offers: Offer[], guideline: number): ComparisonResult {
  const evaluated: OfferEvaluation[] = offers.map((o) => {
    const result = evaluateOne(profile, o.purchase, guideline);
    const running = (o.purchase.monthlyFee + o.purchase.monthlyRunningCosts) * 12;
    return { ...o, result, firstYearCost: result.totalPaid + running };
  });
  const ranked = [...evaluated].sort(
    (a, b) => b.result.score - a.result.score || a.firstYearCost - b.firstYearCost,
  );
  const cheapest = evaluated.reduce<OfferEvaluation | null>(
    (min, e) => (min === null || e.purchase.price < min.purchase.price ? e : min),
    null,
  );
  const bestId = ranked[0]?.id ?? null;
  return {
    ranked,
    bestId,
    cheapestId: cheapest?.id ?? null,
    cheapestIsNotBest: cheapest !== null && bestId !== null && cheapest.id !== bestId,
  };
}
