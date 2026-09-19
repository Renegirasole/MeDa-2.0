import type { Metadata } from "next";
import { OfferComparator } from "@/components/tools/OfferComparator";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Comparar ofertas: cuál te conviene de verdad",
  description:
    "Compara hasta 4 ofertas de coche, moto o vivienda: precio, entrada, plazo e interés. Cuál te conviene según tu situación, no solo cuál es más barata.",
  alternates: { canonical: "/comparar" },
};

export default function ComparePage() {
  return (
    <>
      <PageHeader
        eyebrow="Comparador"
        title="Comparar ofertas"
        intro="Mete las ofertas que tienes. Te decimos cuál te conviene según tu situación, no solo cuál es más barata."
      />
      <Container className="pb-24">
        <OfferComparator />
      </Container>
    </>
  );
}
