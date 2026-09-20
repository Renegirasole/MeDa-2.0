import { test } from "node:test";
import assert from "node:assert/strict";
import { planTrip } from "../lib/engine";
import {
  buildOptions,
  decodeSelection,
  encodeSelection,
  isPlace,
  searchDestinations,
  searchOrigins,
  type Place,
  type PlaceSelection,
} from "../lib/viajes/lugares";
import { esimSlug, needsEsim, priceIndex } from "../lib/viajes/paises";
import { estimateTransport, islandOf, resolveTrip, tripMode, TripError } from "../lib/viajes/resolver";
import { normalizePlaces, nextMonth, normalizeFlights } from "../lib/viajes/fuentes";
import { transferSlug } from "../lib/viajes/traslados";

const place = (over: Partial<Place> = {}): Place => ({
  code: "ZRH",
  name: "Zúrich",
  country: "Suiza",
  countryCode: "CH",
  lat: 47.3769,
  lon: 8.5417,
  nameEn: "Zurich",
  ...over,
});

const sel = (p: Place): PlaceSelection => ({ kind: "place", place: p });
const cat = (id: string, name: string): PlaceSelection => ({ kind: "catalog", id, name });

const MOSCOW = place({ code: "MOW", name: "Moscú", country: "Rusia", countryCode: "RU", lat: 55.7558, lon: 37.6173, nameEn: "Moscow" });
const BANGKOK = place({ code: "BKK", name: "Bangkok", country: "Tailandia", countryCode: "TH", lat: 13.7563, lon: 100.5018, nameEn: "Bangkok" });

// ——— Países ———

test("índice de precios: conocido, desconocido y minúsculas", () => {
  assert.equal(priceIndex("CH"), 1.9);
  assert.equal(priceIndex("ch"), 1.9);
  assert.equal(priceIndex("XX"), 1);
  assert.equal(priceIndex(null), 1);
});

test("eSIM: solo fuera del roaming europeo y con cobertura", () => {
  assert.equal(needsEsim("ES", "IT"), false); // roaming incluido
  assert.equal(needsEsim("ES", "TH"), true);
  assert.equal(needsEsim("TH", "TH"), false); // mismo país
  assert.equal(esimSlug("TH"), "thailand");
  assert.equal(esimSlug("US"), "united-states");
  assert.equal(esimSlug("RU"), null); // sin cobertura
});

// ——— Lugares ———

test("valida lo que llega de la API", () => {
  assert.ok(isPlace(place()));
  assert.ok(!isPlace(place({ code: "zrh" })));
  assert.ok(!isPlace({ ...place(), lat: 120 }));
  assert.ok(!isPlace(null));
});

test("el catálogo busca sin tildes y prioriza el principio", () => {
  assert.equal(searchDestinations("amster")[0].name, "Ámsterdam");
  assert.equal(searchOrigins("malaga")[0].name, "Málaga");
  assert.equal(searchOrigins("").length, 6);
});

test("un resultado del mundo que ya está en el catálogo no se duplica", () => {
  const romeFromApi = place({ code: "ROM", name: "Roma", country: "Italia", countryCode: "IT", lat: 41.9, lon: 12.5 });
  const options = buildOptions("destination", "roma", [romeFromApi]);
  assert.equal(options.filter((o) => o.name === "Roma").length, 1);
  assert.equal(options[0].group, "catalogo");
});

test("una ciudad que no tenemos se ofrece como resultado del mundo", () => {
  const options = buildOptions("destination", "zurich", [place()]);
  const world = options.find((o) => o.group === "mundo")!;
  assert.equal(world.name, "Zúrich");
  assert.equal(world.detail, "Suiza · ZRH");
});

test("la elección cabe en la URL y vuelve entera", () => {
  const original = sel(place());
  const back = decodeSelection(encodeSelection(original), "destination");
  assert.deepEqual(back, original);
  assert.deepEqual(decodeSelection(encodeSelection(cat("roma", "Roma")), "destination"), { kind: "catalog", id: "roma", name: "Roma" });
  assert.equal(decodeSelection("c:no-existe", "destination"), null);
  assert.equal(decodeSelection("basura", "origin"), null);
});

