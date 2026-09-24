import { test } from "node:test";
import assert from "node:assert/strict";
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
import { chooseAirports, islandAt } from "../lib/viajes/aeropuertos";
import { CITIES, GUIDES } from "../lib/viajes/catalogo";
import { esimSlug, needsEsim, priceIndex } from "../lib/viajes/paises";
import { addDays, applyRealFlight, nightsBetween, planDetailedTrip, TripError, type TripInput } from "../lib/viajes/plan";
import { nextMonth, normalizeFlights, normalizePlaces } from "../lib/viajes/fuentes";
import { transferSlug } from "../lib/viajes/traslados";
import { DESTINATION_BY_ID } from "../lib/data/travel";

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
const cat = (id: string, name = id): PlaceSelection => ({ kind: "catalog", id, name });

const MOSCOW = place({ code: "MOW", name: "Moscú", country: "Rusia", countryCode: "RU", lat: 55.7558, lon: 37.6173, nameEn: "Moscow" });
const BANGKOK = place({ code: "BKK", name: "Bangkok", country: "Tailandia", countryCode: "TH", lat: 13.7563, lon: 100.5018, nameEn: "Bangkok" });

const trip = (over: Partial<TripInput> = {}): TripInput => ({
  origin: cat("sevilla"),
  destination: cat("roma"),
  depart: "2026-10-15",
  return: "2026-10-18",
  travelers: 2,
  ...over,
});
const plan = (over: Partial<TripInput> = {}) => planDetailedTrip(trip(over));

// ——— Catálogo ———

test("catálogo: 46 ciudades de salida y 35 destinos con qué ver", () => {
  assert.equal(CITIES.length, 46);
  assert.equal(GUIDES.length, 35);
  for (const g of GUIDES) {
    assert.ok(g.attractions.length > 0, `${g.id} sin atracciones`);
    assert.match(g.iata, /^[A-Z]{3}$/);
    assert.match(g.country, /^[A-Z]{2}$/);
  }
  // Las ciudades que René calibró a mano siguen existiendo con el mismo id.
  for (const id of ["roma", "paris", "lisboa", "londres", "amsterdam", "berlin"]) assert.ok(GUIDES.some((g) => g.id === id), id);
});

// ——— Aeropuertos ———

test("aeropuerto: desde Jerez se vuela desde Sevilla, avisando de que Jerez está más cerca", () => {
  const { recommended, nearest } = chooseAirports({ lat: 36.685, lon: -6.1261 });
  assert.equal(recommended.iata, "SVQ");
  assert.equal(nearest.iata, "XRY");
});

test("aeropuerto: en una isla siempre uno de la propia isla", () => {
  assert.equal(chooseAirports({ lat: 38.9067, lon: 1.4206, island: "ibiza" }).recommended.iata, "IBZ");
  assert.equal(islandAt(39.5696, 2.6502), "mallorca");
  assert.equal(islandAt(38.9067, 1.4206), "ibiza");
  assert.equal(islandAt(40.4168, -3.7038), undefined);
});

// ——— Países ———

test("índice de precios y eSIM", () => {
  assert.equal(priceIndex("CH"), 1.9);
  assert.equal(priceIndex("XX"), 1);
  assert.equal(needsEsim("ES", "IT"), false);
  assert.equal(needsEsim("ES", "TH"), true);
  assert.equal(esimSlug("TH"), "thailand");
  assert.equal(esimSlug("RU"), null);
});

// ——— Lugares ———

test("valida lo que llega de la API", () => {
  assert.ok(isPlace(place()));
  assert.ok(!isPlace(place({ code: "zrh" })));
  assert.ok(!isPlace({ ...place(), lat: 120 }));
});

test("el catálogo busca sin tildes y pone el país o la provincia", () => {
  assert.equal(searchDestinations("amster")[0].name, "Ámsterdam");
  assert.equal(searchOrigins("jerez")[0].detail, "Cádiz, España");
  assert.equal(searchOrigins("").length, 46);
});

test("un resultado del mundo que ya está en el catálogo no se duplica", () => {
  const rome = place({ code: "ROM", name: "Roma", country: "Italia", countryCode: "IT", lat: 41.9, lon: 12.5 });
  const options = buildOptions("destination", "roma", [rome]);
  assert.equal(options.filter((o) => o.name === "Roma").length, 1);
  assert.equal(options[0].group, "catalogo");
});

