import type { Metadata } from "next";
import { CAPS, CUSHION_CURVE, EFFORT_CURVE, MARGIN_CURVE, VERDICT_THRESHOLDS, WEIGHTS } from "@/lib/engine";
import { CATEGORIES } from "@/lib/data/categories";
import { FLAG_COPY, VERDICT_COPY } from "@/lib/copy";
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
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Topes</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            Aunque la media salga alta, hay situaciones en las que no te diremos que te da:
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
