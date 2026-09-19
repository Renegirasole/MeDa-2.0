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
