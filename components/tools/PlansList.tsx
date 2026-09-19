import { PASSING_SCORE, type Plan, type PlanTier } from "@/lib/engine";
import { TIER_COPY } from "@/lib/copy";
import { formatEUR } from "@/lib/format";
import { VerdictPill } from "@/components/ui/ScoreScale";
import type { CSSProperties } from "react";
import { cn } from "@/components/ui/cn";

/** El plan más completo que aprueba. null = ninguno te da. */
export function recommendedTier(plans: Plan[]): PlanTier | null {
  const passing = plans.filter((p) => p.result.score >= PASSING_SCORE);
  return passing.length > 0 ? passing[passing.length - 1].tier : null;
}

/**
 * Tres versiones de la misma compra, con las mismas reglas. Filas en móvil, columnas en escritorio.
 * El recomendado ocupa más y se eleva: guía la elección sin esconder los otros dos.
 */
export function PlansList({ plans, recurring }: { plans: Plan[]; recurring: boolean }) {
  const recommended = recommendedTier(plans);
  const cols = plans.map((p) => (p.tier === recommended ? "1.35fr" : "1fr")).join(" ");
  return (
    <ol className="grid gap-3 md:grid-cols-(--plan-cols) md:items-end md:gap-4" style={{ "--plan-cols": cols } as CSSProperties}>
      {plans.map((plan) => {
        const amount = recurring ? plan.purchase.monthlyFee : plan.purchase.price;
        const isRecommended = plan.tier === recommended;
        return (
          <li
            key={plan.tier}
            className={cn(
              "relative grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-card border bg-surface p-5 md:flex md:flex-col md:items-start md:gap-0 md:p-6",
              isRecommended ? "border-brand-600 shadow-[0_0_0_1px_var(--color-brand-600)] md:py-8 md:shadow-[0_0_0_1px_var(--color-brand-600),var(--shadow-raised)]" : "border-line",
            )}
          >
            {isRecommended && (
              <span className="absolute -top-3 left-5 rounded-full bg-brand-600 px-2.5 py-0.5 text-[12px] font-semibold text-white md:left-6">
                Te recomendamos
              </span>
            )}
            <div className="md:w-full">
              <p className="font-semibold text-ink">{TIER_COPY[plan.tier].label}</p>
              <p className="text-[13px] text-muted">{TIER_COPY[plan.tier].hint}</p>
            </div>
            <p
              className={cn(
                "num row-span-2 text-right text-[1.5rem] font-semibold tracking-[-0.03em] text-ink md:mt-5 md:text-left",
                isRecommended ? "md:text-[2.5rem]" : "md:text-[2rem]",
              )}
            >
              {formatEUR(amount)}
              {recurring && <span className="text-sm font-normal tracking-normal text-muted">/mes</span>}
            </p>
            <p className="num text-[13px] text-muted md:mt-0.5">{formatEUR(plan.result.monthlyTotal)} al mes en total</p>
            <VerdictPill verdict={plan.result.verdict} score={plan.result.score} className="col-span-2 mt-3 md:mt-5" />
          </li>
        );
      })}
    </ol>
  );
}
