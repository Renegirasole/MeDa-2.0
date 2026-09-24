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

const trip = (over: Partial<Parameters<typeof travelLinks>[0]> = {}) =>
  travelLinks({
    destination: "Lisboa",
    country: "PT",
    originCountry: "ES",
    transferSlug: "lisbon",
    esimSlug: null,
    tier: "value",
    flying: true,
    travelers: 2,
    ...over,
  });

test("viajes: destino y personas ya puestos en Booking", () => {
  const booking = trip().find((l) => l.partner === "Booking.com")!;
  const u = new URL(booking.href);
  assert.equal(u.searchParams.get("ss"), "Lisboa");
  assert.equal(u.searchParams.get("group_adults"), "2");
  assert.equal(u.searchParams.get("no_rooms"), "1");
  assert.equal(u.searchParams.get("nflt"), "class=3");
});

test("viajes: el plan barato lleva a hostales y ordena por precio", () => {
  const links = trip({ tier: "budget" });
  const booking = links.find((l) => l.partner === "Booking.com")!;
  assert.equal(new URL(booking.href).searchParams.get("order"), "price");
  assert.ok(links.some((l) => l.partner === "Hostelworld"));
  // Sin traslado en el plan barato: se va en transporte público.
  assert.ok(!links.some((l) => l.partner === "Welcome Pickups"));
});

test("viajes: traslado solo si se vuela, y con la ciudad que cubre el partner", () => {
  const flying = trip().find((l) => l.partner === "Welcome Pickups");
  assert.ok(flying?.href.includes("/lisbon/"));
  assert.ok(!trip({ flying: false }).some((l) => l.partner === "Welcome Pickups"));
});

test("viajes: sin ciudad de traslados, se busca en GetYourGuide", () => {
  const links = trip({ transferSlug: null });
  const transfer = links.find((l) => l.label.startsWith("Traslado"))!;
  assert.equal(transfer.partner, "GetYourGuide");
});

test("viajes: la eSIM solo aparece cuando hace falta", () => {
  assert.ok(!trip().some((l) => l.partner === "Airalo"));
  const far = trip({ country: "TH", esimSlug: "thailand" }).find((l) => l.partner === "Airalo")!;
  assert.equal(far.href.split("?")[0], "https://www.airalo.com/thailand-esim");
});
