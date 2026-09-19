import { WEIGHTS } from "@/lib/engine";
import { FACTOR_COPY } from "@/lib/copy";
import { formatPct } from "@/lib/format";
import { ArrowGlyph, ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Section";

const FACTORS = (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((id) => ({ id, weight: WEIGHTS[id], ...FACTOR_COPY[id] }));

/** La confianza se diseña: la fórmula a la vista, sacada del propio motor. */
export function Transparency() {
  return (
    <section aria-labelledby="transparencia-title" className="py-20 md:py-28">
      <Container>
        <div className="grid gap-12 rounded-[2rem] bg-surface p-6 ring-1 ring-line sm:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:p-14">
          <div>
            <Eyebrow>Sin cajas negras</Eyebrow>
            <h2 id="transparencia-title" className="mt-3 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-ink md:text-[2.5rem]">
              Tu nota sale de tres preguntas. Siempre las mismas.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Fórmulas fijas y públicas. Si usas la IA, solo te lo explica con otras palabras: nunca pone ni cambia una cifra.
            </p>
            <ButtonLink href="/como-calculamos" variant="secondary" className="mt-8">
              Ver cómo calculamos
              <ArrowGlyph />
            </ButtonLink>
          </div>
          <ul className="flex flex-col">
            {FACTORS.map((f) => (
              <li key={f.id} className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-b border-line py-6 first:pt-0 last:border-0 last:pb-0">
                <div>
                  <p className="text-lg font-semibold text-ink">{f.label}</p>
                  <p className="mt-1 text-[15px] text-muted">{f.question}</p>
                </div>
                <p className="num text-[2.25rem] font-semibold tracking-[-0.04em] text-ink">{formatPct(f.weight)}</p>
                <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                  <div className="h-full origin-left rounded-full bg-brand-500" style={{ width: `${f.weight * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
