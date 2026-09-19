"use client";

import type { PurchaseInput } from "@/lib/engine";
import type { CategoryConfig } from "@/lib/data/categories";
import { Disclosure } from "@/components/ui/Disclosure";
import { NumberField, Segmented } from "@/components/ui/Field";

interface Props {
  category: CategoryConfig;
  purchase: PurchaseInput;
  onChange: (p: PurchaseInput) => void;
}

/** El precio manda; cómo pagas, después; los detalles, plegados con valores típicos. */
export function PurchaseForm({ category, purchase, onChange }: Props) {
  const set = <K extends keyof PurchaseInput>(k: K) => (v: PurchaseInput[K]) => onChange({ ...purchase, [k]: v });
  const financed = purchase.termMonths > 0;
  const { labels } = category;
  const isPurchase = category.kind === "purchase";
  const downPaymentError = financed && purchase.downPayment > purchase.price ? "La entrada no puede ser mayor que el precio." : null;

  return (
    <div className="flex flex-col gap-6">
      {isPurchase ? (
        <NumberField size="lg" label={labels.price} suffix="€" value={purchase.price} onChange={set("price")} />
      ) : (
        <NumberField size="lg" label={labels.fee ?? "Cuota al mes"} suffix="€/mes" value={purchase.monthlyFee} onChange={set("monthlyFee")} />
      )}

      {isPurchase && category.allowFinancing && (
        <Segmented
          label="¿Cómo lo pagas?"
          value={financed ? "financed" : "cash"}
          options={[
            { value: "cash", label: "Al contado" },
            { value: "financed", label: "A plazos" },
          ]}
          onChange={(v) =>
            onChange(
              v === "cash"
                ? { ...purchase, termMonths: 0 }
                : {
                    ...purchase,
                    termMonths: category.defaults.termMonths || 24,
                    annualRate: category.defaults.termMonths ? category.defaults.annualRate : 7,
                  },
            )
          }
        />
      )}

      {financed && (
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            label="Entrada"
            suffix="€"
            value={purchase.downPayment}
            onChange={set("downPayment")}
            hint="Lo que pagas al principio con tus ahorros"
            error={downPaymentError}
          />
          <NumberField label="Plazo" suffix="meses" value={purchase.termMonths} onChange={(v) => set("termMonths")(Math.round(v))} max={480} />
        </div>
      )}

      <Disclosure summary="Ajustar detalles" meta="Con valores típicos" className="border-t border-line pt-3">
        <div className="grid gap-5 sm:grid-cols-2">
          {financed && (
            <NumberField
              label="Interés (TIN)"
              suffix="%"
              value={purchase.annualRate}
              onChange={set("annualRate")}
              max={40}
              hint="Míralo en la oferta. Si no lo sabes, deja este"
            />
          )}
          <NumberField label={labels.upfront} suffix="€" value={purchase.upfrontCosts} onChange={set("upfrontCosts")} hint="Se paga una vez, de tus ahorros" />
          <NumberField
            label={labels.running}
            suffix="€/mes"
            value={purchase.monthlyRunningCosts}
            onChange={set("monthlyRunningCosts")}
            hint={labels.runningHint}
          />
        </div>
      </Disclosure>
    </div>
  );
}
