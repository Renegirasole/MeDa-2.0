import { clamp, round, verdictFor, type Verdict } from "@/lib/engine";
import { CATEGORY_BY_SLUG, isCategorySlug, type CategorySlug } from "@/lib/data/categories";
import { formatEUR } from "@/lib/format";

/**
 * La nota para compartir (imagen para stories y enlace con vista previa).
 * Solo lleva la compra, su importe y la nota: nunca ingresos, gastos ni ahorros.
 */
export interface ScoreCard {
  slug: CategorySlug;
  /** Nota de 0 a 10, con un decimal */
  score: number;
  /** Precio del bien o, si es un gasto mensual, la cuota. 0 = sin importe */
  amount: number;
}

/** Qué se compra, en la frase «¿Te da para …?». */
const THING: Record<CategorySlug, string> = {
  coche: "un coche",
  "comprar-vivienda": "una casa",
  "alquilar-vivienda": "un alquiler",
  tecnologia: "ese móvil u ordenador",
  viaje: "un viaje",
  estudios: "esos estudios",
  moto: "una moto",
  deporte: "el gimnasio",
  mascota: "una mascota",
  otro: "ese gasto",
};

const MAX_AMOUNT = 10_000_000;

export const isRecurring = (slug: CategorySlug) => CATEGORY_BY_SLUG[slug].kind === "recurring";

/** «un coche de 16.000 €» · «un alquiler de 850 € al mes» · «ese gasto» */
export function scoreCardThing(card: ScoreCard): string {
  const thing = THING[card.slug];
  if (card.amount <= 0) return thing;
  return `${thing} de ${formatEUR(card.amount)}${isRecurring(card.slug) ? " al mes" : ""}`;
}

export const scoreCardVerdict = (card: ScoreCard): Verdict => verdictFor(card.score);

export function makeScoreCard(slug: CategorySlug, score: number, amount: number): ScoreCard {
  return {
    slug,
    score: round(clamp(Number.isFinite(score) ? score : 0, 0, 10), 1),
    amount: Math.round(clamp(Number.isFinite(amount) ? amount : 0, 0, MAX_AMOUNT)),
  };
}

/** c = categoría, n = nota, i = importe. Cortos para que el enlace quepa en cualquier sitio. */
export function scoreCardQuery(card: ScoreCard): string {
  const q = new URLSearchParams({ c: card.slug, n: String(card.score) });
  if (card.amount > 0) q.set("i", String(card.amount));
  return q.toString();
}

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function pick(params: Params, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

/** Valida lo que llega por la URL. Cualquier cosa rara → null (404 o imagen genérica). */
export function parseScoreCard(params: Params): ScoreCard | null {
  const slug = pick(params, "c");
  const n = Number(pick(params, "n"));
  const i = Number(pick(params, "i") ?? 0);
  if (!slug || !isCategorySlug(slug)) return null;
  if (!Number.isFinite(n) || n < 0 || n > 10) return null;
  if (!Number.isFinite(i) || i < 0 || i > MAX_AMOUNT) return null;
  return makeScoreCard(slug, n, i);
}