test("la elección cabe en la URL y vuelve entera", () => {
  assert.deepEqual(decodeSelection(encodeSelection(sel(place())), "destination"), sel(place()));
  assert.deepEqual(decodeSelection("c:jerez", "origin"), { kind: "catalog", id: "jerez", name: "Jerez de la Frontera" });
  assert.equal(decodeSelection("c:no-existe", "destination"), null);
});

// ——— Fechas ———

test("noches entre fechas y días sumados, sin líos de zona horaria", () => {
  assert.equal(nightsBetween("2026-10-15", "2026-10-18"), 3);
  assert.equal(nightsBetween("2026-10-25", "2026-10-26"), 1); // cambio de hora
  assert.ok(Number.isNaN(nightsBetween("mañana", "2026-10-18")));
  assert.equal(addDays("2026-12-30", 3), "2027-01-02");
});

test("fechas imposibles: vuelta antes de la ida o más de 60 noches", () => {
  assert.throws(() => plan({ return: "2026-10-15" }), TripError);
  assert.throws(() => plan({ return: "2027-01-15" }), TripError);
  assert.throws(() => plan({ destination: cat("sevilla") }), TripError); // misma ciudad
});

// ——— Motor ———

test("Sevilla → Roma: se vuela desde SVQ con las siete partidas y las cifras de René", () => {
  const { summary, plans } = plan();
  assert.equal(summary.flying, true);
  assert.equal(summary.airport?.iata, "SVQ");
  // El precio real se pide para toda Roma (Fiumicino y Ciampino), no solo para FCO.
  assert.equal(summary.destination.priceCode, "ROM");
  assert.equal(summary.destination.iata, "FCO");
  assert.equal(summary.nights, 3);
  assert.equal(summary.days, 4);
  assert.deepEqual(
    plans[0].lines.map((l) => l.key),
    ["access", "main", "transfer", "lodging", "food", "local", "activities"],
  );
  const roma = DESTINATION_BY_ID.roma;
  const flight = plans[0].lines.find((l) => l.key === "main")!;
  // Vuelo calibrado a mano por René (90 €/persona desde España) × factor de Sevilla 1,1 × 2 personas.
  assert.equal(flight.amount, Math.round(roma.transport.budget * 1.1 * 2));
  const lodging = plans[1].lines.find((l) => l.key === "lodging")!;
  assert.equal(lodging.amount, roma.lodgingPerRoomNight.value * 1 * 3);
  // Las dos partidas de «qué ver y moverte» suman lo que René puso por persona y día.
  const around = plans[2].lines.filter((l) => l.key === "local" || l.key === "activities").reduce((a, l) => a + l.amount, 0);
  assert.ok(Math.abs(around - roma.activitiesPerDay.top * 4 * 2) <= 1);
  assert.ok(plans[0].total < plans[1].total && plans[1].total < plans[2].total);
  for (const p of plans) assert.equal(p.total, p.lines.reduce((a, l) => a + l.amount, 0));
});

test("cada plan llega al aeropuerto a su manera", () => {
  const titles = plan().plans.map((p) => p.lines[0].title);
  assert.deepEqual(titles, ["Bus o tren al aeropuerto de Sevilla", "Tu coche y parking en Sevilla", "Taxi o VTC al aeropuerto de Sevilla"]);
});

test("por tierra: bus en el barato y tren en los demás; en coche si está a menos de 100 km", () => {
  const land = plan({ destination: cat("madrid") });
  assert.equal(land.summary.flying, false);
  assert.deepEqual(land.plans.map((p) => p.mode), ["bus", "tren", "tren"]);
  assert.ok(!land.plans[0].lines.some((l) => l.key === "access" || l.key === "transfer"));
  const near = plan({ origin: cat("jerez"), destination: cat("cadiz") });
  assert.deepEqual(near.plans.map((p) => p.mode), ["coche", "coche", "coche"]);
});

test("cruzar el mar obliga a volar, también entre islas", () => {
  assert.equal(plan({ destination: cat("mallorca") }).summary.flying, true);
  assert.equal(plan({ origin: cat("ibiza"), destination: cat("mallorca") }).summary.flying, true);
});

test("una persona sola en el plan barato duerme en hostal", () => {
  const solo = plan({ travelers: 1 }).plans[0].lines.find((l) => l.key === "lodging")!;
  assert.equal(solo.title, "Cama en hostal");
});

