import Link from "next/link";
import { STRESS, type AffordabilityResult } from "@/lib/engine";
import { FACTOR_COPY, FLAG_COPY } from "@/lib/copy";
import { factorReference, factorValue } from "@/lib/explain/insight";
import { formatPct, formatScore } from "@/lib/format";
import { Disclosure } from "@/components/ui/Disclosure";
import { toneForScore } from "@/components/ui/ScoreScale";
import { cn } from "@/components/ui/cn";

/** Qué ha influido: las tres preguntas, cada una con su subnota visual. */
export function FactorList({ result }: { result: AffordabilityResult }) {
  return (
    <div>
      <ul className="flex flex-col gap-6">
        {result.factors.map((f) => {
          const tone = toneForScore(f.score);
          return (
            <li key={f.id}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium text-ink">{FACTOR_COPY[f.id].label}</p>
                <p className="num text-[15px] font-semibold text-ink">
                  {formatScore(f.score)}
                  <span className="font-normal text-muted">/10</span>
                </p>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                <div
                  className={cn("h-full w-full origin-left rounded-full transition-[transform,background-color] duration-300 ease-(--ease-out)", tone.fill)}
                  style={{ transform: `scaleX(${Math.max(0.02, f.score / 10)})` }}
                />
              </div>
              <p className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-0.5 text-[13px] text-muted">
                <span>
                  <span className="text-ink-2">{factorValue(f)}</span> · {factorReference(f)}
                </span>
                <span>Pesa el {formatPct(f.weight)}</span>
              </p>
            </li>
          );
        })}
      </ul>

      <Disclosure summary="Ver el cálculo exacto" className="mt-6 border-t border-line pt-3">
        <div className="text-[14px] leading-relaxed text-ink-2">
          <p>
            Nota ={" "}
            {result.factors.map((f, i) => (
              <span key={f.id} className="num">
                {i > 0 && " × "}
                {formatScore(f.score)}
                <sup>{formatPct(f.weight)}</sup>
              </span>
            ))}{" "}
            = <strong className="num text-ink">{formatScore(result.rawScore)}</strong>
          </p>
          <p className="mt-2">
            Los tres factores se multiplican, no se suman: así un factor bajo no se compensa con otros altos. Tener
            colchón de sobra no hace pequeña una cuota grande.
          </p>
          <p className="mt-2">
            Prueba de estrés: si tus ingresos bajaran un {formatPct(STRESS.incomeDrop)}
            {result.monthlyPayment > 0 ? " (o subiera el interés de un préstamo largo)" : ""}, la nota sería{" "}
            <span className="num text-ink">{formatScore(result.stressScore)}</span>.
          </p>
          {result.appliedCap && (
            <p className="mt-2">
              Tope aplicado de <span className="num">{formatScore(result.appliedCap.max)}</span>:{" "}
              {FLAG_COPY[result.appliedCap.flag].toLowerCase()}
            </p>
          )}
          <Link href="/como-calculamos" className="mt-3 inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-4 hover:text-brand-700">
            Todas las reglas, públicas
          </Link>
        </div>
      </Disclosure>
    </div>
  );
}
