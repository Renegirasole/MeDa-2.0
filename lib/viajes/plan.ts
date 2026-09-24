import type { DestinationRef, PlanTier } from "@/lib/engine";
import { DESTINATION_BY_ID, ORIGIN_BY_ID } from "@/lib/data/travel";
import { chooseAirports, distanceKm, islandAt, type Airport, type Island } from "./aeropuertos";
import { CITY_BY_ID, GUIDE_BY_ID, type Guide } from "./catalogo";
import { catalogDestination, catalogOrigin, isPlace, type PlaceSelection } from "./lugares";
import { CONTINENTAL_EUROPE, priceIndex } from "./paises";
import { transferSlug } from "./traslados";
import type { FlightPrice } from "./fuentes";
import { formatNumber } from "@/lib/format";

/**
 * Planificador de viajes puerta a puerta. Puro: ni red ni React.
 *
 * Para cada plan (barato, calidad-precio, top) decide cómo se va (avión, tren,
 * bus o coche), desde qué aeropuerto conviene volar y cuánto cuesta cada
 * partida, con el mismo modelo del planificador original de MeDa. Donde René
 * calibró un destino a mano (lib/data/travel.ts), mandan sus cifras.
 */

export type TripMode = "avion" | "tren" | "bus" | "coche";
export type LineKey = "access" | "main" | "transfer" | "lodging" | "food" | "local" | "activities";

export interface TripLine {
  key: LineKey;
  title: string;
  detail: string;
  /** Para todo el grupo, en euros */
  amount: number;
  /** "real" cuando sale de precios de vuelo vistos estos días */
  source: "estimado" | "real";
}

export interface TripPlan {
  tier: PlanTier;
  description: string;
  mode: TripMode;
  lines: TripLine[];
  total: number;
  perPerson: number;
}

export interface TripOrigin {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** ISO 3166-1 alfa-2 */
  country: string;
  island?: Island;
  /** Solo fuera de España: se vuela desde los aeropuertos de la propia ciudad */
  iata?: string;
}

export interface TripDestination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  /** Aeropuerto principal, para los enlaces de vuelos */
  iata: string;
  /** Código con el que se pide el precio real: el de ciudad si tiene varios aeropuertos */
  priceCode: string;
  /** Coste turístico respecto a Madrid = 1 */
  index: number;
  island?: Island;
  /** Guía propia: «qué ver» y slug de Civitatis */
  guide: Guide | null;
  /** Cifras calibradas a mano por René, si las hay */
  manual: DestinationRef | null;
  nameEn?: string;
  /** Ciudad de Welcome Pickups, si cubren el destino */
  transferSlug: string | null;
}

export interface TripSummary {
  origin: TripOrigin;
  destination: TripDestination;
  depart: string;
  return: string;
  nights: number;
  days: number;
  travelers: number;
  /** En línea recta, redondeado */
  km: number;
  flying: boolean;
  /** Aeropuerto de salida recomendado, si se vuela */
  airport: Airport | null;
  /** El más cercano, si es otro (suele tener menos rutas) */
  alternativeAirport: Airport | null;
  kmToAirport: number;
  /** Salida fuera de España: la distancia hasta su aeropuerto es un supuesto */
  airportEstimated: boolean;
  /** Las cifras del destino son una media del país, no de la ciudad */
  countryAverage: boolean;
}

export interface TripPlanning {
  summary: TripSummary;
  plans: TripPlan[];
}

export interface TripInput {
  origin: PlaceSelection;
  destination: PlaceSelection;
  /** YYYY-MM-DD */
  depart: string;
  /** YYYY-MM-DD */
  return: string;
  travelers: number;
}

export class TripError extends Error {}

export const TIERS: PlanTier[] = ["budget", "value", "top"];

