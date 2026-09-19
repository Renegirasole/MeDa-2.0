import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate, neighbourhoodFactor, saleUnitPrice } from "../lib/zonas/tasacion";
import type { Zone } from "../lib/zonas/tipos";

const zone = (over: Partial<Zone> = {}): Zone => ({
  level: "barrio",
  muniCode: "28079",
  muniName: "Madrid",
  provCode: "28",
  provName: "Madrid",
  sectionCode: "2807901001",
  rent: { p25: 12, median: 18, p75: 24, count: 150, area: null },
  rentLevel: "barrio",
  muniRent: { p25: 11, median: 14, p75: 18, count: 300000, area: 66 },
  sale: { total: 5400, new: 6200, old: 5390 },
  saleLevel: "municipio",
  ...over,
});

test("alquiler: cuartiles del barrio por los metros", () => {
  const r = estimate(zone(), "alquiler", 70);
  assert.ok(r);
  assert.equal(r.market, 1260); // 18 €/m² × 70
  assert.equal(r.quick, 840);
  assert.equal(r.ambitious, 1680);
  assert.ok(r.quick < r.market && r.market < r.ambitious);
});

test("el barrio caro sube el precio de venta, pero con tope", () => {
  assert.equal(Number(neighbourhoodFactor(zone()).toFixed(4)), Number((18 / 14).toFixed(4)));
  // Un barrio disparatado no multiplica el precio sin límite.
  const raro = zone({ rent: { p25: 40, median: 60, p75: 80, count: 12, area: null } });
  assert.equal(neighbourhoodFactor(raro), 1.8);
});

test("venta: piso nuevo usa el valor de obra nueva", () => {
  const year = new Date().getFullYear();
  const viejo = saleUnitPrice(zone(), 1975)!;
  const nuevo = saleUnitPrice(zone(), year - 2)!;
  assert.ok(nuevo > viejo);
  assert.equal(Math.round(viejo), Math.round(5390 * (18 / 14)));
});

test("venta: el abanico es más estrecho que el de los alquileres", () => {
  const r = estimate(zone(), "venta", 100)!;
  const rentSpread = 24 / 12;
  assert.ok(r.ambitious / r.quick < rentSpread);
  assert.ok(r.quick < r.market && r.market < r.ambitious);
  assert.equal(r.market % 1000, 0);
});

test("sin dato de la zona no se inventa precio", () => {
  assert.equal(estimate(zone({ rent: null, rentLevel: null }), "alquiler", 80), null);
  assert.equal(estimate(zone({ sale: null, saleLevel: null }), "venta", 80), null);
  assert.equal(estimate(zone(), "venta", 0), null);
});

test("sin datos de barrio, el municipio manda y no hay ajuste", () => {
  const z = zone({ sectionCode: null, rentLevel: "municipio", rent: { p25: 11, median: 14, p75: 18, count: 300000, area: 66 } });
  assert.equal(neighbourhoodFactor(z), 1);
  assert.equal(estimate(z, "alquiler", 66)!.market, Math.round((14 * 66) / 10) * 10);
});
