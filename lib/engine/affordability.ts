import { loanPayment } from "./finance";
import { round } from "./math";
import {
  CAPS,
  combineFactors,
  cushionFactor,
  effortCap,
  effortFactor,
  marginFactor,
  STRESS,
  strongestCap,
  verdictFor,
} from "./scoring";
import type {
  AffordabilityResult,
  FinancialProfile,
  FlagCode,
  Plan,
  PlanTier,
  PurchaseInput,
  ScoreCap,
} from "./types";

export const HIGH_INTEREST_RATE = 9;
export const PASSING_SCORE = 7;

interface ItemCosts {
  cashOutlay: number;
  loanAmount: number;
  monthlyPayment: number;
  monthlyTotal: number;
  totalInterest: number;
  totalPaid: number;
}

function itemCosts(p: PurchaseInput): ItemCosts {
  const financed = p.termMonths > 0 && p.price > 0;
  const downPayment = financed ? Math.min(Math.max(p.downPayment, 0), p.price) : p.price;
  const loanAmount = financed ? p.price - downPayment : 0;
  const monthlyPayment = loanPayment(loanAmount, p.annualRate, p.termMonths);
  const totalInterest = financed ? monthlyPayment * p.termMonths - loanAmount : 0;
  const cashOutlay = downPayment + p.upfrontCosts;
  return {
    cashOutlay,
    loanAmount,
    monthlyPayment,
    monthlyTotal: monthlyPayment + p.monthlyFee + p.monthlyRunningCosts,
    totalInterest,
    totalPaid: cashOutlay + monthlyPayment * (financed ? p.termMonths : 0),
  };
}

/**
 * Dos escenarios malos pero normales, cada uno por su lado: que tus ingresos
 * bajen `STRESS.incomeDrop`, o que el interés suba `STRESS.rateRise` puntos en
 * préstamos de más de `STRESS.longTermMonths` meses (hipotecas, donde el tipo
 * suele ser variable). Se queda con el peor de los dos, no con los dos a la vez:
 * la idea es comprobar que aguantas un golpe, no una tormenta perfecta.
 * Usa la nota sin topes del escenario malo: los topes son escalones y aquí
 * interesa cuánto se deteriora la compra, no volver a castigarla dos veces.
 */
function stressTest(profile: FinancialProfile, purchases: PurchaseInput[], guideline: number): number {
  const lowerIncome: FinancialProfile = {
    ...profile,
    monthlyIncome: profile.monthlyIncome * (1 - STRESS.incomeDrop),
  };
  const higherRate = purchases.map((p) =>
    p.termMonths >= STRESS.longTermMonths && p.price > p.downPayment
      ? { ...p, annualRate: p.annualRate + STRESS.rateRise }
      : p,
  );
  const scenarios = [evaluate(lowerIncome, purchases, guideline, false).rawScore];
  if (higherRate.some((p, i) => p.annualRate !== purchases[i].annualRate)) {
    scenarios.push(evaluate(profile, higherRate, guideline, false).rawScore);
  }
  return Math.min(...scenarios);
}

/**
 * Evalúa una o varias compras (Comprobar / Combinar) contra el perfil.
 * `guideline`: parte razonable de los ingresos para este tipo de gasto (0–1).
 */
export function evaluate(
  profile: FinancialProfile,
  purchases: PurchaseInput[],
  guideline: number,
  /** Interno: en la propia prueba de estrés no se vuelve a estresar (evita la recursión). */
  withStress = true,
): AffordabilityResult {
  const costs = purchases.map(itemCosts);
  const sum = (k: keyof ItemCosts) => costs.reduce((a, c) => a + c[k], 0);

  const income = profile.monthlyIncome;
  const freeCashBefore = income - profile.monthlyExpenses - profile.monthlyDebtPayments;
  const cashOutlay = sum("cashOutlay");
  const monthlyTotal = sum("monthlyTotal");
  const marginAfter = freeCashBefore - monthlyTotal;
  const effortRatio = income > 0 ? monthlyTotal / income : Infinity;
  const savingsAfterPurchase = profile.savings - cashOutlay;
  const savingsAfter = savingsAfterPurchase - profile.upcomingExpenses;
  const monthlyNeeds = profile.monthlyExpenses + profile.monthlyDebtPayments + monthlyTotal;
  const cushionMonths = monthlyNeeds > 0 ? Math.max(0, savingsAfter) / monthlyNeeds : 0;

  const factors = [
    effortFactor(effortRatio, guideline),
    marginFactor(marginAfter, income),
    cushionFactor(cushionMonths, profile.emergencyMonths),
  ];

  const flags: FlagCode[] = [];
  const caps: ScoreCap[] = [];
  const cap = (flag: keyof typeof CAPS) => {
    flags.push(flag);
    caps.push({ flag, max: CAPS[flag] });
  };

  if (income <= 0) {
    flags.push("no_income");
    caps.push({ flag: "no_income", max: 0 });
  }
  if (savingsAfterPurchase < 0) cap("not_enough_savings");
  else if (savingsAfter < 0) cap("upcoming_uncovered");
  if (marginAfter < 0) cap("negative_margin");

  const cushionRel = profile.emergencyMonths > 0 ? cushionMonths / profile.emergencyMonths : 1;
  if (cushionRel < 0.5) cap("cushion_critical");
  else if (cushionRel < 1) cap("cushion_below_target");

  if (effortRatio > guideline) {
    flags.push("over_guideline");
    const max = effortCap(effortRatio, guideline);
    if (max !== null) caps.push({ flag: "over_guideline", max });
  }
  if (
    purchases.some(
      (p) => p.termMonths > 0 && p.price > p.downPayment && p.annualRate >= HIGH_INTEREST_RATE,
    )
  ) {
    flags.push("high_interest");
  }

  const rawScore = round(combineFactors(factors), 1);

  // Prueba de estrés: la misma compra con ingresos más bajos y, en préstamos
  // largos, con el interés más alto. Lo que solo aguanta si nada va mal no aprueba.
  const stressScore = withStress ? stressTest(profile, purchases, guideline) : rawScore;
  if (withStress && rawScore > stressScore + STRESS.maxGap) {
    flags.push("stress_fragile");
    caps.push({ flag: "stress_fragile", max: round(stressScore + STRESS.maxGap, 1) });
  }

  const cappedBy = strongestCap(caps);
  const appliedCap = cappedBy && rawScore > cappedBy.max ? cappedBy : null;
  const score = appliedCap ? appliedCap.max : rawScore;

  return {
    score,
    verdict: verdictFor(score),
    rawScore,
    stressScore,
    appliedCap,
    factors,
    flags,
    freeCashBefore,
    cashOutlay,
    loanAmount: sum("loanAmount"),
    monthlyPayment: sum("monthlyPayment"),
    monthlyTotal,
    marginAfter,
    effortRatio,
    guideline,
    savingsAfter,
    cushionMonths,
    cushionTargetMonths: profile.emergencyMonths,
    totalInterest: sum("totalInterest"),
    totalPaid: sum("totalPaid"),
    yearlyCost: monthlyTotal * 12,
  };
}

