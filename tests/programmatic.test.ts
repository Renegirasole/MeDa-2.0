import { test } from "node:test";
import assert from "node:assert/strict";
import { loanPayment } from "../lib/engine";
import { evaluateOne, PASSING_SCORE } from "../lib/engine";
import {
  CAR,
  carProfile,
  mortgageCase,
  CAR_ASSUMPTIONS,
  CAR_SALARIES,
  carCase,
  loanFor,
  MORTGAGE_AMOUNTS,
  neighbors,
  parseCarSlug,
  parseMortgageSlug,
  parseRentSlug,
  PROGRAMMATIC_PATHS,
  RENT,
  RENT_SALARIES,
  rentCase,
} from "../lib/programmatic";

test("50 páginas, sin repetidas", () => {
  assert.equal(PROGRAMMATIC_PATHS.length, 50);
  assert.equal(new Set(PROGRAMMATIC_PATHS).size, 50);
});

test("los slugs solo aceptan cifras publicadas", () => {
  assert.equal(parseMortgageSlug("hipoteca-200000"), 200_000);
  assert.equal(parseMortgageSlug("hipoteca-210000"), null);
  assert.equal(parseCarSlug("coche-con-1500"), 1500);
  assert.equal(parseCarSlug("coche-con-99999"), null);
  assert.equal(parseRentSlug("sueldo-1800"), 1800);
  assert.equal(parseRentSlug("sueldo-abc"), null);
  assert.ok(MORTGAGE_AMOUNTS.includes(200_000));
});

test("loanFor es la inversa de la cuota", () => {
  const loan = loanFor(300, 7.5, 60);
  assert.ok(Math.abs(loanPayment(loan, 7.5, 60) - 300) < 1e-6);
  assert.equal(loanFor(0, 7.5, 60), 0);
  assert.equal(loanFor(100, 0, 10), 1000);
});

test("coche: todo el coche al mes no pasa de la referencia", () => {
  for (const s of CAR_SALARIES) {
    const c = carCase(s);
    const payment = loanPayment(c.maxPriceRule - CAR_ASSUMPTIONS.downPayment, CAR_ASSUMPTIONS.rate, CAR_ASSUMPTIONS.months);
    assert.ok(payment + CAR_ASSUMPTIONS.running <= s * CAR.guideline + 1e-6, `sueldo ${s}`);
  }
  // Más sueldo, más coche
  assert.ok(carCase(2000).maxPrice > carCase(1500).maxPrice);
});

test("las páginas nunca prometen más de lo que aprueba la calculadora", () => {
  for (const s of CAR_SALARIES) {
    const c = carCase(s);
    assert.ok(c.maxPrice <= c.maxPriceRule, `coche con ${s}`);
    const r = evaluateOne(carProfile(s), { ...CAR.defaults, price: c.maxPrice }, CAR.guideline);
    assert.ok(r.score >= PASSING_SCORE, `coche con ${s} → nota ${r.score}`);
  }
  for (const s of RENT_SALARIES) {
    const c = rentCase(s);
    assert.ok(c.maxRent <= c.maxRentRule, `alquiler con ${s}`);
  }
  for (const loan of MORTGAGE_AMOUNTS) {
    const c = mortgageCase(loan);
    assert.ok(c.income30 >= c.r30.minIncomeEffort, `hipoteca de ${loan}`);
  }
});

test("alquiler: renta + suministros por debajo del 35 %; la regla del 30 % es más prudente", () => {
  for (const s of RENT_SALARIES) {
    const r = rentCase(s);
    assert.ok(r.maxRent + RENT.defaults.monthlyRunningCosts <= s * RENT.guideline + 1e-6);
    assert.ok(r.strictRent < r.maxRent);
  }
});

test("vecinos: el propio valor y hasta dos a cada lado", () => {
  assert.deepEqual(neighbors([1, 2, 3, 4, 5, 6], 1), [1, 2, 3]);
  assert.deepEqual(neighbors([1, 2, 3, 4, 5, 6], 4), [2, 3, 4, 5, 6]);
});
