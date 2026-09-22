import { test } from "node:test";
import assert from "node:assert/strict";
import { adjustForFeatures, DEFAULT_FEATURES, floorFactor } from "../lib/zonas/caracteristicas";

const base = { ...DEFAULT_FEATURES, views: "exterior" as const };

test("sin ascensor, cuanto más alto menos vale", () => {
  assert.ok(floorFactor(4, false) < floorFactor(2, false));
  assert.ok(floorFactor(2, false) < floorFactor(1, false));
  assert.equal(floorFactor(4, true), 1);
  assert.ok(floorFactor(7, true) > 1);
  assert.equal(floorFactor(null, true), 1);
});

test("para reformar resta y reformado suma", () => {
  const malo = adjustForFeatures(200_000, { ...base, condition: "reformar" }, 2500, "venta");
  const bueno = adjustForFeatures(200_000, { ...base, condition: "reformado" }, 2500, "venta");
  assert.ok(malo.value < 200_000 && bueno.value > 200_000);
  assert.equal(malo.breakdown[0].label, "Para reformar");
});

test("garaje y trastero suman importe, no porcentaje", () => {
  const con = adjustForFeatures(200_000, { ...base, garage: true, storage: true }, 2000, "venta");
  const sin = adjustForFeatures(200_000, base, 2000, "venta");
  assert.equal(con.value - sin.value, (12 + 4) * 2000);
  assert.ok(con.breakdown.some((b) => b.label === "Plaza de garaje" && b.amount === 24_000));
});

test("el alquiler se redondea a decenas y la venta a miles", () => {
  assert.equal(adjustForFeatures(1234, base, 12, "alquiler").value % 10, 0);
  assert.equal(adjustForFeatures(233_456, base, 2500, "venta").value % 1000, 0);
});

test("un piso normal, exterior y con ascensor apenas se mueve", () => {
  const r = adjustForFeatures(200_000, { ...base, floor: 3 }, 2500, "venta");
  assert.ok(Math.abs(r.value - 200_000) / 200_000 < 0.05);
  assert.equal(r.breakdown.length, 1); // solo "Exterior"
});

test("obra nueva no se cuenta dos veces", () => {
  const f = { ...base, condition: "nuevo" as const };
  const normal = adjustForFeatures(200_000, f, 2500, "venta");
  const yaNueva = adjustForFeatures(200_000, f, 2500, "venta", true);
  assert.ok(normal.value > yaNueva.value);
  assert.ok(!yaNueva.breakdown.some((b) => b.label === "A estrenar"));
});
