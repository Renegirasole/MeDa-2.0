import type { CategorySlug } from "@/lib/data/categories";

/** Pilares de contenido (ver docs/marketing/SEMANA-3.md). */
export type Pillar = "Vivienda" | "Coche y moto" | "Dinero joven";

export interface Guide {
  slug: string;
  pillar: Pillar;
  /** Titular: la pregunta tal y como se busca */
  title: string;
  /** Texto de la tarjeta en el índice */
  teaser: string;
  description: string;
  /** Calculadora a la que lleva */
  category: CategorySlug;
  published: string;
  updated: string;
  minutes: number;
}

export const GUIDES: Guide[] = [
  {
    slug: "sueldo-para-hipoteca",
    pillar: "Vivienda",
    title: "¿Qué sueldo necesitas para una hipoteca de 200.000 €?",
    teaser: "La cuota, lo que tienes que cobrar y lo que tienes que tener ahorrado, de 100.000 a 300.000 €.",
    description:
      "Cuánto tienes que ganar para una hipoteca de 200.000 €: cuota a 25 y 30 años, sueldo neto mínimo, entrada y gastos. Con tabla de 100.000 a 300.000 € y calculadora.",
    category: "comprar-vivienda",
    published: "2026-09-19",
    updated: "2026-09-19",
    minutes: 6,
  },
];

export const GUIDE_BY_SLUG = Object.fromEntries(GUIDES.map((g) => [g.slug, g])) as Record<string, Guide>;

export const guidesFor = (category: CategorySlug) => GUIDES.filter((g) => g.category === category);
