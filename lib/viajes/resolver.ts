import { DESTINATION_BY_ID, ORIGIN_BY_ID, DESTINATIONS, ORIGINS } from "@/lib/data/travel";
import type { DestinationRef, OriginRef, PlanTier, Tiered } from "@/lib/engine";
import { catalogDestination, catalogOrigin, distanceKm, type Place, type PlaceSelection } from "./lugares";
import { CONTINENTAL_EUROPE, priceIndex } from "./paises";
import { transferSlug } from "./traslados";

/**
 * Convierte lo que elige la persona (ciudad del catálogo o del buscador
 * mundial) en las referencias que consume el motor. Puro: ni red ni React.
 *
 * Las ciudades del catálogo llevan cifras revisadas a mano. Para el resto se
 * estima: el transporte por distancia y el gasto en destino por el índice de
 * precios del país (Madrid = 1). Siempre se avisa en la interfaz.
 */

const ASSUMPTIONS = {
  /** Distancia por carretera ≈ línea recta × 1,25 */
  roadFactor: 1.25,
  /** Por encima de esto, o cruzando mar, se vuela */
  maxLandKm: 700,
  /** Salida fuera del catálogo: distancia supuesta de casa al aeropuerto */
  airportKm: 25,
  /** Vuelo ida por persona: base + €/km */
  flight: { budget: { base: 25, perKm: 0.035 }, value: { base: 45, perKm: 0.05 }, top: { base: 90, perKm: 0.09 } },
  /** Trayecto por tierra ida por persona: mínimo y €/km */
  land: { budget: { min: 8, perKm: 0.06 }, value: { min: 15, perKm: 0.1 }, top: { min: 30, perKm: 0.2 } },
  /** Llegar al aeropuerto, ida y vuelta por persona, con índice de precios 1 */
  airportTransfer: { budget: 8, value: 10, top: 55 },
  /** Alojamiento por habitación doble y noche, índice 1 */
  lodging: { budget: 70, value: 125, top: 290 },
  /** Comida por persona y día, índice 1 */
  food: { budget: 28, value: 50, top: 110 },
  /** Visitas y transporte local por persona y día, índice 1 */
  activities: { budget: 13, value: 35, top: 70 },
} as const;

const TIERS: PlanTier[] = ["budget", "value", "top"];
const tiered = (fn: (tier: PlanTier) => number): Tiered =>
  Object.fromEntries(TIERS.map((t) => [t, Math.round(fn(t))])) as Tiered;

/** Archipiélagos españoles: viajar entre ellos y la península obliga a volar. */
const ISLANDS: Array<{ id: string; latMin: number; latMax: number; lonMin: number; lonMax: number }> = [
  { id: "baleares", latMin: 38.6, latMax: 40.1, lonMin: 1.1, lonMax: 4.4 },
  { id: "canarias", latMin: 27.5, latMax: 29.5, lonMin: -18.3, lonMax: -13.3 },
];

export const islandOf = (lat: number, lon: number): string | null =>
  ISLANDS.find((i) => lat >= i.latMin && lat <= i.latMax && lon >= i.lonMin && lon <= i.lonMax)?.id ?? null;

export type TripMode = "avion" | "tierra";

export interface ResolvedTrip {
  origin: OriginRef;
  destination: DestinationRef;
  km: number;
  mode: TripMode;
  /** true cuando las cifras del destino son una estimación por país */
  estimated: boolean;
}

export class TripError extends Error {}

export function resolveOrigin(selection: PlaceSelection): OriginRef {
  if (selection.kind === "catalog") {
    const origin = ORIGIN_BY_ID[selection.id];
    if (!origin) throw new TripError("Elige tu ciudad de salida de la lista.");
    return origin;
  }
  const place = selection.place;
  const known = catalogOrigin(place);
  if (known) return known;

  const index = priceIndex(place.countryCode);
  return {
    id: `lugar-${place.code.toLowerCase()}`,
    name: place.name,
    airportTransfer: tiered((t) => ASSUMPTIONS.airportTransfer[t] * index),
    transportFactor: 1,
    lat: place.lat,
    lon: place.lon,
    country: place.countryCode,
    iata: place.code,
  };
}

