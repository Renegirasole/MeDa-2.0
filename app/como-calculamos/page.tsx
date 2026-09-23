import type { Metadata } from "next";
import { CAPS, CUSHION_CURVE, EFFORT_CAPS, EFFORT_CURVE, MARGIN_CURVE, STRESS, VERDICT_THRESHOLDS, WEIGHTS } from "@/lib/engine";
import { CATEGORIES } from "@/lib/data/categories";
import { FLAG_COPY, VERDICT_COPY } from "@/lib/copy";
import { ZONE_SOURCES } from "@/lib/zonas/datos";
import { RADIUS_M } from "@/lib/zonas/portales";
import { CONDITION_FACTOR, EXTRA_AREA, floorFactor } from "@/lib/zonas/caracteristicas";
import { formatPct, formatScore } from "@/lib/format";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Cómo calculamos tu nota",
  description:
    "Las reglas exactas con las que MeDa calcula si te da: esfuerzo mensual, margen, colchón de ahorro, topes y referencias por tipo de gasto. Sin cajas negras.",
  alternates: { canonical: "/como-calculamos" },
};

const curveText = (points: ReadonlyArray<readonly [number, number]>, fmt: (x: number) => string) =>
  points.map(([x, y]) => `${fmt(x)} → ${formatScore(y)}`).join(", ");

