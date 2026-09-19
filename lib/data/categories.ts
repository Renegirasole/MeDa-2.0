import type { PurchaseInput } from "@/lib/engine";

export type CategorySlug =
  | "coche"
  | "comprar-vivienda"
  | "alquilar-vivienda"
  | "tecnologia"
  | "viaje"
  | "estudios"
  | "moto"
  | "deporte"
  | "mascota"
  | "otro";

export type CategoryIcon =
  | "car"
  | "house"
  | "key"
  | "laptop"
  | "plane"
  | "study"
  | "moto"
  | "gym"
  | "pet"
  | "other";

export interface CategoryConfig {
  slug: CategorySlug;
  name: string;
  /** Titular de la calculadora */
  question: string;
  /** Línea corta para la tarjeta del grid */
  teaser: string;
  /** Meta description orientada a búsqueda */
  metaDescription: string;
  icon: CategoryIcon;
  /** "purchase": precio del bien. "recurring": cuota mensual (alquiler, gimnasio) */
  kind: "purchase" | "recurring";
  /** Parte razonable de tus ingresos para este gasto (coste mensual / ingresos) */
  guideline: number;
  allowFinancing: boolean;
  defaults: PurchaseInput;
  labels: {
    price: string;
    fee?: string;
    upfront: string;
    running: string;
    runningHint: string;
  };
}

const base: PurchaseInput = {
  price: 0,
  downPayment: 0,
  termMonths: 0,
  annualRate: 0,
  upfrontCosts: 0,
  monthlyFee: 0,
  monthlyRunningCosts: 0,
};

