import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_BY_SLUG } from "@/lib/guides";
import { MORTGAGE_ASSUMPTIONS as A } from "@/lib/guides/mortgage";
import { CAR_ASSUMPTIONS as C, RENT_ASSUMPTIONS } from "@/lib/programmatic";
import { REPORT_PROFILES, REPORT_SOURCE, reportRow, SAVING_RATE } from "@/lib/report";
import { formatEUR, formatPct } from "@/lib/format";
import { DataTable, GuideSection, GuideShell, type Faq } from "@/components/guides/Guide";
import { Stat } from "@/components/ui/Stat";

const guide = GUIDE_BY_SLUG["que-le-da-a-un-joven-2026"];

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guias/${guide.slug}` },
  openGraph: { type: "article", title: guide.title, description: guide.description, url: `/guias/${guide.slug}` },
};

const years = (v: number) => `${v.toLocaleString("es-ES", { maximumFractionDigits: 1 })} años`;
const eur2 = (v: number) => `${v.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: "always" })} €`;

export default function YoungReport() {
  const [teen, young] = REPORT_PROFILES;
  const t = reportRow(teen.net);
  const y = reportRow(young.net);

  const faqs: Faq[] = [
    {
      q: "¿Cuánto cobra de media un joven en España?",
      a: `Según el INE (EPA, año 2024), el salario bruto mensual medio es de ${eur2(young.gross)} entre los 25 y los 34 años y de ${eur2(teen.gross)} entre los 16 y los 24. En neto, según la retención de cada uno, rondan los ${formatEUR(young.net)} y los ${formatEUR(teen.net)}.`,
    },
    {
      q: "¿Cuánto alquiler puede pagar un joven con el sueldo medio?",
      a: `Con unos ${formatEUR(young.net)} netos, hasta unos ${formatEUR(y.rent.maxRent)} al mes para que alquiler y suministros no pasen del 35 % del sueldo. Con ${formatEUR(teen.net)}, unos ${formatEUR(t.rent.maxRent)}.`,
    },
    {
      q: "¿Cuánto tarda un joven en ahorrar la entrada de una casa?",
      a: `Ahorrando el ${formatPct(SAVING_RATE)} del sueldo (${formatEUR(y.saving)} al mes con ${formatEUR(young.net)} netos), unos ${years(y.yearsToBuy)} para reunir los ${formatEUR(y.house.cashNeeded)} de entrada y gastos de una casa de ${formatEUR(y.house.price)}.`,
    },
  ];

  return (
    <GuideShell
      guide={guide}
      path={`/guias/${guide.slug}`}
      faqs={faqs}
      cta={{
        href: "/mi-situacion",
        label: "Poner mis números",
        note: "El informe usa sueldos medios. Con tus ingresos, gastos y ahorros, MeDa te dice qué te da a ti.",
      }}
      answer={
        <>
          <p className="max-w-[60ch] text-[19px] leading-relaxed text-white md:text-xl">
            Con el sueldo medio de 25 a 34 años (unos {formatEUR(young.net)} netos), a un joven le da para un alquiler de hasta{" "}
            <strong className="font-semibold text-brand-300">{formatEUR(y.rent.maxRent)}</strong>, un coche de{" "}
            {formatEUR(y.car.maxPrice)} y una casa de {formatEUR(y.house.price)}… después de{" "}
            <strong className="font-semibold">{years(y.yearsToBuy)}</strong> ahorrando la entrada.
          </p>
          <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-night-line pt-6 sm:grid-cols-3">
            <Stat tone="night" lead label="Alquiler máximo" value={formatEUR(y.rent.maxRent)} hint="Con suministros aparte" />
            <Stat tone="night" lead label="Casa que le da" value={formatEUR(y.house.price)} hint={`Hipoteca de ${formatEUR(y.loan)}`} />
            <Stat tone="night" lead label="Para ahorrar la entrada" value={years(y.yearsToBuy)} hint={`Ahorrando el ${formatPct(SAVING_RATE)} del sueldo`} />
          </dl>
        </>
      }
    >
      <GuideSection id="punto-de-partida" title="El punto de partida: lo que cobra un joven">
        <p>
          Según el INE, en 2024 el salario bruto mensual medio fue de <strong className="text-ink">{eur2(young.gross)}</strong> entre los 25
          y los 34 años, y de <strong className="text-ink">{eur2(teen.gross)}</strong> entre los 16 y los 24. Quitando la cotización a la
          Seguridad Social y una retención de IRPF habitual, quedan en torno a {formatEUR(young.net)} y {formatEUR(teen.net)} netos
          al mes. Son redondeos: tu neto exacto está en tu nómina.
        </p>
        <p>
          A esos sueldos les aplicamos las mismas reglas que a cualquier cálculo de MeDa, las que puedes leer en{" "}
          <Link href="/como-calculamos" className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
            cómo calculamos
          </Link>
          .
        </p>
      </GuideSection>

      <GuideSection id="resultados" title="Lo que le da a cada uno">
        <p>
          Vivienda: que alquiler o hipoteca y gastos de la casa no pasen del 35 % del sueldo. Coche: que todo el coche no pase del
          20 %. Ahorro: el {formatPct(SAVING_RATE)} de lo que cobra.
        </p>
      </GuideSection>
      <DataTable
        caption="Qué le da a un joven con el sueldo medio de su edad"
        head={["", teen.label, young.label]}
        rows={[
          ["Sueldo neto aproximado", formatEUR(teen.net), formatEUR(young.net)],
          ["Alquiler máximo (35 %)", formatEUR(t.rent.maxRent), formatEUR(y.rent.maxRent)],
          ["Alquiler holgado (30 %)", formatEUR(t.rent.strictRent), formatEUR(y.rent.strictRent)],
          ["Coche (con entrada y a 5 años)", formatEUR(t.car.maxPrice), formatEUR(y.car.maxPrice)],
          ["Hipoteca máxima", formatEUR(t.loan), formatEUR(y.loan)],
          ["Casa que le da", formatEUR(t.house.price), formatEUR(y.house.price)],
          ["Entrada y gastos de esa casa", formatEUR(t.house.cashNeeded), formatEUR(y.house.cashNeeded)],
          [`Ahorrando el ${formatPct(SAVING_RATE)} al mes`, formatEUR(t.saving), formatEUR(y.saving)],
          ["Años para reunir la entrada", years(t.yearsToBuy), years(y.yearsToBuy)],
        ]}
      />

      <GuideSection id="lectura" title="Lo que dicen los números">
        <p>
          <strong className="text-ink">El problema no es la cuota, es la entrada.</strong> Con {formatEUR(young.net)} netos, la cuota de
          una hipoteca de {formatEUR(y.loan)} cabe en el 35 % del sueldo. Lo que no cabe es reunir {formatEUR(y.house.cashNeeded)} de
          entrada y gastos: a {formatEUR(y.saving)} al mes son {years(y.yearsToBuy)}.
        </p>
        <p>
          <strong className="text-ink">El alquiler sano tiene techo.</strong> {formatEUR(y.rent.maxRent)} al mes con suministros aparte.
          Compáralo con lo que cuesta un piso entero en tu ciudad: si no llega, compartir piso o vivir en pareja cambia la cuenta, porque
          dos sueldos medios dan para un alquiler de hasta {formatEUR(reportRow(young.net * 2).rent.maxRent)}.
        </p>
        <p>
          <strong className="text-ink">El coche compite con la casa.</strong> Un coche de {formatEUR(y.car.maxPrice)} a{" "}
          {C.months / 12} años le da, pero cada euro de letra es un euro menos para la entrada.
        </p>
      </GuideSection>

      <GuideSection id="metodo" title="Método y fuentes">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-line-strong">
          <li>
            Sueldos brutos:{" "}
            <a href={REPORT_SOURCE.url} className="underline underline-offset-4 hover:text-brand-700" target="_blank" rel="noopener noreferrer">
              {REPORT_SOURCE.name}
            </a>
            , salario medio bruto mensual por grupo de edad.
          </li>
          <li>Neto: aproximación redonda del bruto; cambia con la comunidad, el contrato y la situación personal.</li>
          <li>
            Hipoteca a {A.years} años al {A.rate.toLocaleString("es-ES")} % con el {formatPct(A.financedShare)} financiado y un{" "}
            {formatPct(A.upfrontShare)} de impuestos y gastos; {formatEUR(A.running)} al mes de gastos de la casa.
          </li>
          <li>
            Coche con {formatEUR(C.downPayment)} de entrada a {C.months} meses al {C.rate.toLocaleString("es-ES")} % y {formatEUR(C.running)} al mes de
            gastos. Alquiler con unos {formatEUR(RENT_ASSUMPTIONS.utilities)} de suministros.
          </li>
          <li>Se puede citar libremente enlazando a esta página.</li>
        </ul>
      </GuideSection>
    </GuideShell>
  );
}