export default function MethodPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transparencia"
        title="Cómo calculamos tu nota"
        intro="Todo lo que ves en MeDa sale de fórmulas fijas y públicas. La IA solo te lo explica con otras palabras: nunca pone ni cambia una cifra."
      />
      <Container className="pb-24">
        <div className="flex max-w-3xl flex-col gap-12">
        <section className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Las tres preguntas</h2>
          <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-ink-2">
            <p>
              <strong className="text-ink">Esfuerzo mensual ({formatPct(WEIGHTS.effort)} de la nota).</strong> Coste real al mes
              (cuota + gastos asociados) dividido entre tus ingresos, comparado con lo recomendable para ese tipo de gasto.
              Relación con la referencia y nota: {curveText(EFFORT_CURVE, (x) => `${formatPct(x)} de la referencia`)}.
            </p>
            <p>
              <strong className="text-ink">Margen que te queda ({formatPct(WEIGHTS.margin)}).</strong> Lo que te sobra al mes
              después de la compra, como parte de tus ingresos: {curveText(MARGIN_CURVE, formatPct)}. Si es negativo, 0.
            </p>
            <p>
              <strong className="text-ink">Colchón de ahorro ({formatPct(WEIGHTS.cushion)}).</strong> Meses de gastos que cubren
              tus ahorros después de pagar la entrada, los gastos iniciales y lo que ya sabes que vas a gastar este año,
              comparado con el colchón que quieres tener: {curveText(CUSHION_CURVE, (x) => `${formatPct(x)} del objetivo`)}.
            </p>
            <p>Entre esos puntos, la nota sube o baja en línea recta.</p>
          </div>
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Cómo se juntan las tres</h2>
          <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-ink-2">
            <p>
              No hacemos la media. Elevamos cada factor a su peso y los multiplicamos: nota = esfuerzo
              <sup>{formatPct(WEIGHTS.effort)}</sup> × margen<sup>{formatPct(WEIGHTS.margin)}</sup> × colchón
              <sup>{formatPct(WEIGHTS.cushion)}</sup>.
            </p>
            <p>
              <strong className="text-ink">Por qué multiplicamos.</strong> Con una media, un factor malo se tapa con dos
              buenos, y salían aprobados absurdos: una cuota enorme perdonada por tener muchos ahorros. Pero el ahorro es
              dinero que se gasta una vez y la cuota vuelve cada mes. Multiplicando, un factor bajo arrastra la nota
              entera, que es justo lo que pasa en la vida real.
            </p>
          </div>
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Topes</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
Aunque el resto salga bien, hay situaciones en las que no te diremos que te da:
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-[15px] text-ink-2">
            {(Object.keys(CAPS) as Array<keyof typeof CAPS>).map((k) => (
              <li key={k} className="flex justify-between gap-4 border-b border-line/70 pb-2">
                <span>{FLAG_COPY[k]}</span>
                <span className="shrink-0 tabular-nums text-ink">máx. {formatScore(CAPS[k])}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Pasarse de la referencia</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            La referencia de cada categoría es un techo, no una meta. Cuanto más la pasas, más baja el tope de tu nota:
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-[15px] text-ink-2">
            {EFFORT_CAPS.map(([times, max]) => (
              <li key={times} className="flex justify-between gap-4 border-b border-line/70 pb-2">
                <span>Más de {formatPct(times)} de la referencia de tu categoría</span>
                <span className="shrink-0 tabular-nums text-ink">máx. {formatScore(max)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">La prueba de estrés</h2>
          <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-ink-2">
            <p>
              Calculamos tu nota dos veces más, cada una con algo yendo mal: que tus ingresos bajen un{" "}
              {formatPct(STRESS.incomeDrop)}, y que el interés suba {formatScore(STRESS.rateRise)} puntos si tu préstamo
              dura más de {STRESS.longTermMonths / 12} años, que es donde el tipo suele ser variable. Nos quedamos con la
              peor de las dos, no con las dos a la vez: la idea es comprobar que aguantas un golpe, no una tormenta.
            </p>
            <p>
              Tu nota final no puede separarse de esa nota estresada más de {formatScore(STRESS.maxGap)} puntos. Si una
              compra solo te sale bien mientras nada cambie, no te vamos a decir que te da.
            </p>
          </div>
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Veredicto</h2>
          <ul className="mt-4 flex flex-col gap-2 text-[15px] text-ink-2">
            {VERDICT_THRESHOLDS.map(([t, v]) => (
              <li key={v}>
                Desde {formatScore(t)}: <strong className="text-ink">{VERDICT_COPY[v].label}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Referencias por tipo de gasto</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            Parte de tus ingresos que consideramos razonable para cada gasto, contando cuota y gastos asociados. Si combinas
            varios, se suman, con un máximo del 50 %.
          </p>
          <ul className="mt-4 grid gap-2 text-[15px] text-ink-2 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug} className="flex justify-between gap-4 border-b border-line/70 pb-2">
                <span>{c.name}</span>
                <span className="tabular-nums text-ink">{formatPct(c.guideline)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">El Tasador: de dónde salen los precios de tu zona</h2>
          <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-ink-2">
            <p>
              Cuando escribes la dirección, la convertimos en coordenadas con{" "}
              <a href="https://www.cartociudad.es/" rel="noopener noreferrer" target="_blank" className="underline underline-offset-4 hover:text-brand-700">
                CartoCiudad
              </a>{" "}
              (Instituto Geográfico Nacional) y buscamos la sección censal —el barrio estadístico— en la que cae. Las viviendas
              del edificio, sus metros construidos y su año salen de la{" "}
              <a href="https://www.sedecatastro.gob.es/" rel="noopener noreferrer" target="_blank" className="underline underline-offset-4 hover:text-brand-700">
                Sede Electrónica del Catastro
              </a>
              . No guardamos ni la dirección ni la vivienda que eliges.
            </p>
            <p>
              <strong className="text-ink">Alquiler.</strong> €/m² al mes de tu barrio según el Sistema Estatal de Referencia del
              Precio del Alquiler (Ministerio de Vivienda, {ZONE_SOURCES.rentYear}), que sale de los alquileres declarados a
              Hacienda. «Rápido» es el percentil 25, «mercado» la mediana y «sin prisa» el 75. Son contratos en vigor, también
              antiguos: lo que sale hoy al mercado suele estar por encima.
            </p>
            <p>
              <strong className="text-ink">Venta.</strong> Valor tasado medio de vivienda libre de tu municipio (
              {ZONE_SOURCES.salePeriod}, Ministerio de Transportes), con el valor de obra nueva si el piso tiene cinco años o
              menos. Ese precio se ajusta a tu barrio multiplicándolo por lo que se separa el alquiler del barrio del alquiler
              del municipio (entre 0,6 y 1,8 veces): donde alquilar cuesta más, comprar también. El abanico entre «rápido» y «sin
              prisa» es la raíz cuadrada del que tienen los alquileres del barrio, porque los pisos en venta de una misma zona se
              parecen más entre sí.
            </p>
            <p>
              <strong className="text-ink">Anuncios de hoy.</strong> Cuando hay suficientes pisos publicados cerca de tu
              dirección, mandan ellos: cogemos los que hay a menos de {RADIUS_M} metros a través de la API oficial de idealista y
              nos quedamos con sus €/m² en cuartiles, quitando los anuncios imposibles. Es el precio que se pide, no el de cierre;
              en la venta se suele cerrar algo por debajo. No rastreamos ninguna web: solo usamos datos que los portales publican
              para esto.
            </p>
            <p>
              <strong className="text-ink">Tu piso, no el de al lado.</strong> Sobre el precio de la zona se aplican los
              coeficientes que de verdad separan dos pisos del mismo portal, en la línea de las normas técnicas de valoración
              catastral (RD 1020/1993): estado ({formatPct(CONDITION_FACTOR.reformar - 1)} si está para reformar,{" "}
              {formatPct(CONDITION_FACTOR.reformado - 1)} si está reformado), planta y ascensor (un cuarto sin ascensor pierde un{" "}
              {formatPct(1 - floorFactor(4, false))}), exterior o interior, y los extras: la terraza cuenta al{" "}
              {formatPct(EXTRA_AREA.terraceShare)} del precio del metro, el garaje como {EXTRA_AREA.garage} m² y el trastero como{" "}
              {EXTRA_AREA.storage} m². En la pantalla se ve cada ajuste por separado.
            </p>
            <p>
              El orden es siempre el mismo: los anuncios que metas tú, los anuncios publicados cerca y, si no hay nada de lo
              anterior, el dato oficial. El valor tasado es el que usan los bancos para dar hipotecas, no el que se pide en los
              portales, que suele ser mayor.
            </p>
          </div>
        </section>

        <section className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Los 3 planes y la cuota</h2>
          <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-ink-2">
            <p>
              Barato es la misma compra a mitad de precio; calidad-precio, un 25 % más barata; top, lo que pides. A cada uno
              le aplicamos exactamente las mismas reglas.
            </p>
            <p>
              La cuota se calcula con el sistema francés (cuota fija), el que usan casi todos los préstamos: cuota = capital ×
              i / (1 − (1 + i)^−n), con i = interés anual / 12 y n = meses.
            </p>
            <p>Son estimaciones orientativas, no asesoramiento financiero. Antes de firmar, revisa la TAE y las condiciones de la oferta.</p>
          </div>
        </section>
        </div>
      </Container>
    </>
  );
}