export const CATEGORIES: CategoryConfig[] = [
  {
    slug: "coche",
    name: "Coche",
    question: "¿Te da para un coche?",
    teaser: "Cuota, seguro, gasolina y mantenimiento",
    metaDescription:
      "Calcula si te da para comprar un coche con tu sueldo: cuota real, seguro, gasolina y mantenimiento. Gratis, sin registrarte y con nota de 0 a 10.",
    icon: "car",
    kind: "purchase",
    guideline: 0.2,
    allowFinancing: true,
    defaults: { ...base, price: 16000, downPayment: 3000, termMonths: 60, annualRate: 7.5, upfrontCosts: 400, monthlyRunningCosts: 200 },
    labels: {
      price: "Precio del coche",
      upfront: "Gastos iniciales",
      running: "Gastos al mes",
      runningHint: "Seguro, gasolina, mantenimiento e impuesto de circulación",
    },
  },
  {
    slug: "comprar-vivienda",
    name: "Comprar vivienda",
    question: "¿Te da para comprar casa?",
    teaser: "Hipoteca, entrada, impuestos y comunidad",
    metaDescription:
      "¿Cuánta hipoteca puedo pagar? Calcula si te da para comprar vivienda con tus ingresos: cuota, entrada, impuestos y gastos. Gratis y sin registro.",
    icon: "house",
    kind: "purchase",
    guideline: 0.35,
    allowFinancing: true,
    defaults: { ...base, price: 180000, downPayment: 36000, termMonths: 300, annualRate: 3, upfrontCosts: 18000, monthlyRunningCosts: 120 },
    labels: {
      price: "Precio de la vivienda",
      upfront: "Impuestos, notaría y registro",
      running: "Gastos al mes",
      runningHint: "Comunidad, IBI prorrateado y seguro de hogar",
    },
  },
  {
    slug: "alquilar-vivienda",
    name: "Alquilar vivienda",
    question: "¿Te da para ese alquiler?",
    teaser: "Renta, fianza y suministros",
    metaDescription:
      "¿Cuánto alquiler puedo pagar con mi sueldo? Calcula si te da para ese piso: renta, fianza y suministros. Gratis, sin registrarte y en 2 minutos.",
    icon: "key",
    kind: "recurring",
    guideline: 0.35,
    allowFinancing: false,
    defaults: { ...base, monthlyFee: 850, upfrontCosts: 1700, monthlyRunningCosts: 90 },
    labels: {
      price: "Precio",
      fee: "Alquiler al mes",
      upfront: "Fianza y gastos de entrada",
      running: "Suministros al mes",
      runningHint: "Luz, agua, gas e internet",
    },
  },
  {
    slug: "tecnologia",
    name: "Tecnología",
    question: "¿Te da para ese móvil u ordenador?",
    teaser: "Al contado o a plazos, sin sustos",
    metaDescription:
      "Calcula si te da para comprar un móvil, portátil o consola, al contado o a plazos, sin romper tus ahorros. Gratis y sin registrarte.",
    icon: "laptop",
    kind: "purchase",
    guideline: 0.06,
    allowFinancing: true,
    defaults: { ...base, price: 1200 },
    labels: {
      price: "Precio",
      upfront: "Accesorios y extras",
      running: "Gastos al mes",
      runningHint: "Seguro, suscripciones o fundas",
    },
  },
  {
    slug: "viaje",
    name: "Viaje",
    question: "¿Te da para ese viaje?",
    teaser: "Sin tocar tu colchón de emergencia",
    metaDescription:
      "Calcula si te da para irte de viaje sin quedarte sin colchón: coste real del viaje y cuánto te queda después. Gratis y sin registro.",
    icon: "plane",
    kind: "purchase",
    guideline: 0.1,
    allowFinancing: false,
    defaults: { ...base, price: 900 },
    labels: {
      price: "Coste del viaje",
      upfront: "Extras (seguro, maletas…)",
      running: "Gastos al mes",
      runningHint: "Normalmente 0 en un viaje",
    },
  },
  {
    slug: "estudios",
    name: "Estudios",
    question: "¿Te da para esos estudios?",
    teaser: "Matrícula, material y lo que dejas de ganar",
    metaDescription:
      "Calcula si te da para pagar un máster, grado o curso: matrícula, material y gastos mensuales. Gratis, sin registrarte y con nota de 0 a 10.",
    icon: "study",
    kind: "purchase",
    guideline: 0.2,
    allowFinancing: true,
    defaults: { ...base, price: 6000, monthlyRunningCosts: 150 },
    labels: {
      price: "Matrícula total",
      upfront: "Tasas y reserva de plaza",
      running: "Gastos al mes",
      runningHint: "Material, transporte, comidas fuera",
    },
  },
  {
    slug: "moto",
    name: "Moto",
    question: "¿Te da para una moto?",
    teaser: "Cuota, seguro y equipación",
    metaDescription:
      "Calcula si te da para comprar una moto: cuota, seguro, gasolina, mantenimiento y equipación. Gratis y sin registro.",
    icon: "moto",
    kind: "purchase",
    guideline: 0.12,
    allowFinancing: true,
    defaults: { ...base, price: 6000, downPayment: 1500, termMonths: 48, annualRate: 8, upfrontCosts: 600, monthlyRunningCosts: 70 },
    labels: {
      price: "Precio de la moto",
      upfront: "Equipación y matrícula",
      running: "Gastos al mes",
      runningHint: "Seguro, gasolina y mantenimiento",
    },
  },
  {
    slug: "deporte",
    name: "Gimnasio y deporte",
    question: "¿Te da para ese gimnasio?",
    teaser: "Cuota, matrícula y equipación",
    metaDescription:
      "Calcula si te da para apuntarte al gimnasio, pádel o cualquier deporte: cuota, matrícula y equipación. Gratis y sin registrarte.",
    icon: "gym",
    kind: "recurring",
    guideline: 0.05,
    allowFinancing: false,
    defaults: { ...base, monthlyFee: 45, upfrontCosts: 30, monthlyRunningCosts: 15 },
    labels: {
      price: "Precio",
      fee: "Cuota al mes",
      upfront: "Matrícula",
      running: "Otros gastos al mes",
      runningHint: "Equipación, suplementos, desplazamientos",
    },
  },
  {
    slug: "mascota",
    name: "Mascota",
    question: "¿Te da para tener una mascota?",
    teaser: "Comida, veterinario y primeros gastos",
    metaDescription:
      "Calcula cuánto cuesta tener un perro o un gato y si te da con tu sueldo: comida, veterinario, seguro y primeros gastos. Gratis y sin registro.",
    icon: "pet",
    kind: "purchase",
    guideline: 0.06,
    allowFinancing: false,
    defaults: { ...base, price: 150, upfrontCosts: 250, monthlyRunningCosts: 70 },
    labels: {
      price: "Adopción o compra",
      upfront: "Chip, vacunas y accesorios",
      running: "Gastos al mes",
      runningHint: "Comida, veterinario y seguro",
    },
  },
  {
    slug: "otro",
    name: "Otro gasto",
    question: "¿Te da para eso?",
    teaser: "Cualquier compra o gasto nuevo",
    metaDescription:
      "Calcula si te da para cualquier compra o gasto con tus ingresos, gastos y ahorros. Nota de 0 a 10, gratis y sin registrarte.",
    icon: "other",
    kind: "purchase",
    guideline: 0.1,
    allowFinancing: true,
    defaults: { ...base, price: 1000 },
    labels: {
      price: "Precio",
      upfront: "Gastos iniciales",
      running: "Gastos al mes",
      runningHint: "Lo que te cueste mantenerlo",
    },
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<
  CategorySlug,
  CategoryConfig
>;

export const isCategorySlug = (v: string): v is CategorySlug => v in CATEGORY_BY_SLUG;
