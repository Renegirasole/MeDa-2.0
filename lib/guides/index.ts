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
      "Cuánto tienes que ganar para una hipoteca de 200.000 €: cuota a 25 y 30 años, sueldo mínimo, entrada y gastos. Con tabla de 100.000 a 300.000 €.",
    category: "comprar-vivienda",
    published: "2026-09-19",
    updated: "2026-09-19",
    minutes: 6,
  },
  {
    slug: "coste-real-coche",
    pillar: "Coche y moto",
    title: "¿Cuánto cuesta de verdad un coche al mes?",
    teaser: "La letra es solo una parte. Cuota, gasolina, seguro y mantenimiento, con el sueldo que hace falta para cada precio.",
    description:
      "Un coche de 16.000 € no cuesta 260 € al mes: con gasolina, seguro y mantenimiento son unos 460 €. Coste real y sueldo necesario por precio.",
    category: "coche",
    published: "2026-09-19",
    updated: "2026-09-19",
    minutes: 5,
  },
  {
    slug: "que-le-da-a-un-joven-2026",
    pillar: "Dinero joven",
    title: "¿Qué le da a un joven en 2026?",
    teaser: "Con el sueldo medio de su edad: el alquiler, el coche y la casa que le dan, y cuántos años tarda en ahorrar la entrada.",
    description:
      "Informe MeDa 2026: con el sueldo medio de 25 a 34 años (INE), un alquiler de 490 €, un coche de 9.900 € y una casa de 140.000 €, tras 14 años de entrada.",
    category: "alquilar-vivienda",
    published: "2026-09-19",
    updated: "2026-09-19",
    minutes: 4,
  },
];

export const GUIDE_BY_SLUG = Object.fromEntries(GUIDES.map((g) => [g.slug, g])) as Record<string, Guide>;

export const guidesFor = (category: CategorySlug) => GUIDES.filter((g) => g.category === category);
