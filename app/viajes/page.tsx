import type { Metadata } from "next";
import { DESTINATION_BY_ID, ORIGIN_BY_ID } from "@/lib/data/travel";
import { TRIP_EXAMPLE } from "@/lib/data/examples";
import { decodeSelection, type PlaceSelection } from "@/lib/viajes/lugares";
import { TravelPlanner, type TripQuery } from "@/components/tools/TravelPlanner";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Planificador de viajes: cuánto cuesta y si te da",
  description:
    "Calcula cuánto cuesta un viaje por persona en 3 planes: vuelo, alojamiento, comida y qué ver. Desde y hacia cualquier ciudad del mundo. Gratis y sin registro.",
  alternates: { canonical: "/viajes" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const int = (v: string | undefined, fallback: number, min: number, max: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

const catalog = (id: string, kind: "origin" | "destination"): PlaceSelection => ({
  kind: "catalog",
  id,
  name: (kind === "origin" ? ORIGIN_BY_ID[id] : DESTINATION_BY_ID[id]).name,
});

export default async function TravelPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const initial: TripQuery = {
    origin: decodeSelection(one(sp.o), "origin") ?? catalog(TRIP_EXAMPLE.origin, "origin"),
    destination: decodeSelection(one(sp.d), "destination") ?? catalog(TRIP_EXAMPLE.destination, "destination"),
    nights: int(one(sp.n), TRIP_EXAMPLE.nights, 1, 30),
    travelers: int(one(sp.p), TRIP_EXAMPLE.travelers, 1, 10),
  };

  return (
    <>
      <PageHeader
        eyebrow="Viajes"
        title="¿Te da para ese viaje?"
        intro="Elige origen y destino (cualquier ciudad del mundo), noches y personas. Te damos tres planes con todo incluido y te decimos si te da."
      />
      <Container className="pb-24">
        <TravelPlanner initial={initial} />
      </Container>
    </>
  );
}
