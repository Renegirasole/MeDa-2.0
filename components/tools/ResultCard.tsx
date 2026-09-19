import type { ReactNode } from "react";
import type { AffordabilityResult } from "@/lib/engine";
import { mainReason } from "@/lib/explain/insight";
import { formatEUR, formatMonths } from "@/lib/format";
import { DEFAULT_PROFILE } from "@/lib/storage/profile";
import { Card } from "@/components/ui/Card";
import { ScoreScale } from "@/components/ui/ScoreScale";
import { Stat } from "@/components/ui/Stat";
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
  children,
  className,
}: {
  result: AffordabilityResult;
  id?: string;
  eyebrow?: string;
  /** Calculado con números de ejemplo: la nota va en gris y se pide poner los tuyos */
  example?: boolean;
  /** Acciones bajo el resultado */
  children?: ReactNode;
  className?: string;
}) {
  const rest = result.monthlyTotal - result.monthlyPayment;
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
        <Stat
          lead
          label="Coste real al mes"
          value={formatEUR(result.monthlyTotal)}
          hint={result.monthlyPayment > 0 && rest > 0 ? `${formatEUR(result.monthlyPayment)} cuota + ${formatEUR(rest)} gastos` : undefined}
        />
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
