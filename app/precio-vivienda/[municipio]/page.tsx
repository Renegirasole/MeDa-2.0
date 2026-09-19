import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MORTGAGE_ASSUMPTIONS as A, mortgagePurchase } from "@/lib/guides/mortgage";
import {
  AREAS,
  HEADLINE_AREA,
  HOUSING,
  neighbours,
  PRICE_SOURCES,
  RENTING,
  TOWN_BY_SLUG,
  TOWNS,
  townCase,
  vsNational,
  type Town,
} from "@/lib/zonas/precios";
import { rentSlug, RENT_SALARIES } from "@/lib/programmatic";
import { encodeShare } from "@/lib/share";
import { formatDecimal, formatEUR, formatNumber, formatPct } from "@/lib/format";
import { DataTable, GuideSection, GuideShell, type Faq } from "@/components/guides/Guide";
import { Stat } from "@/components/ui/Stat";

type Params = Promise<{ municipio: string }>;

export const dynamicParams = false;
export const generateStaticParams = () => TOWNS.map((t) => ({ municipio: t.slug }));

/** Las cifras se recalculan en cada despliegue; esta es la fecha de la fuente. */
const UPDATED = "2026-09-20";

const unit = (v: number) => `${formatNumber(Math.round(v))} €`;
const titleFor = (t: Town) => `¿Cuánto cuesta un piso en ${t.name}?`;

function describe(t: Town) {
  const c = townCase(t, HEADLINE_AREA);
  const rent = c.rent ? ` Alquilarlo, unos ${formatEUR(c.rent)} al mes.` : "";
  return `En ${t.name} el metro cuadrado vale ${unit(t.saleUnit)} de media: un piso de ${HEADLINE_AREA} m², ${formatEUR(c.price)}, con una cuota de ${formatEUR(c.mortgage.payment)}.${rent}`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = TOWN_BY_SLUG[(await params).municipio];
  if (!t) return {};
  const title = titleFor(t);
  const description = describe(t);
  const path = `/precio-vivienda/${t.slug}`;
  return { title, description, alternates: { canonical: path }, openGraph: { type: "article", title, description, url: path } };
}

