import type { ReactNode } from "react";
import type { AffordabilityResult } from "@/lib/engine";
import { mainReason } from "@/lib/explain/insight";
import { formatEUR, formatMonths } from "@/lib/format";
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
  children,
  className,
}: {
  result: AffordabilityResult;
  id?: string;
  eyebrow?: string;
  /** Acciones bajo el resultado */
  children?: ReactNode;
  className?: string;
}) {
  const rest = result.monthlyTotal - result.monthlyPayment;
  return (
    <Card id={id} className={cn("scroll-mt-24 p-5 sm:p-7", className)} aria-live="polite">
      <p className="text-[13px] font-medium text-muted">{eyebrow}</p>
      <ScoreScale score={result.score} verdict={result.verdict} className="mt-2" />
      <p className="mt-5 text-[15px] leading-relaxed text-ink-2">{mainReason(result)}</p>

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
