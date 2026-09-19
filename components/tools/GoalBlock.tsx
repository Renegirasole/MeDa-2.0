"use client";

import { useState } from "react";
import {
  maxAffordable,
  PASSING_SCORE,
  suggestedMonthlySaving,
  timeToAfford,
  type AffordabilityResult,
  type FinancialProfile,
  type PurchaseInput,
} from "@/lib/engine";
import { formatEUR, formatMonths } from "@/lib/format";
import { NumberField } from "@/components/ui/Field";

interface Props {
  profile: FinancialProfile;
  purchase: PurchaseInput;
  guideline: number;
  result: AffordabilityResult;
  recurring: boolean;
}

/** Simular: hasta cuánto te da y, si no llega, cuánto tardarías en ahorrarlo. */
export function GoalBlock({ profile, purchase, guideline, result, recurring }: Props) {
  const [saving, setSaving] = useState<number | null>(null);
  const pace = saving ?? suggestedMonthlySaving(profile);
  const max = maxAffordable(profile, purchase, guideline);
  const maxAmount = max ? (recurring ? max.purchase.monthlyFee : max.purchase.price) : null;
  const unit = recurring ? " al mes" : "";
  const passes = result.score >= PASSING_SCORE;
  const months = passes ? null : timeToAfford(profile, purchase, guideline, pace);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-card bg-subtle p-5">
        <p className="text-[14px] text-muted">{passes ? "Te da con margen hasta" : "Te daría si costara como mucho"}</p>
        <p className="num mt-1 text-[1.75rem] font-semibold tracking-[-0.03em] text-ink">
          {maxAmount === null ? "Ni al mínimo" : `${formatEUR(maxAmount)}${unit}`}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-muted">
          {maxAmount === null
            ? "Primero toca ganar margen al mes o recuperar colchón."
            : "Con tus números de hoy, mismas condiciones y sin bajar del aprobado."}
        </p>
      </div>

      {!passes && (
        <div className="rounded-card border border-line p-5">
          <NumberField label="Si ahorras al mes" suffix="€" value={pace} onChange={setSaving} />
          <p className="mt-3 text-[15px] leading-snug font-medium text-ink">
            {months === null ? "A ese ritmo no llegas en 5 años." : `Te daría en ${formatMonths(months)}.`}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-muted">
            {months === null
              ? "Prueba a ahorrar más o mira el plan más barato."
              : purchase.termMonths > 0
                ? "Suponemos que la mitad de lo que ahorras va a la entrada."
                : "Sumando lo que ahorres a lo que ya tienes."}
          </p>
        </div>
      )}
    </div>
  );
}
