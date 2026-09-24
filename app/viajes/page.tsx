import type { Metadata } from "next";
import { TRIP_EXAMPLE } from "@/lib/data/examples";
import { CITY_BY_ID, GUIDE_BY_ID } from "@/lib/viajes/catalogo";
import { decodeSelection, type PlaceSelection } from "@/lib/viajes/lugares";
import { addDays, nightsBetween } from "@/lib/viajes/plan";
import { TravelPlanner, type TripQuery } from "@/components/tools/TravelPlanner";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Planificador de viajes: cuánto cuesta y si te da",
  description:
    "Calcula cuánto cuesta un viaje por persona en 3 planes, puerta a puerta: aeropuerto, vuelo o tren, alojamiento, comida y qué ver. Desde y hacia cualquier ciudad del mundo. Gratis y sin registro.",
  alternates: { canonical: "/viajes" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const int = (v: string | undefined, fallback: number, min: number, max: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

/** Hoy en Madrid, en YYYY-MM-DD: es la zona horaria de casi todo el público. */
const todayInSpain = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());

const origin = (id: string): PlaceSelection => ({ kind: "catalog", id, name: CITY_BY_ID[id].name });
const destination = (id: string): PlaceSelection => ({ kind: "catalog", id, name: GUIDE_BY_ID[id].name });

export default async function TravelPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const today = todayInSpain();

  // Fechas de la URL si son válidas; si no, dentro de un mes con las noches pedidas (o las del ejemplo).
  let depart = one(sp.ida) ?? "";
  let ret = one(sp.vuelta) ?? "";
  const nights = nightsBetween(depart, ret);
  if (!(depart >= today) || !(nights >= 1 && nights <= 60)) {
    depart = addDays(today, 30);
    ret = addDays(depart, int(one(sp.n), TRIP_EXAMPLE.nights, 1, 60));
  }

  const initial: TripQuery = {
    origin: decodeSelection(one(sp.o), "origin") ?? origin(TRIP_EXAMPLE.origin),
    destination: decodeSelection(one(sp.d), "destination") ?? destination(TRIP_EXAMPLE.destination),
    depart,
    return: ret,
    travelers: int(one(sp.p), TRIP_EXAMPLE.travelers, 1, 12),
  };

  return (
    <>
      <PageHeader
        eyebrow="Viajes"
        title="¿Te da para ese viaje?"
        intro="Elige origen y destino (cualquier ciudad del mundo), fechas y personas. Te damos tres planes puerta a puerta, te decimos si te da y te llevamos a reservarlo paso a paso."
      />
      <Container className="pb-24">
        <TravelPlanner initial={initial} today={today} />
      </Container>
    </>
  );
}
