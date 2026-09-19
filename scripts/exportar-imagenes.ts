/**
 * Exporta a PNG las imágenes de marketing: el carrusel de la guía de hipoteca y
 * stories de ejemplo con los perfiles de los guiones (docs/marketing/SEMANA-2.md).
 * Las notas las calcula el motor: nunca se escriben a mano.
 *
 * Uso, con la web en marcha (npm run build && npm start):
 *   npx tsx scripts/exportar-imagenes.ts [url-base]   (por defecto http://localhost:3000)
 * Guarda en docs/marketing/semana-3/.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { evaluateOne, type FinancialProfile, type PurchaseInput } from "../lib/engine";
import { CATEGORY_BY_SLUG, type CategorySlug } from "../lib/data/categories";
import { makeScoreCard, scoreCardQuery } from "../lib/scorecard";

const base = process.argv[2] ?? "http://localhost:3000";
const out = join(process.cwd(), "docs", "marketing", "semana-3");

const profile = (monthlyIncome: number, monthlyExpenses: number, savings: number): FinancialProfile => ({
  monthlyIncome,
  monthlyExpenses,
  monthlyDebtPayments: 0,
  savings,
  emergencyMonths: 3,
  upcomingExpenses: 0,
});

function story(slug: CategorySlug, p: FinancialProfile, change: Partial<PurchaseInput>) {
  const c = CATEGORY_BY_SLUG[slug];
  const purchase = { ...c.defaults, ...change };
  const { score } = evaluateOne(p, purchase, c.guideline);
  const amount = c.kind === "recurring" ? purchase.monthlyFee : purchase.price;
  return `/api/nota?${scoreCardQuery(makeScoreCard(slug, score, amount))}`;
}

const jobs: [string, string][] = [
  ...Array.from({ length: 7 }, (_, i): [string, string] => [`carrusel/hipoteca-${i + 1}.png`, `/api/carrusel?n=${i + 1}`]),
  // V1: 1.400 € de sueldo y un coche de 16.000 € con 3.000 € de entrada a 60 meses.
  ["stories/v1-coche-16000.png", story("coche", profile(1400, 800, 4000), { price: 16000, downPayment: 3000, termMonths: 60 })],
  // V3: alquiler de 950 € cobrando 1.600 €.
  ["stories/v3-alquiler-950.png", story("alquilar-vivienda", profile(1600, 500, 3000), { monthlyFee: 950, upfrontCosts: 1900 })],
  // V4: móvil de 1.300 € a 24 meses (sin intereses) cobrando 1.200 €.
  ["stories/v4-movil-1300.png", story("tecnologia", profile(1200, 750, 800), { price: 1300, termMonths: 24 })],
];

async function main() {
  for (const [file, path] of jobs) {
    const res = await fetch(base + path);
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    const dest = join(out, file);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log("ok", file, path);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