export const ASSUMPTIONS = {
  /** Distancia por carretera ≈ línea recta × 1,25 */
  roadFactor: 1.25,
  maxLandKm: 700,
  carOnlyKm: 100,
  minTripKm: 10,
  maxNights: 60,
  maxTravelers: 12,
  /** Salida fuera de España: distancia supuesta de casa al aeropuerto */
  worldAirportKm: 25,
  /** Vuelo ida por persona: base + €/km, desde el aeropuerto de salida */
  flight: { budget: { base: 25, perKm: 0.035 }, value: { base: 45, perKm: 0.05 }, top: { base: 90, perKm: 0.09 } },
  /** Tierra, ida por persona: mínimo y €/km por carretera */
  land: { budget: { min: 8, perKm: 0.06 }, value: { min: 15, perKm: 0.1 }, top: { min: 30, perKm: 0.2 } },
  /** Combustible y desgaste, por vehículo y km */
  carPerKm: 0.12,
  airportParkingPerDay: 11,
  /** Llegar al aeropuerto, ida: barato en bus o tren (por persona), top en taxi (por vehículo) */
  access: { budget: { min: 3, perKm: 0.09 }, top: { min: 25, perKm: 1.2 } },
  /** Del aeropuerto al centro, ida, con índice 1 */
  transfer: { budget: 8, value: 15, topPerVehicle: 60 },
  /** Por habitación doble y noche, índice 1 */
  lodging: { budget: 70, value: 125, top: 290, hostelBed: 38 },
  /** Por persona y día, índice 1 */
  food: { budget: 28, value: 50, top: 110 },
  local: { budget: 5, value: 10, top: 35 },
  activities: { budget: 8, value: 25, top: 75 },
  /** Recargo de cada plan sobre el vuelo real más barato (maleta, flexibilidad) */
  realFlightMarkup: { budget: 1, value: 1.25, top: 1.8 },
} as const;

const DESCRIPTION: Record<PlanTier, string> = {
  budget: "Low-cost sin maleta, alojamiento sencillo y transporte público.",
  value: "Maleta incluida, hotel 3★ bien situado y alguna visita guiada.",
  top: "Vuelos flexibles, hotel 5★, taxis y las mejores experiencias.",
};

