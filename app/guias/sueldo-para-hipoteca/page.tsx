import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_BY_SLUG } from "@/lib/guides";
import { headlineCase, HOUSING, LOAN_TABLE, MORTGAGE_ASSUMPTIONS, mortgageRow, RATE_TABLE } from "@/lib/guides/mortgage";
import { VERDICT_COPY } from "@/lib/copy";
import { encodeShare } from "@/lib/share";
import { formatEUR, formatPct, formatScore } from "@/lib/format";
import { DataTable, GuideSection, GuideShell, type Faq } from "@/components/guides/Guide";
import { Stat } from "@/components/ui/Stat";

const guide = GUIDE_BY_SLUG["sueldo-para-hipoteca"];

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guias/${guide.slug}` },
  openGraph: { type: "article", title: guide.title, description: guide.description, url: `/guias/${guide.slug}` },
};

const A = MORTGAGE_ASSUMPTIONS;
const rate = (v: number) => `${v.toLocaleString("es-ES")} %`;

export default function MortgageSalaryGuide() {
  const { row, profile, purchase, minIncomeYes, atEffort } = headlineCase(200_000);
  const row25 = mortgageRow(200_000, 25);
  const interest30 = row.payment * A.years * 12 - row.loan;
  const interest25 = row25.payment * 25 * 12 - row.loan;
  const cheapRate = mortgageRow(200_000, A.years, RATE_TABLE[0]);
  const dearRate = mortgageRow(200_000, A.years, RATE_TABLE[RATE_TABLE.length - 1]);
  const href = `/calculadoras/${HOUSING.slug}#s=${encodeShare({ purchase })}`;
  const guideline = formatPct(HOUSING.guideline);

  const faqs: Faq[] = [
    {
      q: "¿Cuánto tengo que ganar para una hipoteca de 200.000 €?",
      a: `Con una hipoteca de 200.000 € a ${A.years} años y un ${rate(A.rate)} de interés, la cuota es de unos ${formatEUR(row.payment)} al mes. Sumando unos ${formatEUR(A.running)} de comunidad, IBI y seguro, necesitas cobrar al menos ${formatEUR(row.minIncomeEffort)} netos al mes para que la vivienda no se lleve más del ${guideline} de tus ingresos.`,
    },
    {
      q: "¿Qué cuota se queda con una hipoteca de 200.000 € a 30 años?",
      a: `Al ${rate(A.rate)}, unos ${formatEUR(row.payment)} al mes. Al ${rate(RATE_TABLE[0])} bajaría a ${formatEUR(cheapRate.payment)} y al ${rate(RATE_TABLE[RATE_TABLE.length - 1])} subiría a ${formatEUR(dearRate.payment)}.`,
    },
    {
      q: "¿Cuánto dinero necesito ahorrado para una hipoteca de 200.000 €?",
      a: `Si el banco financia el ${formatPct(A.financedShare)} del precio, la casa costaría ${formatEUR(row.price)}: necesitas ${formatEUR(row.downPayment)} de entrada y unos ${formatEUR(row.upfront)} de impuestos y gastos. En total, unos ${formatEUR(row.cashNeeded)}, y conviene que te quede un colchón para imprevistos.`,
    },
    {
      q: "¿Cuenta el sueldo de los dos si compramos en pareja?",
      a: "Sí. Si la hipoteca es de los dos, se suman los ingresos netos de ambos. Pero también se suman los gastos y las deudas de los dos, así que haz el cálculo con los números de la pareja completos.",
    },
    {
      q: "¿Es mejor una hipoteca a 25 o a 30 años?",
      a: `A 30 años la cuota es más baja (${formatEUR(row.payment)} frente a ${formatEUR(row25.payment)}), pero pagas más intereses: unos ${formatEUR(interest30)} frente a ${formatEUR(interest25)}. El plazo largo da aire cada mes; el corto sale más barato en total.`,
    },
  ];

  return (
    <GuideShell
      guide={guide}
      path={`/guias/${guide.slug}`}
      faqs={faqs}
      cta={{
        href,
        label: "Mirar si me da",
        note: "Abre la calculadora con esta hipoteca puesta y cambia sueldo, gastos y ahorros por los tuyos. Te sale tu nota al momento.",
      }}
      answer={
        <>
          <p className="max-w-[60ch] text-[19px] leading-relaxed text-white md:text-xl">
            Para una hipoteca de 200.000 € a {A.years} años al {rate(A.rate)}, la cuota es de{" "}
            <strong className="font-semibold">{formatEUR(row.payment)} al mes</strong>. Con los gastos de la casa, necesitas
            cobrar al menos <strong className="font-semibold text-brand-300">{formatEUR(row.minIncomeEffort)} netos al mes</strong>{" "}
            y tener unos <strong className="font-semibold">{formatEUR(row.cashNeeded)} ahorrados</strong> para la entrada y los
            gastos.
          </p>
          <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-night-line pt-6 sm:grid-cols-3">
            <Stat tone="night" lead label="Cuota al mes" value={formatEUR(row.payment)} hint={`${A.years} años al ${rate(A.rate)}`} />
            <Stat tone="night" lead label="Sueldo neto mínimo" value={formatEUR(row.minIncomeEffort)} hint={`Para no pasar del ${guideline}`} />
            <Stat tone="night" lead label="Ahorros el día de la firma" value={formatEUR(row.cashNeeded)} hint="Entrada + impuestos y gastos" />
          </dl>
        </>
      }
    >
      <GuideSection id="cuota" title="Primero, la cuota">
        <p>
          Casi todas las hipotecas en España usan el sistema francés: pagas la misma cuota cada mes. Para 200.000 € a{" "}
          {A.years} años con un tipo fijo del {rate(A.rate)} (TIN), la cuota sale en <strong className="text-ink">{formatEUR(row.payment)}</strong>.
          A 25 años, {formatEUR(row25.payment)}.
        </p>
        <p>
          Pero la casa no solo cuesta la cuota. Comunidad, IBI y seguro de hogar suman fácilmente unos {formatEUR(A.running)} al mes.
          El coste real de vivir en ella es de <strong className="text-ink">{formatEUR(row.monthlyTotal)} al mes</strong>.
        </p>
      </GuideSection>

      <GuideSection id="sueldo" title={`Cuánto tienes que cobrar: la regla del ${guideline}`}>
        <p>
          Lo sano es que la vivienda (cuota y gastos) no se lleve más del {guideline} de lo que entra en casa cada mes. Es la
          referencia que usa MeDa y se parece a la que miran los bancos, que suelen poner el límite entre el 30 % y el 35 %.
        </p>
        <p>
          {formatEUR(row.monthlyTotal)} entre {HOUSING.guideline.toLocaleString("es-ES")} da{" "}
          <strong className="text-ink">{formatEUR(row.minIncomeEffort)} netos al mes</strong>. Si compráis en pareja, es la
          suma de los dos sueldos.
        </p>
        <p>
          Con ese sueldo, unos gastos de vida de {formatEUR(profile.monthlyExpenses)} al mes y {formatEUR(profile.savings)}{" "}
          ahorrados, MeDa le pone un <strong className="text-ink">{formatScore(atEffort.score)}</strong>: «
          {VERDICT_COPY[atEffort.verdict].label.toLowerCase()}».
        </p>
      </GuideSection>

      <GuideSection id="ahorros" title="Lo que casi nadie cuenta: lo que tienes que tener ahorrado">
        <p>
          El banco suele financiar como mucho el {formatPct(A.financedShare)} del precio. Para pedir 200.000 €, la casa tendría que
          costar {formatEUR(row.price)}, y el resto lo pones tú: <strong className="text-ink">{formatEUR(row.downPayment)} de entrada</strong>.
        </p>
        <p>
          Además están los impuestos y gastos de la compra (el ITP en vivienda usada o el IVA en nueva, notaría, registro y
          gestoría), que rondan el {formatPct(A.upfrontShare)} del precio: unos {formatEUR(row.upfront)}. En total,{" "}
          <strong className="text-ink">{formatEUR(row.cashNeeded)}</strong> el día de la firma. El porcentaje exacto depende de
          tu comunidad autónoma.
        </p>
        <p>
          Y conviene que después te quede un colchón. MeDa pide por defecto 3 meses de gastos: en el ejemplo, unos{" "}
          {formatEUR(profile.savings - row.cashNeeded)} más.
        </p>
      </GuideSection>

      <GuideSection id="menos" title="¿Y si cobro menos?">
        <p>
          La nota no depende solo del sueldo. Con poco gasto y el colchón completo, al perfil del ejemplo el aprobado le llega
          desde unos {minIncomeYes ? formatEUR(minIncomeYes) : "—"} al mes, pero con la vivienda por encima del {guideline} de
          sus ingresos. Se puede, aunque va justo: cualquier subida de gastos se nota.
        </p>
        <p>Si no te llega, tienes tres palancas, de más a menos eficaz:</p>
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-line-strong">
          <li>Una casa más barata: cada 10.000 € menos de hipoteca son unos {formatEUR(mortgageRow(10_000).payment)} menos al mes.</li>
          <li>Más entrada: baja la hipoteca y, con ella, la cuota y los intereses.</li>
          <li>Más plazo: baja la cuota, pero acabas pagando más intereses.</li>
        </ul>
        <p>
          La calculadora te dice hasta qué precio te da con tus números.{" "}
          <Link href={href} className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
            Pruébala con esta hipoteca
          </Link>
          .
        </p>
      </GuideSection>

      <GuideSection id="tabla" title="De 100.000 a 300.000 €: cuota, sueldo y ahorros">
        <p>
          Mismos supuestos: {rate(A.rate)} de interés, el banco financia el {formatPct(A.financedShare)}, gastos de compra del{" "}
          {formatPct(A.upfrontShare)} y {formatEUR(A.running)} al mes de gastos de la casa.
        </p>
      </GuideSection>
      <DataTable
        caption="Sueldo neto mínimo para que la vivienda no pase del 35 % de tus ingresos"
        head={["Hipoteca", "Cuota a 30 años", "Sueldo (30 años)", "Cuota a 25 años", "Sueldo (25 años)", "Ahorros"]}
        highlight={LOAN_TABLE.indexOf(200_000)}
        rows={LOAN_TABLE.map((loan) => {
          const r30 = mortgageRow(loan, 30);
          const r25 = mortgageRow(loan, 25);
          return [
            <Link key={loan} href={`/cuanto-ganar-para/hipoteca-${loan}`} className="underline underline-offset-4 hover:text-brand-700">
              {formatEUR(loan)}
            </Link>,
            formatEUR(r30.payment), formatEUR(r30.minIncomeEffort), formatEUR(r25.payment), formatEUR(r25.minIncomeEffort), formatEUR(r30.cashNeeded)];
        })}
      />

      <GuideSection id="interes" title="Si el interés cambia">
        <p>
          Medio punto de interés mueve la cuota unos {formatEUR(mortgageRow(200_000, A.years, 3.5).payment - row.payment)} al mes
          en una hipoteca de 200.000 € a {A.years} años. Por eso merece la pena comparar ofertas antes de firmar.
        </p>
      </GuideSection>
      <DataTable
        caption={`Hipoteca de 200.000 € a ${A.years} años`}
        head={["Interés (TIN)", "Cuota al mes", "Sueldo neto mínimo", "Intereses totales"]}
        highlight={RATE_TABLE.indexOf(A.rate as (typeof RATE_TABLE)[number])}
        rows={RATE_TABLE.map((r) => {
          const x = mortgageRow(200_000, A.years, r);
          return [rate(r), formatEUR(x.payment), formatEUR(x.minIncomeEffort), formatEUR(x.payment * A.years * 12 - x.loan)];
        })}
      />
    </GuideShell>
  );
}
