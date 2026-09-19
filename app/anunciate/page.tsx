import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { PageHeader } from "@/components/pages/PageHeader";
import { ArrowGlyph, buttonClass } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Anúnciate en MeDa",
  description: "Llega a personas justo cuando comprueban si les da para comprar un coche, una vivienda o un viaje.",
  alternates: { canonical: "/anunciate" },
};

const POINTS = [
  { title: "Intención de compra real", text: "Quien usa MeDa está a punto de comprar, alquilar o reservar." },
  { title: "Por categoría", text: "Coche, vivienda, alquiler, viajes, tecnología, estudios y más." },
  { title: "Sin tocar la nota", text: "Los patrocinios se marcan siempre y nunca cambian el cálculo ni el orden." },
];

export default function AdvertisePage() {
  const subject = encodeURIComponent("Quiero anunciarme en MeDa");
  return (
    <>
      <PageHeader
        eyebrow="Empresa"
        title="Anúnciate en MeDa"
        intro="Aparece justo cuando alguien comprueba que le da para comprar lo que tú vendes."
        aside={
          <a href={`mailto:${SITE.owner.email}?subject=${subject}`} className={buttonClass("primary", "lg", "group/btn")}>
            Escríbenos
            <ArrowGlyph />
          </a>
        }
      />
      <Container className="pb-24">
        <ol className="grid gap-x-8 gap-y-10 md:grid-cols-3">
          {POINTS.map((p, i) => (
            <li key={p.title} className="relative border-t border-ink/15 pt-6">
              <span aria-hidden="true" className="absolute -top-px left-0 h-px w-10 bg-ink" />
              <span className="num text-[13px] font-medium text-muted">0{i + 1}</span>
              <h2 className="mt-3 text-lg font-semibold text-ink">{p.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
