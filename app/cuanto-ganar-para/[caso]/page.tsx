import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HOUSING, MORTGAGE_ASSUMPTIONS as A, mortgagePurchase } from "@/lib/guides/mortgage";
import { MORTGAGE_AMOUNTS, mortgageCase, mortgageSlug, neighbors, parseMortgageSlug, PROGRAMMATIC_UPDATED } from "@/lib/programmatic";
import { encodeShare } from "@/lib/share";
import { formatEUR, formatPct } from "@/lib/format";
import { DataTable, GuideSection, GuideShell, type Faq } from "@/components/guides/Guide";
import { Stat } from "@/components/ui/Stat";

type Params = Promise<{ caso: string }>;

export const dynamicParams = false;
export const generateStaticParams = () => MORTGAGE_AMOUNTS.map((v) => ({ caso: mortgageSlug(v) }));

const rate = `${A.rate.toLocaleString("es-ES")} %`;
const titleFor = (loan: number) => `¿Cuánto tengo que ganar para una hipoteca de ${formatEUR(loan)}?`;
function describe(loan: number) {
  const { r30, income30 } = mortgageCase(loan);
  return `Hipoteca de ${formatEUR(loan)} a ${A.years} años al ${rate}: cuota de ${formatEUR(r30.payment)} al mes, sueldo neto mínimo de ${formatEUR(income30)} y ${formatEUR(r30.cashNeeded)} ahorrados. Con calculadora gratis.`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const loan = parseMortgageSlug((await params).caso);
  if (!loan) return {};
  const title = titleFor(loan);
  const description = describe(loan);
  const path = `/cuanto-ganar-para/${mortgageSlug(loan)}`;
  return { title, description, alternates: { canonical: path }, openGraph: { type: "article", title, description, url: path } };
}