test("Zúrich → Moscú: se vuela desde su propia ciudad y el destino se estima con la media del país", () => {
  const { summary, plans } = plan({ origin: sel(place()), destination: sel(MOSCOW) });
  assert.equal(summary.airport?.iata, "ZRH");
  assert.equal(summary.airportEstimated, true);
  assert.equal(summary.countryAverage, true);
  assert.equal(summary.destination.guide, null);
  // Llegar al aeropuerto en Suiza cuesta más que en España (índice 1,9).
  const fromSpain = plan({ origin: cat("madrid"), destination: sel(MOSCOW) }).plans[0].lines[0].amount;
  assert.ok(plans[0].lines[0].amount > fromSpain);
});

test("desde fuera de España las cifras de vuelo de René no valen: se estiman por distancia", () => {
  // Zúrich → Roma está a menos de 700 km dentro de Europa: se va en tren, no en avión.
  assert.equal(plan({ origin: sel(place()) }).summary.flying, false);
  const fromZurich = plan({ origin: sel(place()), destination: cat("lisboa") }).plans[0].lines.find((l) => l.key === "main")!;
  assert.notEqual(fromZurich.amount, Math.round(DESTINATION_BY_ID.lisboa.transport.budget * 2));
  assert.match(fromZurich.detail, /^ZRH → LIS/);
});

test("una ciudad del buscador que es del catálogo usa su guía", () => {
  const rome = place({ code: "ROM", name: "Roma", country: "Italia", countryCode: "IT", lat: 41.9028, lon: 12.4964 });
  assert.equal(plan({ destination: sel(rome) }).summary.destination.guide?.id, "roma");
  const jerez = place({ code: "XRY", name: "Jerez", country: "España", countryCode: "ES", lat: 36.69, lon: -6.13 });
  assert.equal(plan({ origin: sel(jerez) }).summary.airport?.iata, "SVQ");
});

test("precio real de vuelo: el barato es ese billete y los demás nunca por debajo con su recargo", () => {
  const base = plan();
  const real = applyRealFlight(base, { perPerson: 200, exactDates: true, airline: "FR", stops: 0, link: null, affiliate: false });
  const main = (i: number) => real.plans[i].lines.find((l) => l.key === "main")!;
  assert.equal(main(0).amount, 400);
  assert.equal(main(0).source, "real");
  assert.match(main(0).detail, /para tus fechas · directo/);
  assert.ok(main(1).amount >= 200 * 1.25 * 2);
  assert.ok(main(2).amount >= 200 * 1.8 * 2);
  assert.equal(real.plans[0].total, real.plans[0].lines.reduce((a, l) => a + l.amount, 0));
  // Por tierra no se toca nada.
  const land = plan({ destination: cat("madrid") });
  assert.equal(applyRealFlight(land, { perPerson: 50, exactDates: true, airline: null, stops: 0, link: null, affiliate: false }), land);
});

test("Madrid → Bangkok: eSIM y traslado cubiertos", () => {
  const { summary } = plan({ origin: cat("madrid"), destination: sel(BANGKOK) });
  assert.ok(needsEsim(summary.origin.country, summary.destination.country));
  assert.equal(summary.destination.transferSlug, "bangkok");
});

test("traslados: por id de catálogo, por nombre en inglés, o ninguno", () => {
  assert.equal(transferSlug({ catalogId: "sevilla" }), "seville");
  assert.equal(transferSlug({ nameEn: "Moscow" }), null);
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

test("precio de vuelo: se queda el más barato y añade el marker al enlace", () => {
  const json = {
    success: true,
    data: [
      { price: 180, airline: "IB", transfers: 1, link: "/search/SVQ1510ROM1810?x=1" },
      { price: 95, airline: "FR", transfers: 0, return_transfers: 0, link: "/search/SVQ1510ROM1810?x=2" },
    ],
  };
  const price = normalizeFlights(json, true, "12345")!;
  assert.equal(price.perPerson, 95);
  assert.equal(price.exactDates, true);
  assert.equal(new URL(price.link!).searchParams.get("marker"), "12345");
  assert.equal(price.affiliate, true);
  assert.equal(normalizeFlights({ success: true, data: [] }, true), null);
  assert.equal(normalizeFlights(null, false), null);
  assert.equal(normalizeFlights({ success: true, data: [{ price: 95, link: "/x" }] }, false)!.affiliate, false);
});

test("sin fechas, el mes siguiente, también en diciembre", () => {
  assert.equal(nextMonth(new Date("2026-12-31T00:00:00Z")), "2027-01");
});
