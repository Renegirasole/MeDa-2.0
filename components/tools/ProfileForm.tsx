"use client";

import type { FinancialProfile } from "@/lib/engine";
import { formatEUR } from "@/lib/format";
import { Disclosure } from "@/components/ui/Disclosure";
import { NumberField, SelectField } from "@/components/ui/Field";
import { IconWarning } from "@/components/ui/icons";

const CUSHION_OPTIONS = [0, 1, 2, 3, 4, 6, 9, 12].map((m) => ({
  value: String(m),
  label: m === 0 ? "No quiero colchón" : `${m} ${m === 1 ? "mes" : "meses"} de gastos`,
}));

interface Props {
  profile: FinancialProfile;
  onChange: (p: FinancialProfile) => void;
  /** Abre "Afinar" de entrada (página Mis números) */
  expanded?: boolean;
}

/** Lo esencial a la vista; lo que afina, plegado. */
export function ProfileForm({ profile, onChange, expanded = false }: Props) {
  const set = <K extends keyof FinancialProfile>(k: K) => (v: FinancialProfile[K]) => onChange({ ...profile, [k]: v });
  const free = profile.monthlyIncome - profile.monthlyExpenses - profile.monthlyDebtPayments;
  const extras = [profile.monthlyDebtPayments > 0, profile.upcomingExpenses > 0].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <NumberField label="Ganas al mes" suffix="€" value={profile.monthlyIncome} onChange={set("monthlyIncome")} hint="Neto, lo que te llega" />
        <NumberField label="Gastas al mes" suffix="€" value={profile.monthlyExpenses} onChange={set("monthlyExpenses")} hint="Casa, comida, facturas, ocio" />
        <NumberField label="Tienes ahorrado" suffix="€" value={profile.savings} onChange={set("savings")} hint="Lo que podrías usar" />
      </div>

      {profile.monthlyIncome > 0 && free < 0 && (
        <p role="status" className="flex items-start gap-2 rounded-(--radius-control) bg-caution-50 px-3.5 py-3 text-[14px] leading-snug text-caution-700">
          <IconWarning size={18} className="mt-px shrink-0" aria-hidden="true" />
          Ahora mismo gastas {formatEUR(-free)} más de lo que ganas al mes. Revisa las cifras o cuenta con que no te dará.
        </p>
      )}

      <Disclosure
        summary="Afinar: deudas, colchón y gastos previstos"
        meta={extras > 0 ? `${extras} añadido${extras > 1 ? "s" : ""}` : "Opcional"}
        defaultOpen={expanded}
        className="border-t border-line pt-3"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <NumberField
            label="Pagas en deudas al mes"
            suffix="€"
            value={profile.monthlyDebtPayments}
            onChange={set("monthlyDebtPayments")}
            hint="Préstamos o tarjetas"
          />
          <SelectField
            label="Colchón que quieres"
            value={String(profile.emergencyMonths)}
            options={CUSHION_OPTIONS}
            onChange={(v) => set("emergencyMonths")(Number(v))}
            hint="Por si te quedas sin ingresos"
          />
          <NumberField
            label="Gastos que vienen"
            suffix="€"
            value={profile.upcomingExpenses}
            onChange={set("upcomingExpenses")}
            hint="Próximos 12 meses: una boda, el seguro…"
          />
        </div>
      </Disclosure>
    </div>
  );
}
