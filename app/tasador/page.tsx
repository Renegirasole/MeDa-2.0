import type { Metadata } from "next";
import Link from "next/link";
import { APPRAISALS } from "@/lib/data/appraisal";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";
import { IconArrowRight, IconCar, IconHouse, IconKey } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "¿A cuánto lo pongo? Tasador de pisos y coches",
  description:
    "Calcula a qué precio vender o alquilar tu piso, o vender tu coche, comparando con anuncios de tu zona. Gratis y sin registrarte.",
  alternates: { canonical: "/tasador" },
};

const ICONS = { "vender-piso": IconHouse, "alquilar-piso": IconKey, "vender-coche": IconCar } as const;
const TEXT = {
  "vender-piso": "Precio de venta según pisos parecidos de tu zona",
  "alquilar-piso": "Alquiler competitivo para no tenerlo vacío",
  "vender-coche": "Precio según anuncios del mismo modelo y sus kilómetros",
} as const;

export default function AppraiserIndexPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tasador"
        title="¿A cuánto lo pongo?"
        intro="Elige qué vendes o alquilas. Comparamos con anuncios de tu zona y te damos tres precios: para vender rápido, de mercado y si no tienes prisa."
      />
      <Container className="pb-24">
        <ul className="grid gap-4 md:grid-cols-3">
          {APPRAISALS.map((a) => {
            const Icon = ICONS[a.slug];
            return (
              <li key={a.slug}>
                <Link
                  href={`/tasador/${a.slug}`}
                  className="group flex h-full min-h-52 flex-col rounded-card border border-line bg-surface p-6 transition-[border-color,box-shadow,transform] duration-160 ease-(--ease-out) hover:border-ink/20 hover:shadow-card active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <span className="flex items-start justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-subtle text-ink transition-colors duration-200 group-hover:bg-brand-50 group-hover:text-brand-700">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <IconArrowRight
                      size={20}
                      aria-hidden="true"
                      className="text-line-strong transition-[transform,color] duration-200 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:text-ink"
                    />
                  </span>
                  <span className="mt-auto pt-8 text-lg font-semibold text-ink">{a.name}</span>
                  <span className="mt-1 text-[15px] leading-snug text-muted">{TEXT[a.slug]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}
