import { test } from "node:test";
import assert from "node:assert/strict";
import {
  appraiseByArea,
  appraiseByKm,
  buildPlans,
  compareOffers,
  evaluateOne,
  loanPayment,
  maxAffordable,
  type FinancialProfile,
  type PurchaseInput,
} from "../lib/engine";
import { EXAMPLE_OFFERS } from "../lib/data/examples";

const profile: FinancialProfile = {
  monthlyIncome: 2100,
  monthlyExpenses: 1050,
  monthlyDebtPayments: 0,
  savings: 8000,
  emergencyMonths: 3,
  upcomingExpenses: 0,
};

const car = (price: number): PurchaseInput => ({
  price,
  downPayment: 3000,
  termMonths: 60,
  annualRate: 7.5,
  upfrontCosts: 400,
  monthlyFee: 0,
  monthlyRunningCosts: 200,
});

test("cuota francesa coincide con la fórmula de referencia", () => {
  // 10.000 € a 5 años al 6 % TIN → 193,33 €/mes
  assert.equal(Math.round(loanPayment(10000, 6, 60) * 100) / 100, 193.33);
  assert.equal(loanPayment(12000, 0, 12), 1000);
});

test("ejemplo de la home: 16.000 € da 'Sí, te da'", () => {
  const r = evaluateOne(profile, car(16000), 0.2);
  assert.ok(r.score >= 7, `nota ${r.score}`);
  assert.equal(r.verdict, "yes");
});

test("el ejemplo original de 30.000 € no llega al aprobado", () => {
  const r = evaluateOne(profile, car(30000), 0.2);
  assert.ok(r.score < 7, `nota ${r.score}`);
});

test("la nota es monótona: más caro nunca puntúa mejor", () => {
  let prev = Infinity;
  for (let price = 5000; price <= 60000; price += 2500) {
    const s = evaluateOne(profile, car(price), 0.2).score;
    assert.ok(s <= prev + 1e-9, `${price} → ${s} > ${prev}`);
    prev = s;
  }
});

test("la nota siempre está entre 0 y 10", () => {
  const broke: FinancialProfile = { ...profile, monthlyIncome: 900, savings: 0 };
  for (const p of [broke, profile]) {
    for (const price of [0, 1000, 100000, 1e7]) {
      const s = evaluateOne(p, car(price), 0.2).score;
      assert.ok(s >= 0 && s <= 10);
    }
  }
});

test("3 planes ordenados de barato a top", () => {
  const plans = buildPlans(profile, car(20000), 0.2);
  assert.deepEqual(plans.map((p) => p.tier), ["budget", "value", "top"]);
  assert.ok(plans[0].result.score >= plans[2].result.score);
});

test("máximo asumible aprueba y un poco más ya no", () => {
  const max = maxAffordable(profile, car(30000), 0.2);
  assert.ok(max !== null);
  assert.ok(evaluateOne(profile, max!.purchase, 0.2).score >= 7);
  const over = { ...max!.purchase, price: max!.purchase.price * 1.1 };
  assert.ok(evaluateOne(profile, over, 0.2).score < 7);
});

test("comparador: la oferta más barata no es la que más conviene", () => {
  const c = compareOffers(profile, EXAMPLE_OFFERS, 0.2);
  assert.equal(c.ranked[0].id, "b");
  assert.equal(c.cheapestIsNotBest, true);
});

test("tasador: sin 3 comparables no inventa precio", () => {
  assert.equal(appraiseByArea([{ price: 200000, area: 80 }], 80), null);
  const a = appraiseByArea(
    [
      { price: 200000, area: 80 },
      { price: 240000, area: 90 },
      { price: 180000, area: 75 },
    ],
    85,
  );
  assert.ok(a && a.quick <= a.market && a.market <= a.ambitious);
});

test("tasador de coche: más km nunca sube el precio", () => {
  const comps = [
    { price: 15000, km: 40000 },
    { price: 13000, km: 80000 },
    { price: 11000, km: 120000 },
  ];
  const low = appraiseByKm(comps, 50000)!;
  const high = appraiseByKm(comps, 110000)!;
  assert.ok(high.market <= low.market);
});
