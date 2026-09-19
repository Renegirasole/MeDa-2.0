import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_BY_SLUG } from "@/lib/guides";
import { CAR, CAR_GUIDE as G, CAR_PRICES, CAR_TERMS, carRow, RUNNING_EXAMPLE } from "@/lib/guides/car";
import { carSlug } from "@/lib/programmatic";
import { encodeShare } from "@/lib/share";
import { formatEUR, formatPct } from "@/lib/format";
import { DataTable, GuideSection, GuideShell, type Faq } from "@/components/guides/Guide";
import { Stat } from "@/components/ui/Stat";

const guide = GUIDE_BY_SLUG["coste-real-coche"];

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guias/${guide.slug}` },
  openGraph: { type: "article", title: guide.title, description: guide.description, url: `/guias/${guide.slug}` },
};

const rate = `${G.rate.toLocaleString("es-ES")} %`;
const guideline = formatPct(CAR.guideline);

export default function RealCarCostGuide() {
  const car = carRow(16_000);
  const short = carRow(16_000, 36);
  const long = carRow(16_000, 84);
  const href = `/calculadoras/coche#s=${encodeShare({ purchase: { ...CAR.defaults, price: 16_000 } })}`;
  const share = car.payment / car.monthlyTotal;

  const faqs: Faq[] = [
    {
      q: "¿Cuánto cuesta mantener un coche al mes?",
      a: `Sin contar la cuota, unos ${formatEUR(G.running)} al mes en un coche normal: gasolina, seguro, mantenimiento, aparcamiento e impuesto de circulación. Depende mucho de los kilómetros y de tu ciudad.`,
    },
    {
      q: "¿Cuánto cuesta al mes un coche de 16.000 €?",
      a: `Con ${formatEUR(G.downPayment)} de entrada y ${G.months} meses al ${rate}, la cuota es de unos ${formatEUR(car.payment)}. Sumando los gastos, unos ${formatEUR(car.monthlyTotal)} al mes.`,
    },
    {
      q: "¿Cuánto tengo que cobrar para un coche de 16.000 €?",
      a: `Unos ${formatEUR(car.minIncome)} netos al mes, para que todo el coche no se lleve más del ${guideline} de tu sueldo.`,
    },
    {
      q: "¿Es mejor financiar el coche a más años?",
      a: `Baja la cuota, pero pagas más intereses: a 36 meses, unos ${formatEUR(short.interest)}; a 84 meses, unos ${formatEUR(long.interest)}. Y el coche pierde valor más rápido de lo que lo pagas.`,
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
        note: "Abre la calculadora con un coche de 16.000 € y cambia el precio, los gastos al mes y tus números por los tuyos.",
      }}
      answer={
        <>
          <p className="max-w-[60ch] text-[19px] leading-relaxed text-white md:text-xl">
            Un coche de 16.000 € financiado a {G.months} meses tiene una letra de{" "}
            <strong className="font-semibold">{formatEUR(car.payment)}</strong>, pero te cuesta{" "}
            <strong className="font-semibold text-brand-300">{formatEUR(car.monthlyTotal)} al mes</strong> con gasolina, seguro y
            mantenimiento. Para que no pase del {guideline} de tu sueldo, hay que cobrar unos {formatEUR(car.minIncome)} netos.
          </p>
          <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-night-line pt-6 sm:grid-cols-3">
            <Stat tone="night" lead label="La letra" value={formatEUR(car.payment)} hint={`${G.months} meses al ${rate}`} />
            <Stat tone="night" lead label="Lo que cuesta de verdad" value={formatEUR(car.monthlyTotal)} hint="Al mes, con todo" />
            <Stat tone="night" lead label="Sueldo neto necesario" value={formatEUR(car.minIncome)} hint={`Para no pasar del ${guideline}`} />
          </dl>
        </>
      }
    >
      <GuideSection id="letra" title="La letra es solo una parte">
        <p>
          Cuando alguien dice «solo son {formatEUR(car.payment)} al mes», se olvida de todo lo demás. En el ejemplo, la letra es
          el {formatPct(share)} de lo que cuesta el coche cada mes. El resto se va en usarlo:
        </p>
      </GuideSection>
      <DataTable
        caption={`Ejemplo de gastos al mes, sin la cuota (${formatEUR(G.running)} en total)`}
        head={["Gasto", "Al mes", "Cómo sale"]}
        rows={RUNNING_EXAMPLE.map((r) => [r.label, formatEUR(r.value), r.hint])}
      />
      <p className="-mt-8 max-w-[65ch] text-[15px] leading-relaxed text-muted">
        Es un reparto orientativo: un coche que duerme en garaje y hace pocos kilómetros gasta bastante menos; uno que hace 25.000
        km al año y aparca en la calle en el centro, bastante más. En la calculadora puedes poner los tuyos.
      </p>

      <GuideSection id="precios" title="Cuánto cuesta al mes según el precio">
        <p>
          Mismos supuestos: {formatEUR(G.downPayment)} de entrada, {G.months} meses al {rate} y {formatEUR(G.running)} de gastos. El
          sueldo es el que hace falta para que todo el coche no pase del {guideline} de lo que cobras.
        </p>
      </GuideSection>
      <DataTable
        caption="Coste real al mes y sueldo neto necesario"
        head={["Precio", "Letra", "Con todo, al mes", "Sueldo neto", "Intereses"]}
        highlight={CAR_PRICES.indexOf(16_000)}
        rows={CAR_PRICES.map((p) => {
          const r = carRow(p);
          return [formatEUR(p), formatEUR(r.payment), formatEUR(r.monthlyTotal), formatEUR(r.minIncome), formatEUR(r.interest)];
        })}
      />

      <GuideSection id="plazo" title="Más meses, menos letra… y más intereses">
        <p>
          Alargar el préstamo baja la letra, y por eso es lo primero que ofrece el concesionario. Pero cada mes más son más
          intereses, y a partir de cierto punto sigues pagando un coche que ya vale menos de lo que debes.
        </p>
      </GuideSection>
      <DataTable
        caption={`Coche de 16.000 € con ${formatEUR(G.downPayment)} de entrada al ${rate}`}
        head={["Plazo", "Letra", "Con todo, al mes", "Intereses totales"]}
        highlight={CAR_TERMS.indexOf(G.months as (typeof CAR_TERMS)[number])}
        rows={CAR_TERMS.map((m) => {
          const r = carRow(16_000, m);
          return [`${m} meses`, formatEUR(r.payment), formatEUR(r.monthlyTotal), formatEUR(r.interest)];
        })}
      />

      <GuideSection id="sueldo" title="¿Y con mi sueldo, qué coche?">
        <p>
          Lo tienes calculado por sueldos: por ejemplo,{" "}
          <Link href={`/que-puedo-permitirme/${carSlug(1500)}`} className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
            qué coche puedo comprar cobrando 1.500 €
          </Link>{" "}
          o{" "}
          <Link href={`/que-puedo-permitirme/${carSlug(2000)}`} className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
            cobrando 2.000 €
          </Link>
          . Y si ya tienes un coche en mente, la calculadora te dice si te da con tus gastos y tus ahorros, no solo con tu sueldo.
        </p>
      </GuideSection>
    </GuideShell>
  );
}