const euros = (n: number) => Math.round(n);
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Noches entre dos fechas YYYY-MM-DD. NaN si alguna no es válida. */
export function nightsBetween(depart: string, ret: string): number {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso.test(depart) || !iso.test(ret)) return NaN;
  const ms = Date.parse(`${ret}T12:00:00Z`) - Date.parse(`${depart}T12:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** Fecha YYYY-MM-DD a N días de otra (en UTC, para que no dependa de la zona horaria). */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function resolveOrigin(selection: PlaceSelection): TripOrigin {
  if (selection.kind === "catalog") {
    const c = CITY_BY_ID[selection.id];
    if (!c) throw new TripError("Elige tu ciudad de salida de la lista.");
    return { id: c.id, name: c.name, lat: c.lat, lon: c.lon, country: "ES", island: c.island };
  }
  const p = selection.place;
  if (!isPlace(p)) throw new TripError("Elige tu ciudad de salida de la lista.");
  const known = catalogOrigin(p);
  if (known) return resolveOrigin({ kind: "catalog", id: known.id, name: known.name });
  const base = { id: `lugar-${p.code.toLowerCase()}`, name: p.name, lat: p.lat, lon: p.lon, country: p.countryCode };
  // En España se busca el mejor aeropuerto cercano; fuera, se vuela desde los de la ciudad.
  if (p.countryCode === "ES") return { ...base, island: islandAt(p.lat, p.lon) };
  return { ...base, iata: p.code };
}

export function resolveDestination(selection: PlaceSelection): TripDestination {
  if (selection.kind === "catalog") {
    const g = GUIDE_BY_ID[selection.id];
    if (!g) throw new TripError("Elige el destino de la lista.");
    return fromGuide(g);
  }
  const p = selection.place;
  if (!isPlace(p)) throw new TripError("Elige el destino de la lista.");
  const known = catalogDestination(p);
  if (known) return fromGuide(known);
  return {
    id: `lugar-${p.code.toLowerCase()}`,
    name: p.name,
    country: p.countryCode,
    lat: p.lat,
    lon: p.lon,
    iata: p.code,
    priceCode: p.code,
    index: priceIndex(p.countryCode),
    island: p.countryCode === "ES" ? islandAt(p.lat, p.lon) : undefined,
    guide: null,
    manual: null,
    nameEn: p.nameEn,
    transferSlug: transferSlug({ nameEn: p.nameEn }),
  };
}

function fromGuide(g: Guide): TripDestination {
  return {
    id: g.id,
    name: g.name,
    country: g.country,
    lat: g.lat,
    lon: g.lon,
    iata: g.iata,
    priceCode: g.cityCode ?? g.iata,
    index: g.priceIndex,
    island: g.island,
    guide: g,
    manual: DESTINATION_BY_ID[g.id] ?? null,
    nameEn: DESTINATION_BY_ID[g.id]?.nameEn,
    transferSlug: transferSlug({ catalogId: g.id }),
  };
}

/** Avión si se cruza el mar, entre países sin conexión por tierra o a más de 700 km. */
export function decideTransport(origin: TripOrigin, destination: TripDestination, km: number): { flying: boolean; carOnly: boolean } {
  const crossesSea = Boolean(origin.island || destination.island) && origin.island !== destination.island;
  const landLinked =
    origin.country === destination.country || (CONTINENTAL_EUROPE.has(origin.country) && CONTINENTAL_EUROPE.has(destination.country));
  const flying = crossesSea || !landLinked || km > ASSUMPTIONS.maxLandKm;
  const carOnly = !flying && km * ASSUMPTIONS.roadFactor < ASSUMPTIONS.carOnlyKm;
  return { flying, carOnly };
}

/** Parte de «qué ver y moverte» que es transporte local, para separar las dos partidas. */
const LOCAL_SHARE: Record<PlanTier, number> = {
  budget: ASSUMPTIONS.local.budget / (ASSUMPTIONS.local.budget + ASSUMPTIONS.activities.budget),
  value: ASSUMPTIONS.local.value / (ASSUMPTIONS.local.value + ASSUMPTIONS.activities.value),
  top: ASSUMPTIONS.local.top / (ASSUMPTIONS.local.top + ASSUMPTIONS.activities.top),
};

export function planDetailedTrip(input: TripInput): TripPlanning {
  const origin = resolveOrigin(input.origin);
  const destination = resolveDestination(input.destination);

  const nights = nightsBetween(input.depart, input.return);
  if (!Number.isFinite(nights) || nights < 1) throw new TripError("La vuelta tiene que ser al menos un día después de la ida.");
  if (nights > ASSUMPTIONS.maxNights) throw new TripError("De momento planificamos viajes de hasta 60 noches.");

  const travelers = Math.max(1, Math.min(ASSUMPTIONS.maxTravelers, Math.round(input.travelers)));
  const days = nights + 1;
  const rooms = Math.ceil(travelers / 2);
  const vehicles = Math.ceil(travelers / 4);

  const km = distanceKm(origin.lat, origin.lon, destination.lat, destination.lon);
  if (km < ASSUMPTIONS.minTripKm) throw new TripError("El origen y el destino son la misma ciudad.");

  const { flying, carOnly } = decideTransport(origin, destination, km);
  const airports = origin.iata
    ? (() => {
        const own: Airport = { iata: origin.iata, name: `Aeropuerto de ${origin.name}`, city: origin.name, lat: origin.lat, lon: origin.lon, size: 3 };
        return { recommended: own, nearest: own, km: ASSUMPTIONS.worldAirportKm };
      })()
    : chooseAirports(origin);

  const originIndex = priceIndex(origin.country);
  const d = destination.index;
  const manual = destination.manual;
  const flightKm = distanceKm(airports.recommended.lat, airports.recommended.lon, destination.lat, destination.lon);
  const roadKm = km * ASSUMPTIONS.roadFactor;
  const airportRoadKm = airports.km * ASSUMPTIONS.roadFactor;
  // Las cifras de vuelo de René están pensadas desde España.
  const manualFlight = manual && origin.country === "ES" ? (ORIGIN_BY_ID[origin.id]?.transportFactor ?? 1) : null;

  const plans = TIERS.map((tier): TripPlan => {
    const lines: TripLine[] = [];
    const push = (l: Omit<TripLine, "source">) => lines.push({ ...l, amount: euros(l.amount), source: "estimado" });
    let mode: TripMode;

    if (flying) {
      mode = "avion";
      const a = airports.recommended;
      const kmText = `≈${formatNumber(airportRoadKm)} km`;
      if (tier === "budget") {
        const c = ASSUMPTIONS.access.budget;
        push({
          key: "access",
          title: `Bus o tren al aeropuerto de ${a.city}`,
          detail: `${kmText} · ida y vuelta`,
          amount: Math.max(c.min, airportRoadKm * c.perKm) * 2 * travelers * originIndex,
        });
      } else if (tier === "value") {
        push({
          key: "access",
          title: `Tu coche y parking en ${a.name}`,
          detail: `${kmText} · ${plural(days, "día", "días")} de parking`,
          amount: (airportRoadKm * 2 * ASSUMPTIONS.carPerKm + ASSUMPTIONS.airportParkingPerDay * days) * vehicles * originIndex,
        });
      } else {
        const c = ASSUMPTIONS.access.top;
        push({
          key: "access",
          title: `Taxi o VTC al aeropuerto de ${a.city}`,
          detail: `${kmText} · ida y vuelta`,
          amount: Math.max(c.min, airportRoadKm * c.perKm) * 2 * vehicles * originIndex,
        });
      }

      const f = ASSUMPTIONS.flight[tier];
      const perPerson = manual && manualFlight !== null ? manual.transport[tier] * manualFlight : (f.base + flightKm * f.perKm) * 2;
      push({
        key: "main",
        title: { budget: "Vuelo low-cost sin maleta facturada", value: "Vuelo con maleta facturada", top: "Vuelo flexible con maleta y asiento elegido" }[tier],
        detail: `${a.iata} → ${destination.iata} · ≈${formatNumber(flightKm)} km · ida y vuelta`,
        amount: perPerson * travelers,
      });

      const t = ASSUMPTIONS.transfer;
      push({
        key: "transfer",
        title: { budget: "Bus o metro del aeropuerto al centro", value: "Tren exprés o lanzadera al centro", top: "Taxi del aeropuerto al hotel" }[tier],
        detail: "ida y vuelta",
        amount: (tier === "top" ? t.topPerVehicle * vehicles : t[tier] * travelers) * 2 * d,
      });
    } else if (carOnly) {
      mode = "coche";
      push({
        key: "main",
        title: "En coche",
        detail: `≈${formatNumber(roadKm)} km · ida y vuelta`,
        amount: roadKm * 2 * ASSUMPTIONS.carPerKm * vehicles,
      });
    } else {
      mode = tier === "budget" ? "bus" : "tren";
      const c = ASSUMPTIONS.land[tier];
      push({
        key: "main",
        title: { budget: "Autobús o coche compartido", value: "Tren", top: "Tren en clase superior" }[tier],
        detail: `${origin.name} → ${destination.name} · ≈${formatNumber(roadKm)} km · ida y vuelta`,
        amount: Math.max(c.min, roadKm * c.perKm) * 2 * travelers * originIndex,
      });
    }

    // Alojamiento
    const L = ASSUMPTIONS.lodging;
    const hostel = tier === "budget" && travelers === 1;
    const perNight = manual
      ? hostel
        ? manual.lodgingPerRoomNight.budget * (L.hostelBed / L.budget)
        : manual.lodgingPerRoomNight[tier] * rooms
      : hostel
        ? L.hostelBed * d
        : L[tier] * rooms * d;
    push({
      key: "lodging",
      title: { budget: hostel ? "Cama en hostal" : "Hostal u hotel 1-2★", value: "Hotel 3★ bien ubicado", top: "Hotel 5★ o boutique" }[tier],
      detail: `${plural(nights, "noche", "noches")}${travelers > 1 ? ` · ${plural(rooms, "habitación", "habitaciones")}` : ""}`,
      amount: perNight * nights,
    });

    // En destino
    const people = plural(travelers, "persona", "personas");
    push({
      key: "food",
      title: { budget: "Supermercado y comida callejera", value: "Restaurantes locales", top: "Restaurantes recomendados" }[tier],
      detail: `${plural(days, "día", "días")} · ${people}`,
      amount: (manual ? manual.foodPerDay[tier] : ASSUMPTIONS.food[tier] * d) * days * travelers,
    });
    const around = manual ? manual.activitiesPerDay[tier] : (ASSUMPTIONS.local[tier] + ASSUMPTIONS.activities[tier]) * d;
    push({
      key: "local",
      title: { budget: "Andando y transporte público", value: "Abono de transporte", top: "Taxis y traslados privados" }[tier],
      detail: plural(days, "día", "días"),
      amount: around * LOCAL_SHARE[tier] * days * travelers,
    });
    push({
      key: "activities",
      title: { budget: "Free tours y lo imprescindible", value: "Entradas principales y alguna visita guiada", top: "Tours privados y experiencias" }[tier],
      detail: plural(days, "día", "días"),
      amount: around * (1 - LOCAL_SHARE[tier]) * days * travelers,
    });

    const total = lines.reduce((a, l) => a + l.amount, 0);
    return { tier, description: DESCRIPTION[tier], mode, lines, total, perPerson: euros(total / travelers) };
  });

  return {
    summary: {
      origin,
      destination,
      depart: input.depart,
      return: input.return,
      nights,
      days,
      travelers,
      km: Math.round(km),
      flying,
      airport: flying ? airports.recommended : null,
      alternativeAirport: flying && airports.nearest.iata !== airports.recommended.iata ? airports.nearest : null,
      kmToAirport: Math.round(airportRoadKm),
      airportEstimated: Boolean(origin.iata),
      countryAverage: destination.guide === null,
    },
    plans,
  };
}

/**
 * Sustituye la estimación del vuelo por el precio real visto estos días. En el
 * plan barato es justo ese billete; en los demás, nunca por debajo del real con
 * el recargo típico de cada nivel (maleta, flexibilidad). No toca el original.
 */
export function applyRealFlight(planning: TripPlanning, flight: FlightPrice): TripPlanning {
  if (!planning.summary.flying || !(flight.perPerson > 0)) return planning;
  const { travelers, destination, airport } = planning.summary;
  const when = flight.exactDates ? "para tus fechas" : "en el mes de tu viaje";
  const stops = flight.stops > 0 ? ` · ${plural(flight.stops, "escala", "escalas")}` : " · directo";

  const plans = planning.plans.map((plan) => {
    const lines = plan.lines.map((line): TripLine => {
      if (line.key !== "main") return line;
      const real = euros(flight.perPerson * ASSUMPTIONS.realFlightMarkup[plan.tier] * travelers);
      const amount = plan.tier === "budget" ? real : Math.max(line.amount, real);
      const detail =
        plan.tier === "budget"
          ? `Desde ${flight.perPerson} €/persona ida y vuelta ${when}${stops}`
          : `${airport?.iata ?? ""} → ${destination.name} · el más barato, desde ${flight.perPerson} €/persona`;
      return { ...line, amount, detail, source: plan.tier === "budget" || amount === real ? "real" : line.source };
    });
    const total = lines.reduce((a, l) => a + l.amount, 0);
    return { ...plan, lines, total, perPerson: euros(total / travelers) };
  });
  return { ...planning, plans };
}