export default async function MortgageAmountPage({ params }: { params: Params }) {
  const loan = parseMortgageSlug((await params).caso);
  if (!loan) notFound();
  const { r30, r25, income30, income25 } = mortgageCase(loan);
  const path = `/cuanto-ganar-para/${mortgageSlug(loan)}`;
  const href = `/calculadoras/${HOUSING.slug}#s=${encodeShare({ purchase: mortgagePurchase(loan) })}`;
  const guideline = formatPct(HOUSING.guideline);
  const i = MORTGAGE_AMOUNTS.indexOf(loan);
  const next = MORTGAGE_AMOUNTS[i + 1] ?? MORTGAGE_AMOUNTS[i - 1];
  const stepCase = mortgageCase(next);
  const stepSign = next > loan ? "más" : "menos";

  const faqs: Faq[] = [
    {
      q: `¿Qué cuota tiene una hipoteca de ${formatEUR(loan)}?`,
      a: `Con un ${rate} de interés, unos ${formatEUR(r30.payment)} al mes a ${A.years} años y ${formatEUR(r25.payment)} a 25 años.`,
    },
    {
      q: `¿Cuánto hay que cobrar para una hipoteca de ${formatEUR(loan)}?`,
      a: `Al menos ${formatEUR(income30)} netos al mes a ${A.years} años (${formatEUR(income25)} a 25 años), para que la cuota y los gastos de la casa no pasen del ${guideline} de tus ingresos y te quede margen y colchón. En pareja, entre los dos sueldos.`,
    },
    {
      q: `¿Cuánto hay que tener ahorrado para una hipoteca de ${formatEUR(loan)}?`,
      a: `Si el banco financia el ${formatPct(A.financedShare)}, la casa costaría ${formatEUR(r30.price)}: ${formatEUR(r30.downPayment)} de entrada y unos ${formatEUR(r30.upfront)} de impuestos y gastos. En total, unos ${formatEUR(r30.cashNeeded)}.`,
    },
  ];

  return (
    <GuideShell
      guide={{ title: titleFor(loan), description: describe(loan), published: PROGRAMMATIC_UPDATED, updated: PROGRAMMATIC_UPDATED, minutes: 2 }}
      path={path}
      crumbs={[
        { href: "/guias", label: "Guías" },
        { href: "/guias/sueldo-para-hipoteca", label: "Sueldo para una hipoteca" },
      ]}
      faqs={faqs}
      cta={{ href, label: "Mirar si me da", note: `Abre la calculadora con esta hipoteca de ${formatEUR(loan)} puesta y cambia sueldo, gastos y ahorros por los tuyos.` }}
      answer={
        <>
          <p className="max-w-[60ch] text-[19px] leading-relaxed text-white md:text-xl">
            Para una hipoteca de {formatEUR(loan)} a {A.years} años al {rate}, necesitas cobrar al menos{" "}
            <strong className="font-semibold text-brand-300">{formatEUR(income30)} netos al mes</strong> y tener unos{" "}
            <strong className="font-semibold">{formatEUR(r30.cashNeeded)} ahorrados</strong>.
          </p>
          <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-night-line pt-6 sm:grid-cols-3">
            <Stat tone="night" lead label="Cuota al mes" value={formatEUR(r30.payment)} hint={`${A.years} años al ${rate}`} />
            <Stat
              tone="night"
              lead
              label="Sueldo neto mínimo"
              value={formatEUR(income30)}
              hint={income30 > r30.minIncomeEffort ? "Para que MeDa te diga que te da" : `Para no pasar del ${guideline}`}
            />
            <Stat tone="night" lead label="Ahorros" value={formatEUR(r30.cashNeeded)} hint={`Casa de ${formatEUR(r30.price)}`} />
          </dl>
        </>
      }
    >
      <GuideSection id="calculo" title="De dónde salen las cifras">
        <p>
          La cuota de {formatEUR(r30.payment)} sale del sistema francés (cuota fija) a {A.years} años. Sumando unos{" "}
          {formatEUR(A.running)} de comunidad, IBI y seguro, la casa cuesta {formatEUR(r30.monthlyTotal)} al mes. Para que eso
          no pase del {guideline} de lo que ingresas, hacen falta {formatEUR(r30.minIncomeEffort)} netos.
        </p>
        {income30 > r30.minIncomeEffort && (
          <p>
            Con ese sueldo, sin embargo, la calculadora no te diría que te da: los gastos de vida no bajan porque la hipoteca
            sea pequeña, así que te quedarías sin margen. Con unos gastos de {formatEUR(A.livingCosts)} al mes, la nota llega
            al aprobado a partir de {formatEUR(income30)} netos. Esa es la cifra que damos arriba.
          </p>
        )}
        <p>
          A 25 años la cuota sube a {formatEUR(r25.payment)} y el sueldo necesario, a {formatEUR(income25)}, pero pagas unos{" "}
          {formatEUR(r30.payment * A.years * 12 - loan - (r25.payment * 300 - loan))} menos de intereses.
        </p>
        <p>
          Cada 20.000 € {stepSign} de hipoteca mueven la cuota unos {formatEUR(Math.abs(stepCase.r30.payment - r30.payment))} al
          mes y el sueldo necesario unos {formatEUR(Math.abs(stepCase.income30 - income30))}. Si sois dos, basta con que
          sumando lleguéis a {formatEUR(income30)}: por ejemplo, {formatEUR(Math.ceil(income30 / 20) * 10)} cada uno.
        </p>
      </GuideSection>

      <GuideSection id="cerca" title="Hipotecas parecidas">
        <p>
          Mismos supuestos: {rate} de interés, el banco financia el {formatPct(A.financedShare)} y gastos de compra del{" "}
          {formatPct(A.upfrontShare)}. La explicación completa está en la guía{" "}
          <Link href="/guias/sueldo-para-hipoteca" className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
            qué sueldo necesitas para una hipoteca
          </Link>
          .
        </p>
      </GuideSection>
      <DataTable
        caption={`Hipotecas a ${A.years} años al ${rate}`}
        head={["Hipoteca", "Cuota al mes", "Sueldo neto mínimo", "Ahorros"]}
        highlight={neighbors(MORTGAGE_AMOUNTS, loan).indexOf(loan)}
        rows={neighbors(MORTGAGE_AMOUNTS, loan).map((v) => {
          const c = mortgageCase(v);
          return [
            v === loan ? (
              formatEUR(v)
            ) : (
              <Link key={v} href={`/cuanto-ganar-para/${mortgageSlug(v)}`} className="underline underline-offset-4 hover:text-brand-700">
                {formatEUR(v)}
              </Link>
            ),
            formatEUR(c.r30.payment),
            formatEUR(c.income30),
            formatEUR(c.r30.cashNeeded),
          ];
        })}
      />
    </GuideShell>
  );
}
