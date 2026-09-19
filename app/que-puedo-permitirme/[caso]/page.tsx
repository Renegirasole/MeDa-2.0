import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CAR, CAR_ASSUMPTIONS as C, CAR_SALARIES, carCase, carSlug, neighbors, parseCarSlug, PROGRAMMATIC_UPDATED } from "@/lib/programmatic";
import { encodeShare } from "@/lib/share";
import { formatEUR, formatPct } from "@/lib/format";
import { DataTable, GuideSection, GuideShell, type Faq } from "@/components/guides/Guide";
import { Stat } from "@/components/ui/Stat";

type Params = Promise<{ caso: string }>;

export const dynamicParams = false;
export const generateStaticParams = () => CAR_SALARIES.map((v) => ({ caso: carSlug(v) }));

const rate = `${C.rate.toLocaleString("es-ES")} %`;
const titleFor = (salary: number) => `¿Qué coche puedo comprar cobrando ${formatEUR(salary)} al mes?`;
const guideline = formatPct(CAR.guideline);
function describe(salary: number) {
  const c = carCase(salary);
  return `Cobrando ${formatEUR(salary)} netos, un coche de hasta ${formatEUR(c.maxPrice)} con ${formatEUR(C.downPayment)} de entrada a ${C.months} meses. Todo el coche, con seguro y gasolina, no debería pasar de ${formatEUR(c.monthlyBudget)} al mes.`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const salary = parseCarSlug((await params).caso);
  if (!salary) return {};
  const title = titleFor(salary);
  const description = describe(salary);
  const path = `/que-puedo-permitirme/${carSlug(salary)}`;
  return { title, description, alternates: { canonical: path }, openGraph: { type: "article", title, description, url: path } };
}

/** Qué tipo de coche entra en ese precio. Tramos amplios y sin marcas: orientación, no catálogo. */
function segment(price: number) {
  if (price < 6000) return "un coche de segunda mano con años y kilómetros, mejor al contado que financiado";
  if (price < 12000) return "un utilitario de segunda mano reciente";
  if (price < 20000) return "un utilitario nuevo o un compacto de segunda mano";
  if (price < 30000) return "un compacto o un SUV pequeño nuevo";
  return "casi cualquier coche generalista nuevo";
}

