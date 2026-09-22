import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateListings, cellId } from "../lib/zonas/portales";
import { estimateFromListings } from "../lib/zonas/tasacion";

const homes = (n: number, unit: number, size = 80) => Array.from({ length: n }, () => ({ price: unit * size, size }));

test("con pocos anuncios no se publica una cifra", () => {
  assert.equal(aggregateListings(homes(7, 3000)), null);
});

test("cuartiles de €/m² de los anuncios", () => {
  const list = [2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800].map((u) => ({ price: u * 90, size: 90 }));
  const s = aggregateListings(list);
  assert.ok(s);
  assert.equal(s.count, 10);
  assert.equal(s.median, 2900);
  assert.ok(s.p25 < s.median && s.median < s.p75);
  assert.equal(s.medianArea, 90);
  assert.equal(s.source, "idealista");
});

test("se tiran los anuncios imposibles y los que no son pisos", () => {
  const list = [
    ...homes(9, 3000),
    { price: 12_000, size: 12 }, // trastero
    { price: 9_000_000, size: 600 }, // palacete
    { price: "x", size: 80 }, // dato roto
  ];
  const s = aggregateListings(list);
  assert.ok(s);
  assert.equal(s.count, 9);
  assert.equal(s.median, 3000);
});

test("un anuncio disparatado no mueve la mediana (criterio de Tukey)", () => {
  const list = [...homes(11, 3000, 80), { price: 40_000 * 80, size: 80 }];
  const s = aggregateListings(list);
  assert.ok(s);
  assert.equal(s.median, 3000);
  assert.equal(s.count, 11);
});

test("el precio sale de multiplicar por los metros de tu piso", () => {
  const s = aggregateListings(homes(10, 3000))!;
  const venta = estimateFromListings(s, "venta", 95)!;
  assert.equal(venta.market, 285_000);
  assert.equal(venta.market % 1000, 0);
  const alquiler = estimateFromListings(aggregateListings(homes(10, 14))!, "alquiler", 70)!;
  assert.equal(alquiler.market, 980);
  assert.equal(estimateFromListings(s, "venta", 0), null);
});

test("la celda de caché agrupa direcciones de la misma manzana", () => {
  assert.equal(cellId(40.4168, -3.7038), cellId(40.4171, -3.7041));
  assert.notEqual(cellId(40.4168, -3.7038), cellId(40.4268, -3.7038));
});

test("se compara con pisos de tu tamaño cuando los hay", () => {
  // Estudios caros por metro y pisos grandes más baratos, en la misma calle.
  const list = [
    ...Array.from({ length: 10 }, () => ({ price: 4000 * 45, size: 45 })),
    ...Array.from({ length: 10 }, () => ({ price: 2500 * 120, size: 120 })),
  ];
  const s = aggregateListings(list)!;
  const estudio = estimateFromListings(s, "venta", 45)!;
  const grande = estimateFromListings(s, "venta", 120)!;
  assert.equal(estudio.unitPrice, 4000);
  assert.equal(grande.unitPrice, 2500);
  assert.equal(estudio.matched, 10);
  // Sin anuncios del tamaño pedido, se usa toda la zona.
  const raro = estimateFromListings(s, "venta", 250)!;
  assert.equal(raro.matched, 0);
  assert.equal(raro.unitPrice, s.median);
});
