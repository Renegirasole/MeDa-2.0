import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { neighbors, parseRentSlug, PROGRAMMATIC_UPDATED, RENT, RENT_ASSUMPTIONS as R, RENT_SALARIES, rentCase, rentSlug } from "@/lib/programmatic";
import { encodeShare } from "@/lib/share";
import { formatEUR, formatPct } from "@/lib/format";
import { DataTable, GuideSection, GuideShell, type Faq } from "@/components/guides/Guide";
import { Stat } from "@/components/ui/Stat";

type Params = Promise<{ caso: string }>;

export const dynamicParams = false;
export const generateStaticParams = () => RENT_SALARIES.map((v) => ({ caso: rentSlug(v) }));

const titleFor = (salary: number) => `¿Cuánto alquiler puedo pagar cobrando ${formatEUR(salary)}?`;
const guideline = formatPct(RENT.guideline);
const strict = formatPct(R.strictRule);
function describe(salary: number) {
  const r = rentCase(salary);
  return `Con ${formatEUR(salary)} netos al mes, un alquiler de hasta ${formatEUR(r.maxRent)} (${formatEUR(r.strictRent)} con la regla del 30 %), con los suministros aparte. Y unos ${formatEUR(r.moveIn)} para entrar.`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const salary = parseRentSlug((await params).caso);
  if (!salary) return {};
  const title = titleFor(salary);
  const description = describe(salary);
  const path = `/alquiler-maximo/${rentSlug(salary)}`;
  return { title, description, alternates: { canonical: path }, openGraph: { type: "article", title, description, url: path } };
}

export default async function RentSalaryPage({ params }: { params: Params }) {
  const salary = parseRentSlug((await params).caso);
  if (!salary) notFound();
  const r = rentCase(salary);
  const path = `/alquiler-maximo/${rentSlug(salary)}`;
  const href = `/calculadoras/${RENT.slug}#s=${encodeShare({ purchase: { ...RENT.defaults, monthlyFee: r.maxRent, upfrontCosts: r.maxRent * 2 } })}`;
  const perPerson = rentCase(salary * 2).maxRent;

  const faqs: Faq[] = [
    {
      q: `¿Cuánto debería pagar de alquiler si cobro ${formatEUR(salary)}?`,
      a: `Como mucho unos ${formatEUR(r.maxRent)} al mes, para que alquiler y suministros (unos ${formatEUR(R.utilities)}) no pasen del ${guideline} de tu sueldo. Si prefieres ir con más margen, con la regla del ${strict}, ${formatEUR(r.strictRent)}.`,
    },
    {
      q: `¿Cuánto dinero necesito para entrar a un piso de ${formatEUR(r.maxRent)}?`,
      a: `Cuenta con unos ${formatEUR(r.moveIn)}: la fianza (un mes, obligatoria por ley) y el primer mes. Algunos caseros piden además una garantía de hasta dos meses más.`,
    },
    {
      q: "¿Y si lo pagamos entre dos?",
      a: `Si los dos cobráis ${formatEUR(salary)}, juntos podríais pagar hasta unos ${formatEUR(perPerson)} al mes con el mismo criterio. Cuenta que los suministros no se duplican.`,
    },
  ];

  return (
    <GuideShell
      guide={{ title: titleFor(salary), description: describe(salary), published: PROGRAMMATIC_UPDATED, updated: PROGRAMMATIC_UPDATED, minutes: 2 }}
      path={path}
      crumbs={[
        { href: "/guias", label: "Guías" },
        { href: "/calculadoras/alquilar-vivienda", label: "Alquiler" },
      ]}
      faqs={faqs}
      cta={{ href, label: "Mirar si me da", note: "Abre la calculadora de alquiler con esta renta puesta y cambia sueldo, gastos y ahorros por los tuyos." }}
      answer={
        <>
          <p className="max-w-[60ch] text-[19px] leading-relaxed text-white md:text-xl">
            Cobrando {formatEUR(salary)} netos, un alquiler de hasta{" "}
            <strong className="font-semibold text-brand-300">{formatEUR(r.maxRent)} al mes</strong>, con los suministros aparte. Si
            quieres ir holgado (regla del {strict}), <strong className="font-semibold">{formatEUR(r.strictRent)}</strong>.
          </p>
          <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-night-line pt-6 sm:grid-cols-3">
            <Stat tone="night" lead label="Alquiler máximo" value={formatEUR(r.maxRent)} hint={`Con suministros, el ${guideline}`} />
            <Stat tone="night" lead label="Con la regla del 30 %" value={formatEUR(r.strictRent)} hint="Más margen cada mes" />
            <Stat tone="night" lead label="Para entrar" value={formatEUR(r.moveIn)} hint="Fianza + primer mes" />
          </dl>
        </>
      }
    >
      <GuideSection id="calculo" title="Cómo sale la cifra">
        <p>
          Lo sano es que la vivienda (alquiler y suministros) no se lleve más del {guideline} de lo que cobras. Con{" "}
          {formatEUR(salary)} son {formatEUR(salary * RENT.guideline)}; quitando unos {formatEUR(R.utilities)} de luz, agua, gas
          e internet, quedan {formatEUR(r.maxRent)} para el alquiler.
        </p>
        <p>
          La regla del {strict} es más prudente: te deja {formatEUR(r.maxRent - r.strictRent)} más libres cada mes para ahorrar o
          para imprevistos. Si vives en una ciudad cara y no llegas, compartir piso o ir un poco más lejos suele ser mejor que
          pasar del {guideline}.
        </p>
        <p>
          Aparte, el día de la firma: la fianza (un mes) y el primer mes, unos {formatEUR(r.moveIn)}. Que no salgan de tu colchón
          para emergencias.
        </p>
      </GuideSection>

      <GuideSection id="cerca" title="Con otros sueldos">
        <p>Mismo criterio: alquiler y suministros por debajo del {guideline} del sueldo neto.</p>
      </GuideSection>
      <DataTable
        caption="Alquiler máximo según el sueldo neto"
        head={["Sueldo neto", `Máximo (${guideline})`, `Holgado (${strict})`, "Para entrar"]}
        highlight={neighbors(RENT_SALARIES, salary).indexOf(salary)}
        rows={neighbors(RENT_SALARIES, salary).map((v) => {
          const x = rentCase(v);
          return [
            v === salary ? (
              formatEUR(v)
            ) : (
              <Link key={v} href={`/alquiler-maximo/${rentSlug(v)}`} className="underline underline-offset-4 hover:text-brand-700">
                {formatEUR(v)}
              </Link>
            ),
            formatEUR(x.maxRent),
            formatEUR(x.strictRent),
            formatEUR(x.moveIn),
          ];
        })}
      />
    </GuideShell>
  );
}