export default async function CarSalaryPage({ params }: { params: Params }) {
  const salary = parseCarSlug((await params).caso);
  if (!salary) notFound();
  const c = carCase(salary);
  const c48 = carCase(salary, 48);
  const c84 = carCase(salary, 84);
  const path = `/que-puedo-permitirme/${carSlug(salary)}`;
  const href = `/calculadoras/coche#s=${encodeShare({ purchase: { ...CAR.defaults, price: c.maxPrice } })}`;

  const faqs: Faq[] = [
    {
      q: `¿Qué coche me puedo permitir cobrando ${formatEUR(salary)}?`,
      a: `Uno de hasta unos ${formatEUR(c.maxPrice)} si das ${formatEUR(C.downPayment)} de entrada y financias el resto a ${C.months} meses al ${rate}. Así, cuota, seguro, gasolina y mantenimiento no pasan del ${guideline} de tu sueldo (${formatEUR(c.monthlyBudget)} al mes).`,
    },
    {
      q: `¿Cuánto debería gastar en el coche al mes con ${formatEUR(salary)}?`,
      a: `Como mucho, ${formatEUR(c.monthlyBudget)} al mes en total. Si seguro, gasolina y mantenimiento son unos ${formatEUR(C.running)}, quedan ${formatEUR(c.payment)} para la cuota.`,
    },
    {
      q: "¿Es mejor financiar a más meses para comprar un coche más caro?",
      a: `A ${84} meses llegarías a unos ${formatEUR(c84.maxPrice)}, pero pagarías más intereses y el coche perdería valor más rápido de lo que lo pagas. A ${48} meses, unos ${formatEUR(c48.maxPrice)}.`,
    },
  ];

  return (
    <GuideShell
      guide={{ title: titleFor(salary), description: describe(salary), published: PROGRAMMATIC_UPDATED, updated: PROGRAMMATIC_UPDATED, minutes: 2 }}
      path={path}
      crumbs={[
        { href: "/guias", label: "Guías" },
        { href: "/calculadoras/coche", label: "Coche" },
      ]}
      faqs={faqs}
      cta={{ href, label: "Mirar si me da", note: "Abre la calculadora de coche con este precio puesto y cambia sueldo, gastos y ahorros por los tuyos." }}
      answer={
        <>
          <p className="max-w-[60ch] text-[19px] leading-relaxed text-white md:text-xl">
            Cobrando {formatEUR(salary)} netos, un coche de hasta{" "}
            <strong className="font-semibold text-brand-300">{formatEUR(c.maxPrice)}</strong> con {formatEUR(C.downPayment)} de
            entrada a {C.months} meses. Todo el coche no debería costarte más de{" "}
            <strong className="font-semibold">{formatEUR(c.monthlyBudget)} al mes</strong>.
          </p>
          <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-night-line pt-6 sm:grid-cols-3">
            <Stat tone="night" lead label="Precio máximo" value={formatEUR(c.maxPrice)} hint={`${C.months} meses al ${rate}`} />
            <Stat tone="night" lead label="Todo el coche al mes" value={formatEUR(c.monthlyBudget)} hint={`El ${guideline} de tu sueldo`} />
            <Stat tone="night" lead label="Para la cuota" value={formatEUR(c.payment)} hint={`Tras ${formatEUR(C.running)} de gastos`} />
          </dl>
        </>
      }
    >
      <GuideSection id="calculo" title="Cómo sale el precio">
        <p>
          La referencia de MeDa para el coche es el {guideline} de tu sueldo, contando todo lo que cuesta al mes, no solo la
          letra. Con {formatEUR(salary)}, son {formatEUR(c.monthlyBudget)}.
        </p>
        <p>
          Seguro, gasolina, mantenimiento e impuesto de circulación se llevan fácilmente unos {formatEUR(C.running)} al mes.
          {c.payment > 0 ? (
            <>
              {" "}
              Quedan {formatEUR(c.payment)} para la cuota: a {C.months} meses al {rate} dan para pedir unos{" "}
              {formatEUR(c.maxPrice - C.downPayment)}. Con {formatEUR(C.downPayment)} de entrada, el coche puede costar hasta{" "}
              {formatEUR(c.maxPrice)}.
            </>
          ) : (
            " Con este sueldo casi no queda margen para una cuota: lo prudente es un coche al contado con tus ahorros."
          )}
        </p>
        <p>En ese precio suele entrar {segment(c.maxPrice)}.</p>
      </GuideSection>

      <GuideSection id="cerca" title="Con otros sueldos">
        <p>Mismos supuestos: {formatEUR(C.downPayment)} de entrada, {C.months} meses al {rate} y {formatEUR(C.running)} de gastos al mes.</p>
      </GuideSection>
      <DataTable
        caption="Precio máximo del coche según el sueldo neto"
        head={["Sueldo neto", "Todo el coche al mes", "Cuota", "Precio máximo"]}
        highlight={neighbors(CAR_SALARIES, salary).indexOf(salary)}
        rows={neighbors(CAR_SALARIES, salary).map((v) => {
          const x = carCase(v);
          return [
            v === salary ? (
              formatEUR(v)
            ) : (
              <Link key={v} href={`/que-puedo-permitirme/${carSlug(v)}`} className="underline underline-offset-4 hover:text-brand-700">
                {formatEUR(v)}
              </Link>
            ),
            formatEUR(x.monthlyBudget),
            formatEUR(x.payment),
            formatEUR(x.maxPrice),
          ];
        })}
      />
    </GuideShell>
  );
}