// ——— Motor ———

test("se vuela al cruzar el mar, entre continentes o a más de 700 km", () => {
  const madrid = { lat: 40.4168, lon: -3.7038, country: "ES" };
  const mallorca = { lat: 39.57, lon: 2.65, country: "ES" };
  const lisboa = { lat: 38.72, lon: -9.14, country: "PT" };
  const zurich = { lat: 47.38, lon: 8.54, country: "CH" };
  const oneWay = (a: typeof madrid, b: typeof madrid) => tripMode(a as never, b as never, 500);
  assert.equal(oneWay(madrid, mallorca), "avion"); // cruza mar
  assert.equal(oneWay(madrid, lisboa), "tierra"); // Europa continental y cerca
  assert.equal(tripMode(madrid as never, zurich as never, 1250), "avion"); // demasiado lejos
  assert.equal(tripMode(madrid as never, { lat: 13.7, lon: 100.5, country: "TH" } as never, 10_000), "avion");
  assert.equal(islandOf(39.57, 2.65), "baleares");
  assert.equal(islandOf(28.1, -15.4), "canarias");
  assert.equal(islandOf(40.4, -3.7), null);
});

test("el transporte estimado sube con la distancia y el avión cuesta más que el tren corto", () => {
  const near = estimateTransport(300, "tierra");
  const far = estimateTransport(3000, "avion");
  assert.ok(far.budget > near.budget);
  assert.ok(far.top > far.value && far.value > far.budget);
  // Ida y vuelta: 2 × (25 + 300 × 0,035) ≈ 71 €
  assert.equal(estimateTransport(300, "avion").budget, 71);
});

test("Zúrich → Moscú: se vuela, se estima y sale más caro que el catálogo español", () => {
  const trip = resolveTrip(sel(place()), sel(MOSCOW));
  assert.equal(trip.mode, "avion");
  assert.ok(trip.estimated);
  assert.ok(trip.km > 2000 && trip.km < 2500);
  assert.equal(trip.origin.iata, "ZRH");
  assert.equal(trip.destination.iata, "MOW");
  // Rusia es más barata que Suiza en destino (índice 0,7)
  assert.ok(trip.destination.foodPerDay.budget < 28 * 1.9);

  const plans = planTrip(trip.origin, trip.destination, { nights: 3, travelers: 2 });
  assert.equal(plans.length, 3);
  assert.ok(plans[0].perPerson > 0 && plans[0].perPerson < plans[2].perPerson);
  assert.deepEqual(plans[0].highlights, []); // sin guía propia: la UI enseña partners
});

test("una ciudad del buscador que es del catálogo usa las cifras revisadas a mano", () => {
  const romeFromApi = place({ code: "ROM", name: "Roma", country: "Italia", countryCode: "IT", lat: 41.9028, lon: 12.4964 });
  const trip = resolveTrip(cat("sevilla", "Sevilla"), sel(romeFromApi));
  assert.equal(trip.destination.id, "roma");
  assert.ok(trip.destination.highlights.budget.length > 0);
  assert.equal(trip.estimated, false);
  assert.deepEqual(trip.destination.transport, { budget: 90, value: 170, top: 320 });
});

test("desde fuera de España las cifras de transporte del catálogo no valen: se estiman", () => {
  const trip = resolveTrip(sel(place()), cat("roma", "Roma"));
  assert.ok(trip.estimated);
  assert.notDeepEqual(trip.destination.transport, { budget: 90, value: 170, top: 320 });
  assert.ok(trip.destination.highlights.budget.length > 0); // el «qué ver» sí se conserva
});

test("mismo origen y destino: no hay viaje que calcular", () => {
  assert.throws(() => resolveTrip(cat("madrid", "Madrid"), cat("madrid", "Madrid")), TripError);
});

