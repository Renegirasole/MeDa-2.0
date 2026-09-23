import type { ReactNode } from "react";
import { STRESS, type AffordabilityResult } from "@/lib/engine";
import { mainReason } from "@/lib/explain/insight";
import { formatEUR, formatMonths, formatPct, formatScore } from "@/lib/format";
import { DEFAULT_PROFILE } from "@/lib/storage/profile";
import { Card } from "@/components/ui/Card";
import { ScoreScale } from "@/components/ui/ScoreScale";
import { Stat } from "@/components/ui/Stat";
import { IconWarning } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

/**
 * El resultado de un vistazo: veredicto + nota en la escala,
 * el motivo en una frase y las cuatro cifras que importan.
 */
export function ResultCard({
  result,
  id,
  eyebrow = "Tu resultado",
  example = false,
  locked = false,
  children,
  className,
}: {
  result: AffordabilityResult;
  id?: string;
  eyebrow?: string;
  /** Calculado con números de ejemplo: la nota va en gris y se pide poner los tuyos */
  example?: boolean;
  /** Con `example`: no enseña ninguna nota hasta que pones tus números (experimento nota_ejemplo) */
  locked?: boolean;
  /** Acciones bajo el resultado */
  children?: ReactNode;
  className?: string;
}) {
  const rest = result.monthlyTotal - result.monthlyPayment;
  const costStat = (
    <Stat
      lead
      label="Coste real al mes"
      value={formatEUR(result.monthlyTotal)}
      hint={result.monthlyPayment > 0 && rest > 0 ? `${formatEUR(result.monthlyPayment)} cuota + ${formatEUR(rest)} gastos` : undefined}
    />
  );

  if (example && locked) {
    return (
      <Card id={id} className={cn("scroll-mt-24 p-5 sm:p-7", className)} aria-live="polite">
        <p className="text-[13px] font-medium text-muted">{eyebrow}</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="text-2xl font-semibold tracking-[-0.02em] text-muted md:text-[1.75rem]">Tu nota</p>
          <p className="num flex items-baseline gap-1 leading-none text-line-strong">
            <span className="text-[3.5rem] font-semibold tracking-[-0.05em] md:text-[4rem]">–</span>
            <span className="text-lg text-muted">/10</span>
          </p>
        </div>
        <div aria-hidden="true" className="mt-5 flex h-2.5 gap-[3px] px-2 py-1">
          <span className="h-full grow-[5] rounded-l-full bg-subtle" />
          <span className="h-full grow-[2] bg-subtle" />
          <span className="h-full grow-[3] rounded-r-full bg-subtle" />
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-ink-2">
          <a href="#paso-1" className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
            Pon tus ingresos, gastos y ahorros
          </a>{" "}
          en el paso 1 y te decimos si te da, con tu nota de 0 a 10.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-line pt-6">
          {costStat}
          <Stat label="Sale de tus ahorros" value={formatEUR(result.cashOutlay)} />
        </dl>
        {children && <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5 sm:flex-row sm:flex-wrap">{children}</div>}
      </Card>
    );
  }

  return (
    <Card id={id} className={cn("scroll-mt-24 p-5 sm:p-7", className)} aria-live="polite">
      {example ? (
        <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-muted">
          <span className="rounded-full bg-caution-50 px-2 py-0.5 text-caution-700">Ejemplo</span>
          Con números de ejemplo
        </p>
      ) : (
        <p className="text-[13px] font-medium text-muted">{eyebrow}</p>
      )}
      <ScoreScale score={result.score} verdict={result.verdict} muted={example} className="mt-2" />
      {/* Un «sí» con el esfuerzo por encima de lo recomendable necesita el matiz a la vista */}
      {!example && result.verdict === "yes" && result.flags.includes("over_guideline") && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-caution-50 px-3 py-2.5 text-[14px] leading-snug text-caution-700">
          <IconWarning size={18} className="mt-px shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Te da, pero justo en esfuerzo:</strong> se lleva el {formatPct(result.effortRatio)} de tu
            sueldo y lo recomendable es como mucho el {formatPct(result.guideline)}.
          </span>
        </p>
      )}
      {/* Lo que aguanta hoy pero no aguanta un mal año también se avisa a la vista */}
      {!example && result.flags.includes("stress_fragile") && result.appliedCap?.flag !== "stress_fragile" && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-caution-50 px-3 py-2.5 text-[14px] leading-snug text-caution-700">
          <IconWarning size={18} className="mt-px shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Solo te sale bien si todo va bien:</strong> si tus ingresos bajaran un{" "}
            {formatPct(STRESS.incomeDrop)}, tu nota caería a {formatScore(result.stressScore)}.
          </span>
        </p>
      )}
      <p className="mt-5 text-[15px] leading-relaxed text-ink-2">
        {example ? (
          <>
            <a href="#paso-1" className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
              Pon tus ingresos, gastos y ahorros
            </a>{" "}
            en el paso 1 para ver tu nota real. Ahora mismo es la de alguien que gana {formatEUR(DEFAULT_PROFILE.monthlyIncome)} al mes.
          </>
        ) : (
          mainReason(result)
        )}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-line pt-6">
        {costStat}
        <Stat
          lead
          label={result.marginAfter >= 0 ? "Te queda libre al mes" : "Te falta al mes"}
          value={<span className={result.marginAfter < 0 ? "text-alert-700" : undefined}>{formatEUR(Math.abs(result.marginAfter))}</span>}
        />
        <Stat label="Sale de tus ahorros" value={formatEUR(result.cashOutlay)} />
        <Stat label="Colchón después" value={formatMonths(result.cushionMonths)} />
      </dl>

      {children && <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5 sm:flex-row sm:flex-wrap">{children}</div>}
    </Card>
  );
}