export function resolveDestination(selection: PlaceSelection): DestinationRef {
  if (selection.kind === "catalog") {
    const destination = DESTINATION_BY_ID[selection.id];
    if (!destination) throw new TripError("Elige el destino de la lista.");
    return destination;
  }
  const place = selection.place;
  const known = catalogDestination(place);
  if (known) return known;
  return estimatedDestination(place);
}

/** Destino fuera del catálogo: gasto en destino por el índice de precios del país. */
function estimatedDestination(place: Place): DestinationRef {
  const index = priceIndex(place.countryCode);
  return {
    id: `lugar-${place.code.toLowerCase()}`,
    name: place.name,
    nameEn: place.nameEn,
    // Se recalcula en resolveTrip, cuando ya se sabe desde dónde se sale.
    transport: { budget: 0, value: 0, top: 0 },
    lodgingPerRoomNight: tiered((t) => ASSUMPTIONS.lodging[t] * index),
    foodPerDay: tiered((t) => ASSUMPTIONS.food[t] * index),
    activitiesPerDay: tiered((t) => ASSUMPTIONS.activities[t] * index),
    highlights: { budget: [], value: [], top: [] },
    lat: place.lat,
    lon: place.lon,
    country: place.countryCode,
    iata: place.code,
    curated: false,
  };
}

/** Avión o tierra: cruzando mar, entre países no conectados o a más de 700 km, se vuela. */
export function tripMode(origin: OriginRef, destination: DestinationRef, km: number): TripMode {
  const fromIsland = islandOf(origin.lat, origin.lon);
  const toIsland = islandOf(destination.lat, destination.lon);
  if (fromIsland !== toIsland) return "avion";
  const sameCountry = origin.country === destination.country;
  const bothContinental = CONTINENTAL_EUROPE.has(origin.country) && CONTINENTAL_EUROPE.has(destination.country);
  if (!sameCountry && !bothContinental) return "avion";
  return km > ASSUMPTIONS.maxLandKm ? "avion" : "tierra";
}

/** Transporte ida y vuelta por persona, estimado por distancia. */
export function estimateTransport(km: number, mode: TripMode): Tiered {
  if (mode === "avion") {
    return tiered((t) => (ASSUMPTIONS.flight[t].base + km * ASSUMPTIONS.flight[t].perKm) * 2);
  }
  const road = km * ASSUMPTIONS.roadFactor;
  return tiered((t) => Math.max(ASSUMPTIONS.land[t].min, road * ASSUMPTIONS.land[t].perKm) * 2);
}

/**
 * Resuelve el viaje completo. Las cifras de transporte revisadas a mano solo
 * valen desde España: para cualquier otro origen se estiman por distancia.
 */
export function resolveTrip(originSel: PlaceSelection, destinationSel: PlaceSelection): ResolvedTrip {
  const origin = resolveOrigin(originSel);
  const destination = resolveDestination(destinationSel);
  const km = distanceKm(origin.lat, origin.lon, destination.lat, destination.lon);
  if (km < 10) throw new TripError("El origen y el destino son la misma ciudad.");

  const mode = tripMode(origin, destination, km);
  const curatedRoute = destination.curated === true && origin.country === "ES" && ORIGIN_BY_ID[origin.id] !== undefined;
  const resolved: DestinationRef = curatedRoute
    ? destination
    : { ...destination, transport: estimateTransport(km, mode) };

  return { origin, destination: resolved, km: Math.round(km), mode, estimated: !curatedRoute };
}

/** Slug de traslados (Welcome Pickups) del destino, si lo cubren. */
export const destinationTransferSlug = (destination: DestinationRef): string | null =>
  transferSlug({ catalogId: DESTINATIONS.some((d) => d.id === destination.id) ? destination.id : null, nameEn: destination.nameEn });

/** Ciudades del catálogo, para las sugerencias iniciales del buscador. */
export const CATALOG = { origins: ORIGINS, destinations: DESTINATIONS };