export const evaluateOne = (profile: FinancialProfile, purchase: PurchaseInput, guideline: number) =>
  evaluate(profile, [purchase], guideline);

/** Versión escalada de una compra: mismo tipo de bien, más barato o más caro. */
export function scalePurchase(p: PurchaseInput, factor: number): PurchaseInput {
  const price = p.price * factor;
  return {
    ...p,
    price,
    downPayment: Math.min(p.downPayment, price),
    upfrontCosts: p.upfrontCosts * factor,
    monthlyFee: p.monthlyFee * factor,
  };
}

export const PLAN_FACTORS: Record<PlanTier, number> = { budget: 0.5, value: 0.75, top: 1 };

/** Los 3 planes: barato, calidad-precio y top (lo que pides). */
export function buildPlans(profile: FinancialProfile, purchase: PurchaseInput, guideline: number): Plan[] {
  return (Object.keys(PLAN_FACTORS) as PlanTier[]).map((tier) => {
    const scaled = scalePurchase(purchase, PLAN_FACTORS[tier]);
    return { tier, factor: PLAN_FACTORS[tier], purchase: scaled, result: evaluateOne(profile, scaled, guideline) };
  });
}

/** Precio (o cuota) máximo con el que la nota llega a `target`. Null si ni al mínimo llega. */
export function maxAffordable(
  profile: FinancialProfile,
  purchase: PurchaseInput,
  guideline: number,
  target = PASSING_SCORE,
): { factor: number; purchase: PurchaseInput } | null {
  const scoreAt = (k: number) => evaluateOne(profile, scalePurchase(purchase, k), guideline).score;
  const MIN = 0.01;
  if (scoreAt(MIN) < target) return null;
  let lo = MIN;
  let hi = 1;
  while (scoreAt(hi) >= target && hi < 64) {
    lo = hi;
    hi *= 2;
  }
  if (hi >= 64) return { factor: hi, purchase: scalePurchase(purchase, hi) };
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (scoreAt(mid) >= target) lo = mid;
    else hi = mid;
  }
  return { factor: lo, purchase: scalePurchase(purchase, lo) };
}

/**
 * Objetivo de ahorro: meses ahorrando `monthlySaving` hasta que te dé.
 * Supuesto explícito: si se financia, la mitad de lo ahorrado va a la entrada.
 */
export function timeToAfford(
  profile: FinancialProfile,
  purchase: PurchaseInput,
  guideline: number,
  monthlySaving: number,
  maxMonths = 60,
  target = PASSING_SCORE,
): number | null {
  if (monthlySaving <= 0) return null;
  const financed = purchase.termMonths > 0;
  for (let m = 1; m <= maxMonths; m++) {
    const saved = monthlySaving * m;
    const p: PurchaseInput = financed
      ? { ...purchase, downPayment: Math.min(purchase.price, purchase.downPayment + saved / 2) }
      : purchase;
    if (evaluateOne({ ...profile, savings: profile.savings + saved }, p, guideline).score >= target) return m;
  }
  return null;
}

/** Ritmo de ahorro sugerido: la mitad de lo que te sobra cada mes, redondeado a 10 €. */
export function suggestedMonthlySaving(profile: FinancialProfile): number {
  const free = profile.monthlyIncome - profile.monthlyExpenses - profile.monthlyDebtPayments;
  return Math.max(0, Math.floor(free / 2 / 10) * 10);
}