test("traslados: por id de catálogo, por nombre en inglés, o ninguno", () => {
  assert.equal(transferSlug({ catalogId: "sevilla" }), "seville");
  assert.equal(transferSlug({ nameEn: "Bangkok" }), "bangkok");
  assert.equal(transferSlug({ nameEn: "Moscow" }), null);
  assert.equal(transferSlug({}), null);
});

// ——— Fuentes ———

test("los aeropuertos se agrupan en su ciudad y la basura se descarta", () => {
  const places = normalizePlaces([
    { type: "airport", code: "LHR", name: "Heathrow", city_code: "LON", city_name: "Londres", country_code: "GB", country_name: "Reino Unido", coordinates: { lat: 51.47, lon: -0.45 } },
    { type: "airport", code: "LGW", name: "Gatwick", city_code: "LON", city_name: "Londres", country_code: "GB", country_name: "Reino Unido", coordinates: { lat: 51.15, lon: -0.18 } },
    { type: "city", code: "PAR", name: "París", country_code: "FR", country_name: "Francia", coordinates: { lat: 48.85, lon: 2.35 } },
    { type: "city", code: "BAD", name: "Sin coordenadas", country_code: "ES" },
    null,
  ]);
  assert.deepEqual(places.map((p) => p.code), ["LON", "PAR"]);
});

test("el nombre en inglés se cruza con la respuesta en inglés", () => {
  const es = [{ type: "city", code: "MOW", name: "Moscú", country_code: "RU", country_name: "Rusia", coordinates: { lat: 55.75, lon: 37.61 } }];
  const en = [{ type: "city", code: "MOW", name: "Moscow", country_code: "RU", country_name: "Russia", coordinates: { lat: 55.75, lon: 37.61 } }];
  assert.equal(normalizePlaces(es, 8, en)[0].nameEn, "Moscow");
});

test("precio de vuelo: se queda el más barato y añade el marker al enlace", () => {
  const json = {
    success: true,
    data: [
      { price: 180, airline: "IB", transfers: 1, link: "/search/MAD1010ROM?x=1" },
      { price: 95, airline: "FR", transfers: 0, return_transfers: 0, link: "/search/MAD1010ROM?x=2" },
    ],
  };
  const price = normalizeFlights(json, "2026-10", "12345")!;
  assert.equal(price.perPerson, 95);
  assert.equal(price.airline, "FR");
  assert.equal(price.stops, 0);
  assert.equal(new URL(price.link!).searchParams.get("marker"), "12345");
  assert.equal(price.affiliate, true);

  assert.equal(normalizeFlights({ success: true, data: [] }, "2026-10"), null);
  assert.equal(normalizeFlights({ success: false }, "2026-10"), null);
  assert.equal(normalizeFlights(normalizeFlights(null, "2026-10"), "2026-10"), null);
});

test("sin marker el enlace sigue funcionando, pero no cobramos", () => {
  const price = normalizeFlights({ success: true, data: [{ price: 95, link: "/search/x" }] }, "2026-10")!;
  assert.equal(price.affiliate, false);
  assert.ok(price.link!.startsWith("https://www.aviasales.com/"));
});

test("el mes consultado es el siguiente, también en diciembre", () => {
  assert.equal(nextMonth(new Date("2026-09-20T00:00:00Z")), "2026-10");
  assert.equal(nextMonth(new Date("2026-12-31T00:00:00Z")), "2027-01");
});

test("Madrid → Bangkok: vuelo largo, eSIM y traslado cubiertos", () => {
  const trip = resolveTrip(cat("madrid", "Madrid"), sel(BANGKOK));
  assert.equal(trip.mode, "avion");
  assert.ok(needsEsim(trip.origin.country, trip.destination.country));
  assert.equal(esimSlug(trip.destination.country), "thailand");
  assert.equal(transferSlug({ nameEn: trip.destination.nameEn }), "bangkok");
  // Tailandia es barata en destino: la comida cuesta menos que en Madrid.
  assert.ok(trip.destination.foodPerDay.value < 50);
});
