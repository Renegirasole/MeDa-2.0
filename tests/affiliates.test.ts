import { test } from "node:test";
import assert from "node:assert/strict";
import { affiliate, dealLinks, travelLinks } from "../lib/affiliates";

// Intl separa "€" con espacio duro
const plain = (s: string) => s.replace(/\s/g, " ");

test("sin plantilla: enlace directo con UTM", () => {
  const href = affiliate("x", "https://www.lineadirecta.com/seguros-coche/", "coche", undefined);
  const u = new URL(href);
  assert.equal(u.hostname, "www.lineadirecta.com");
  assert.equal(u.searchParams.get("utm_source"), "meda");
  assert.equal(u.searchParams.get("utm_campaign"), "coche");
});

test("plantilla Awin: destino codificado en ued", () => {
  const href = affiliate("x", "https://www.h2bhipotecas.com/", "vivienda", "https://www.awin1.com/cread.php?awinmid=1&awinaffid=2&ued={url}");
  const u = new URL(href);
  assert.equal(u.hostname, "www.awin1.com");
  assert.ok(u.searchParams.get("ued")!.startsWith("https://www.h2bhipotecas.com/?utm_source=meda"));
});

test("plantilla rota o no https: se ignora", () => {
  assert.ok(affiliate("x", "https://a.es/", "c", "sin marcador").startsWith("https://a.es/"));
  assert.ok(affiliate("x", "https://a.es/", "c", "http://evil.es/?u={url}").startsWith("https://a.es/"));
});

const byPartner = (slug: Parameters<typeof dealLinks>[0], partner: string, ctx = {}) =>
  dealLinks(slug, ctx).find((l) => l.partner === partner)!;

test("coche: tope redondeado hacia abajo en el filtro y en el texto", () => {
  const coches = byPartner("coche", "coches.net", { budget: 16805 });
  assert.equal(new URL(coches.href).searchParams.get("MaxPrice"), "16800");
  assert.equal(plain(coches.label), "Coches hasta 16.800 € en coches.net");
});

// El aviso bajo el bloque dice que los partners con acuerdo salen primero: si esto cambia, hay que cambiar el texto.
test("el partner con acuerdo va el primero", () => {
  for (const slug of ["coche", "moto", "alquilar-vivienda", "comprar-vivienda"] as const) {
    assert.equal(dealLinks(slug)[0].kind, "compare", slug);
  }
});

test("vivienda: hipoteca con el importe a financiar", () => {
  const [hipoteca, fotocasa] = dealLinks("comprar-vivienda", { budget: 212_450, loan: 180_300 });
  assert.equal(hipoteca.kind, "compare");
  assert.equal(plain(hipoteca.label), "Compara hipotecas para 180.000 €");
  assert.equal(new URL(fotocasa.href).searchParams.get("maxPrice"), "212000");
});

test("sin contexto: textos genéricos y sin filtros", () => {
  const coches = byPartner("coche", "coches.net");
  assert.equal(coches.label, "Buscar en coches.net");
  assert.equal(new URL(coches.href).searchParams.get("MaxPrice"), null);
  assert.deepEqual(dealLinks("otro"), []);
});

test("viajes: destino ya puesto en Booking", () => {
  const [booking] = travelLinks("Lisboa");
  assert.equal(new URL(booking.href).searchParams.get("ss"), "Lisboa");
});
