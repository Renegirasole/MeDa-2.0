import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateOne, PASSING_SCORE } from "../lib/engine";
import { headlineCase, HOUSING, minIncomeFor, mortgagePurchase, mortgageRow, referenceProfile } from "../lib/guides/mortgage";
import { GUIDES } from "../lib/guides";

test("hipoteca de 200.000 € a 30 años al 3 %", () => {
  const r = mortgageRow(200_000);
  assert.equal(Math.round(r.payment), 843);
  assert.equal(r.price, 250_000);
  assert.equal(r.cashNeeded, 75_000);
  // Sueldo mínimo: coste mensual / 35 %, redondeado a 10 € hacia arriba
  assert.ok(r.minIncomeEffort * HOUSING.guideline >= r.monthlyTotal);
  assert.ok((r.minIncomeEffort - 10) * HOUSING.guideline < r.monthlyTotal);
});

test("más plazo, menos cuota; más interés, más cuota", () => {
  assert.ok(mortgageRow(200_000, 30).payment < mortgageRow(200_000, 25).payment);
  assert.ok(mortgageRow(200_000, 30, 4).payment > mortgageRow(200_000, 30, 3).payment);
});

test("sueldo mínimo para «Sí, te da»: justo en el umbral", () => {
  const row = mortgageRow(200_000);
  const base = referenceProfile(row);
  const purchase = mortgagePurchase(200_000);
  const min = minIncomeFor(base, purchase)!;
  assert.ok(evaluateOne({ ...base, monthlyIncome: min }, purchase, HOUSING.guideline).score >= PASSING_SCORE);
  assert.ok(evaluateOne({ ...base, monthlyIncome: min - 20 }, purchase, HOUSING.guideline).score < PASSING_SCORE);
});

test("el perfil de referencia cubre entrada, gastos y colchón", () => {
  const { row, profile, atEffort } = headlineCase();
  assert.ok(profile.savings >= row.cashNeeded + 3 * (profile.monthlyExpenses + row.monthlyTotal));
  assert.equal(atEffort.appliedCap, null);
});

test("guías con slug único y fechas ISO", () => {
  assert.equal(new Set(GUIDES.map((g) => g.slug)).size, GUIDES.length);
  for (const g of GUIDES) assert.match(g.updated, /^\d{4}-\d{2}-\d{2}$/);
});

test("coche: el reparto de gastos suma lo de la calculadora", async () => {
  const { carRow, RUNNING_EXAMPLE, CAR_GUIDE } = await import("../lib/guides/car");
  assert.equal(RUNNING_EXAMPLE.reduce((a, r) => a + r.value, 0), CAR_GUIDE.running);
  const r = carRow(16_000);
  assert.equal(Math.round(r.payment), 260);
  assert.equal(Math.round(r.monthlyTotal), 460);
  assert.ok(carRow(16_000, 84).interest > carRow(16_000, 36).interest);
});

test("informe joven 2026: las cifras de la descripción siguen saliendo del motor", async () => {
  const { reportRow, REPORT_PROFILES } = await import("../lib/report");
  const { GUIDE_BY_SLUG } = await import("../lib/guides");
  const plain = (s: string) => s.replace(/\s/g, " ");
  const { formatEUR } = await import("../lib/format");
  const y = reportRow(REPORT_PROFILES[1].net);
  const d = plain(GUIDE_BY_SLUG["que-le-da-a-un-joven-2026"].description);
  for (const v of [y.rent.maxRent, y.car.maxPrice, y.house.price]) assert.ok(d.includes(plain(formatEUR(v))), `${v} en la descripción`);
  assert.ok(y.yearsToBuy > 13 && y.yearsToBuy < 14.5, "«casi 14 años»");
});