export default async function TownPricePage({ params }: { params: Params }) {
  const t = TOWN_BY_SLUG[(await params).municipio];
  if (!t) notFound();

  const c = townCase(t, HEADLINE_AREA);
  const path = `/precio-vivienda/${t.slug}`;
  const href = `/calculadoras/${HOUSING.slug}#s=${encodeShare({ purchase: mortgagePurchase(c.price * A.financedShare) })}`;
  const gap = vsNational(t);
  const guideline = formatPct(HOUSING.guideline);
  const near = neighbours(t);
  // El sueldo de la tabla de alquiler, redondeado a una de las páginas publicadas.
  const rentSalary = c.rentIncome ? RENT_SALARIES.reduce((a, b) => (Math.abs(b - c.rentIncome!) < Math.abs(a - c.rentIncome!) ? b : a)) : null;

  const faqs: Faq[] = [
    {
      q: `¿Cuánto cuesta el metro cuadrado en ${t.name}?`,
      a: `${unit(t.saleUnit)} de media según el valor tasado del ${PRICE_SOURCES.salePeriod} (Ministerio de Transportes). Es el valor que usan los bancos para dar hipotecas; en los anuncios se suele pedir algo más.`,
    },
    {
      q: `¿Cuánto hay que ganar para comprar un piso en ${t.name}?`,
      a: `Para un piso de ${HEADLINE_AREA} m² (${formatEUR(c.price)}), unos ${formatEUR(c.mortgage.minIncomeEffort)} netos al mes, con ${formatEUR(c.mortgage.cashNeeded)} ahorrados para la entrada y los gastos. En pareja, entre los dos sueldos.`,
    },
    ...(c.rent
      ? [
          {
            q: `¿Cuánto se paga de alquiler en ${t.name}?`,
            a: `Un piso de ${HEADLINE_AREA} m² ronda los ${formatEUR(c.rent)} al mes (${formatDecimal(t.rentUnit!)} € por m²), según los alquileres declarados a Hacienda en ${PRICE_SOURCES.rentYear}. Los que salen hoy al mercado suelen ir por encima.`,
          },
        ]
      : []),
    {
      q: `¿Sale más a cuenta comprar o alquilar en ${t.name}?`,
      a: c.rent
        ? `La cuota de la hipoteca de ese piso sería de ${formatEUR(c.mortgage.payment)} y el alquiler, de ${formatEUR(c.rent)}. Comprar exige además tener ${formatEUR(c.mortgage.cashNeeded)} ahorrados el día de la firma, y pagar comunidad, IBI y derramas.`
        : `Depende de lo que tengas ahorrado: comprar ese piso pide ${formatEUR(c.mortgage.cashNeeded)} el día de la firma, además de la cuota de ${formatEUR(c.mortgage.payment)}.`,
    },
  ];

  return (
    <GuideShell
      guide={{ title: titleFor(t), description: describe(t), published: UPDATED, updated: UPDATED, minutes: 3 }}
      path={path}
      crumbs={[
        { href: "/precio-vivienda", label: "Precio de la vivienda" },
        { href: "/calculadoras/comprar-vivienda", label: "Comprar casa" },
      ]}
      faqs={faqs}
      cta={{
        href,
        label: "Mirar si me da",
        note: `Abre la calculadora con un piso de ${HEADLINE_AREA} m² en ${t.name} y cambia el precio y tus números por los tuyos.`,
      }}
      answer={
        <>
          <p className="max-w-[60ch] text-[19px] leading-relaxed text-white md:text-xl">
            En {t.name} el metro cuadrado vale <strong className="font-semibold text-brand-300">{unit(t.saleUnit)}</strong> de
            media. Un piso de {HEADLINE_AREA} m² sale por <strong className="font-semibold">{formatEUR(c.price)}</strong>: una
            cuota de {formatEUR(c.mortgage.payment)} al mes y {formatEUR(c.mortgage.cashNeeded)} ahorrados para empezar.
          </p>
          <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-night-line pt-6 sm:grid-cols-3">
            <Stat tone="night" lead label="Precio del m²" value={unit(t.saleUnit)} hint={`Valor tasado, ${PRICE_SOURCES.salePeriod}`} />
            <Stat tone="night" lead label={`Piso de ${HEADLINE_AREA} m²`} value={formatEUR(c.price)} hint={`Cuota de ${formatEUR(c.mortgage.payment)}`} />
            {c.rent ? (
              <Stat tone="night" lead label="Alquiler de ese piso" value={`${formatEUR(c.rent)}`} hint={`${formatDecimal(t.rentUnit!)} € por m² al mes`} />
            ) : (
              <Stat tone="night" lead label="Sueldo necesario" value={formatEUR(c.mortgage.minIncomeEffort)} hint={`Para no pasar del ${guideline}`} />
            )}
          </dl>
        </>
      }
    >
      <GuideSection id="comprar" title="Lo que cuesta comprar, por metros">
        <p>
          Con el banco financiando el {formatPct(A.financedShare)} a {A.years} años al {A.rate.toLocaleString("es-ES")} %, y
          contando impuestos y gastos ({formatPct(A.upfrontShare)} del precio). El sueldo es el que hace falta para que la cuota
          y los gastos de la casa no pasen del {guideline} de lo que cobras.
        </p>
      </GuideSection>
      <DataTable
        caption={`Comprar en ${t.name} a ${unit(t.saleUnit)} el m²`}
        head={["Piso", "Precio", "Entrada y gastos", "Cuota al mes", "Sueldo neto"]}
        highlight={AREAS.indexOf(HEADLINE_AREA as (typeof AREAS)[number])}
        rows={AREAS.map((a) => {
          const x = townCase(t, a);
          return [
            `${a} m²`,
            formatEUR(x.price),
            formatEUR(x.mortgage.cashNeeded),
            formatEUR(x.mortgage.payment),
            formatEUR(x.mortgage.minIncomeEffort),
          ];
        })}
      />

      {c.rent && t.rentUnit && (
        <>
          <GuideSection id="alquilar" title="Lo que cuesta alquilar">
            <p>
              Son los alquileres que se declararon a Hacienda en {PRICE_SOURCES.rentYear} en {t.name}: la mitad de los pisos
              están por debajo de {formatDecimal(t.rentUnit)} € el m² y la mitad por encima. Lo que sale hoy al mercado suele ir
              por encima de esa cifra, porque aquí también cuentan los contratos antiguos.
            </p>
          </GuideSection>
          <DataTable
            caption={`Alquilar en ${t.name}, al mes`}
            head={["Piso", "Barato (25 %)", "Normal", "Caro (75 %)", "Sueldo neto"]}
            highlight={AREAS.indexOf(HEADLINE_AREA as (typeof AREAS)[number])}
            rows={AREAS.map((a) => {
              const x = townCase(t, a);
              return [
                `${a} m²`,
                t.rentLow ? formatEUR(Math.round((t.rentLow * a) / 10) * 10) : "—",
                formatEUR(x.rent ?? 0),
                t.rentHigh ? formatEUR(Math.round((t.rentHigh * a) / 10) * 10) : "—",
                x.rentIncome ? formatEUR(x.rentIncome) : "—",
              ];
            })}
          />
          <p className="-mt-8 max-w-[65ch] text-[15px] leading-relaxed text-muted">
            El sueldo incluye unos {formatEUR(RENTING.defaults.monthlyRunningCosts)} de luz, agua, gas e internet, para que la
            vivienda no pase del {formatPct(RENTING.guideline)} de lo que cobras.{" "}
            {rentSalary && (
              <Link href={`/alquiler-maximo/${rentSlug(rentSalary)}`} className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
                Si cobras {formatEUR(rentSalary)}, esto es lo que te da
              </Link>
            )}
            .
          </p>
        </>
      )}

      <GuideSection id="comparar" title={`¿Es caro ${t.name}?`}>
        <p>
          {gap !== null && t.nationalUnit ? (
            <>
              En España el metro cuadrado está en {unit(t.nationalUnit)}, así que {t.name} va un{" "}
              <strong className="font-medium text-ink">{formatPct(Math.abs(gap))}</strong> {gap >= 0 ? "por encima" : "por debajo"}{" "}
              de la media.{" "}
            </>
          ) : null}
          {t.provUnit ? `En la provincia de ${t.provName}, la media es de ${unit(t.provUnit)}.` : null}
        </p>
        <p>
          Lo que de verdad importa no es la media, sino si te da a ti: depende de tus ingresos, de tus gastos y de lo que tengas
          ahorrado.{" "}
          <Link href="/tasador/vender-piso" className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
            Si lo que quieres es vender
          </Link>
          , el Tasador mira el precio de tu barrio, no el del municipio entero.
        </p>
      </GuideSection>

      {near.length > 0 && (
        <GuideSection id="cerca" title={`Otras ciudades de ${t.provName}`}>
          <ul className="flex flex-wrap gap-2">
            {near.map((n) => (
              <li key={n.code}>
                <Link
                  href={`/precio-vivienda/${n.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-3.5 text-[14px] text-ink-2 transition-colors duration-150 hover:border-ink/40 hover:text-ink"
                >
                  {n.name} <span className="num ml-2 text-muted">{unit(n.saleUnit)}/m²</span>
                </Link>
              </li>
            ))}
          </ul>
        </GuideSection>
      )}
    </GuideShell>
  );
}
