import type { PlanTier } from "./types";

export type Tiered = Record<PlanTier, number>;

export interface OriginRef {
  id: string;
  name: string;
  /** Llegar al aeropuerto o estación, ida y vuelta, por persona */
  airportTransfer: Tiered;
  /** Multiplicador del precio del transporte desde este origen */
  transportFactor: number;
  lat: number;
  lon: number;
  /** ISO 3166-1 alfa-2 */
  country: string;
  /** Código IATA de la ciudad, para buscar precios de vuelo reales */
  iata?: string;
}

export interface DestinationRef {
  id: string;
  name: string;
  /** Vuelo o tren ida y vuelta por persona, desde el origen de referencia */
  transport: Tiered;
  /** Alojamiento por habitación doble y noche */
  lodgingPerRoomNight: Tiered;
  /** Comida por persona y día */
  foodPerDay: Tiered;
  /** Visitas y transporte local por persona y día */
  activitiesPerDay: Tiered;
  highlights: Record<PlanTier, string[]>;
  lat: number;
  lon: number;
  /** ISO 3166-1 alfa-2 */
  country: string;
  iata?: string;
  /** Nombre en inglés, para partners que usan slugs en inglés (traslados) */
  nameEn?: string;
  /** false cuando las cifras son una estimación por país, no datos revisados a mano */
  curated?: boolean;
}

export interface TripInput {
  nights: number;
  travelers: number;
}

export type TripLineId = "airport" | "transport" | "lodging" | "food" | "activities";

export interface TripLine {
  id: TripLineId;
  perPerson: number;
}

export interface TripPlan {
  tier: PlanTier;
  lines: TripLine[];
  perPerson: number;
  total: number;
  highlights: string[];
}

export const TRIP_TIERS: PlanTier[] = ["budget", "value", "top"];

export function planTrip(origin: OriginRef, dest: DestinationRef, input: TripInput): TripPlan[] {
  const nights = Math.max(1, Math.round(input.nights));
  const travelers = Math.max(1, Math.round(input.travelers));
  const days = nights + 1;
  const rooms = Math.ceil(travelers / 2);

  return TRIP_TIERS.map((tier) => {
    const raw: Array<[TripLineId, number]> = [
      ["airport", origin.airportTransfer[tier]],
      ["transport", dest.transport[tier] * origin.transportFactor],
      ["lodging", (dest.lodgingPerRoomNight[tier] * nights * rooms) / travelers],
      ["food", dest.foodPerDay[tier] * days],
      ["activities", dest.activitiesPerDay[tier] * days],
    ];
    const lines = raw.map(([id, v]) => ({ id, perPerson: Math.round(v) }));
    const perPerson = lines.reduce((a, l) => a + l.perPerson, 0);
    return { tier, lines, perPerson, total: perPerson * travelers, highlights: dest.highlights[tier] };
  });
}
