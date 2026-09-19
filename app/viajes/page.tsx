import type { Metadata } from "next";
import { DESTINATION_BY_ID, ORIGIN_BY_ID } from "@/lib/data/travel";
import { TRIP_EXAMPLE } from "@/lib/data/examples";
import { TravelPlanner, type TripQuery } from "@/components/tools/TravelPlanner";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Planificador de viajes: cuánto cuesta y si te da",
  description:
    "Calcula cuánto cuesta un viaje por persona en 3 planes (barato, calidad-precio y top): aeropuerto, vuelo, alojamiento, comida y qué ver. Y si te da con tus ahorros.",
  alternates: { canonical: "/viajes" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const int = (v: string | undefined, fallback: number, min: number, max: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

export default async function TravelPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const o = one(sp.o);
  const d = one(sp.d);
  const initial: TripQuery = {
    origin: o && o in ORIGIN_BY_ID ? o : TRIP_EXAMPLE.origin,
    destination: d && d in DESTINATION_BY_ID ? d : TRIP_EXAMPLE.destination,
    nights: int(one(sp.n), TRIP_EXAMPLE.nights, 1, 30),
    travelers: int(one(sp.p), TRIP_EXAMPLE.travelers, 1, 10),
  };

  return (
    <>
      <PageHeader
        eyebrow="Viajes"
        title="¿Te da para ese viaje?"
        intro="Elige origen, destino, noches y personas. Te damos tres planes con todo incluido y te decimos si te da."
      />
      <Container className="pb-24">
        <TravelPlanner initial={initial} />
      </Container>
    </>
  );
}
