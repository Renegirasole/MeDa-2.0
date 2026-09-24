import { test } from "node:test";
import assert from "node:assert/strict";
import { affiliate, attractionLink, dealLinks, tripSteps, type TripStepsContext } from "../lib/affiliates";

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

const ctx = (over: Partial<TripStepsContext> = {}): TripStepsContext => ({
  tier: "value",
  mode: "avion",
  origin: { name: "Sevilla", country: "ES" },
  destination: { name: "Lisboa", country: "PT", iata: "LIS", civitatisSlug: "lisboa", transferSlug: "lisbon", esimSlug: null },
  airport: { iata: "SVQ", city: "Sevilla" },
  depart: "2026-10-15",
  return: "2026-10-18",
  travelers: 3,
  ...over,
});

const titles = (c: TripStepsContext) => tripSteps(c).map((s) => s.title);
const allLinks = (c: TripStepsContext) => tripSteps(c).flatMap((s) => s.links);

test("viajes: la reserva va en el orden en que se hace", () => {
  assert.deepEqual(titles(ctx()), [
    "Cómo llegar desde tu casa",
    "Reserva los vuelos",
    "Reserva el traslado al hotel",
    "Reserva el alojamiento",
    "Reserva actividades",
    "Antes de salir",
  ]);
});

test("viajes: Booking con fechas, personas y habitaciones ya puestas", () => {
  const booking = allLinks(ctx()).find((l) => l.partner === "Booking.com")!;
  const u = new URL(booking.href);
  assert.equal(u.searchParams.get("ss"), "Lisboa");
  assert.equal(u.searchParams.get("checkin"), "2026-10-15");
  assert.equal(u.searchParams.get("checkout"), "2026-10-18");
  assert.equal(u.searchParams.get("group_adults"), "3");
  assert.equal(u.searchParams.get("no_rooms"), "2");
  assert.equal(u.searchParams.get("nflt"), "class=3");
});

test("viajes: Skyscanner con aeropuerto de salida, fechas y cabina según el plan", () => {
  const sky = (c: TripStepsContext) => new URL(allLinks(c).find((l) => l.partner === "Skyscanner")!.href);
  const u = sky(ctx());
  assert.equal(u.pathname, "/transporte/vuelos/svq/lis/261015/261018/");
  assert.equal(u.searchParams.get("adultsv2"), "3");
  assert.equal(u.searchParams.get("cabinclass"), "economy");
  assert.equal(sky(ctx({ tier: "top" })).searchParams.get("cabinclass"), "premiumeconomy");
});

test("viajes: el vuelo real encontrado va el primero, solo en el plan barato", () => {
  const flight = { href: "https://www.aviasales.com/search/SVQ1510LIS1810?marker=1", perPerson: 87 };
  const [first] = tripSteps(ctx({ tier: "budget", flight }))[1].links;
  assert.equal(first.partner, "Aviasales");
  assert.equal(first.href, flight.href);
  assert.ok(!tripSteps(ctx({ flight }))[1].links.some((l) => l.partner === "Aviasales"));
});

test("viajes: el plan barato no tiene traslado y lleva a hostales ordenados por precio", () => {
  const c = ctx({ tier: "budget" });
  assert.ok(!titles(c).includes("Reserva el traslado al hotel"));
  const links = allLinks(c);
  assert.equal(new URL(links.find((l) => l.partner === "Booking.com")!.href).searchParams.get("order"), "price");
  assert.ok(links.some((l) => l.partner === "Hostelworld"));
});

test("viajes: por tierra, tren con alternativa en BlaBlaCar; bus en el barato; ruta en coche si está cerca", () => {
  const land = { mode: "tren" as const, airport: null, destination: { ...ctx().destination, name: "Madrid", country: "ES" } };
  assert.deepEqual(tripSteps(ctx(land))[1].links.map((l) => l.partner), ["Google", "BlaBlaCar"]);
  const bus = tripSteps(ctx({ ...land, tier: "budget", mode: "bus" }))[1];
  assert.equal(bus.title, "Reserva bus o coche compartido");
  assert.equal(new URL(bus.links[0].href).searchParams.get("db"), "2026-10-15");
  assert.equal(tripSteps(ctx({ ...land, mode: "coche" }))[1].links[0].partner, "Google Maps");
  // Sin salir de España no hay seguro de viaje ni eSIM: no hay paso «Antes de salir».
  assert.ok(!titles(ctx(land)).includes("Antes de salir"));
});

test("viajes: traslado en Welcome Pickups si cubren la ciudad; si no, GetYourGuide", () => {
  const withSlug = tripSteps(ctx())[2].links[0];
  assert.equal(withSlug.partner, "Welcome Pickups");
  assert.ok(withSlug.href.includes("/lisbon/"));
  const without = tripSteps(ctx({ destination: { ...ctx().destination, transferSlug: null } }))[2].links[0];
  assert.equal(without.partner, "GetYourGuide");
});

test("viajes: Civitatis con su slug; sin slug, GetYourGuide", () => {
  const civ = allLinks(ctx({ tier: "budget" })).find((l) => l.partner === "Civitatis")!;
  assert.equal(civ.href.split("?")[0], "https://www.civitatis.com/es/lisboa/");
  const noSlug = ctx({ tier: "budget", destination: { ...ctx().destination, civitatisSlug: null } });
  assert.ok(!allLinks(noSlug).some((l) => l.partner === "Civitatis"));
});

test("viajes: antes de salir, eSIM si hace falta y seguro si se sale del país", () => {
  const far = ctx({ destination: { ...ctx().destination, name: "Bangkok", country: "TH", esimSlug: "thailand" } });
  const before = tripSteps(far).at(-1)!;
  assert.equal(before.title, "Antes de salir");
  assert.deepEqual(before.links.map((l) => l.partner), ["Airalo", "Assist Card"]);
  assert.equal(before.links[0].href.split("?")[0], "https://www.airalo.com/thailand-esim");
});

test("viajes: entradas de cada atracción del «qué ver»", () => {
  const link = attractionLink("Coliseo", "Roma");
  assert.equal(new URL(link.href).searchParams.get("q"), "Coliseo Roma");
});
