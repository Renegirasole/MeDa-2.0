export type AppraisalSlug = "vender-piso" | "alquilar-piso" | "vender-coche";

export interface AppraisalConfig {
  slug: AppraisalSlug;
  name: string;
  question: string;
  /** Entradilla de la página */
  intro: string;
  metaDescription: string;
  mode: "area" | "km";
  subjectLabel: string;
  priceLabel: string;
  priceSuffix: string;
  roundStep: number;
}

export const APPRAISALS: AppraisalConfig[] = [
  {
    slug: "vender-piso",
    name: "Vender piso",
    question: "¿A cuánto pongo mi piso a la venta?",
    intro:
      "Escribe la dirección y miramos solos lo que vale tu barrio: precio de venta rápida, de mercado y sin prisa. Con datos públicos del Catastro y del Ministerio de Transportes.",
    metaDescription:
      "Calcula a qué precio vender tu piso con los precios oficiales de tu barrio: solo con la dirección. Venta rápida, de mercado y sin prisa. Gratis y sin registro.",
    mode: "area",
    subjectLabel: "Metros de tu piso",
    priceLabel: "Precio del anuncio",
    priceSuffix: "€",
    roundStep: 1000,
  },
  {
    slug: "alquilar-piso",
    name: "Alquilar piso",
    question: "¿A cuánto alquilo mi piso?",
    intro:
      "Escribe la dirección y miramos solos lo que se paga en tu barrio: alquiler para no tenerlo vacío, de mercado y sin prisa. Con los alquileres declarados a Hacienda.",
    metaDescription:
      "Calcula el alquiler de tu piso con los precios oficiales de tu barrio: solo con la dirección. Para alquilar rápido, de mercado y sin prisa. Gratis y sin registro.",
    mode: "area",
    subjectLabel: "Metros de tu piso",
    priceLabel: "Alquiler al mes",
    priceSuffix: "€/mes",
    roundStep: 10,
  },
  {
    slug: "vender-coche",
    name: "Vender coche",
    question: "¿A cuánto vendo mi coche?",
    intro:
      "Compara con anuncios del mismo modelo: solo usamos los que tú metes, sin datos inventados. Cuantos más y más parecidos, mejor precio.",
    metaDescription:
      "Calcula a qué precio vender tu coche de segunda mano comparándolo con anuncios del mismo modelo según sus kilómetros. Gratis y sin registro.",
    mode: "km",
    subjectLabel: "Kilómetros de tu coche",
    priceLabel: "Precio del anuncio",
    priceSuffix: "€",
    roundStep: 100,
  },
];

export const APPRAISAL_BY_SLUG = Object.fromEntries(APPRAISALS.map((a) => [a.slug, a])) as Record<
  AppraisalSlug,
  AppraisalConfig
>;

export const isAppraisalSlug = (v: string): v is AppraisalSlug => v in APPRAISAL_BY_SLUG;
