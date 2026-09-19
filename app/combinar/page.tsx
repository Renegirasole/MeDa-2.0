import type { Metadata } from "next";
import { Combiner } from "@/components/tools/Combiner";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "¿Me da para todo a la vez?",
  description: "Suma varias compras y gastos y comprueba si te da para todo a la vez con tus ingresos, gastos y ahorros.",
  alternates: { canonical: "/combinar" },
};

export default function CombinePage() {
  return (
    <>
      <PageHeader eyebrow="Mi lista" title="¿Te da para todo a la vez?" intro="Juntamos todo lo que has añadido y lo comprobamos de una vez." />
      <Container className="pb-24">
        <Combiner />
      </Container>
    </>
  );
}
