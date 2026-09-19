"use client";

import { useMemo, useState } from "react";
import { compareOffers, type Offer, type PurchaseInput } from "@/lib/engine";
import { EXAMPLE_OFFERS } from "@/lib/data/examples";
import { CATEGORIES, CATEGORY_BY_SLUG, type CategorySlug } from "@/lib/data/categories";
import { formatEUR } from "@/lib/format";
import { useProfile } from "@/lib/storage/hooks";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NumberField, SelectField } from "@/components/ui/Field";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { VerdictPill } from "@/components/ui/ScoreScale";
import { cn } from "@/components/ui/cn";

const MAX_OFFERS = 4;
const COMPARABLE = CATEGORIES.filter((c) => c.kind === "purchase" && c.allowFinancing);

function OfferEditor({ offer, onChange, onRemove }: { offer: Offer; onChange: (o: Offer) => void; onRemove?: () => void }) {
  const set = <K extends keyof PurchaseInput>(k: K) => (v: number) => onChange({ ...offer, purchase: { ...offer.purchase, [k]: v } });
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <label className="sr-only" htmlFor={`name-${offer.id}`}>
          Nombre de la oferta
        </label>
        <input
          id={`name-${offer.id}`}
          value={offer.name}
          onChange={(e) => onChange({ ...offer, name: e.target.value.slice(0, 40) })}
          className="-ml-2 min-h-11 min-w-0 flex-1 rounded-lg px-2 text-lg font-semibold text-ink outline-none transition-colors duration-150 hover:bg-subtle focus:bg-subtle"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Quitar ${offer.name}`}
            className="inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-alert-50 hover:text-alert-700 focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            <IconTrash size={18} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Precio" suffix="€" value={offer.purchase.price} onChange={set("price")} />
        <NumberField label="Entrada" suffix="€" value={offer.purchase.downPayment} onChange={set("downPayment")} />
        <NumberField label="Plazo" suffix="meses" value={offer.purchase.termMonths} onChange={(v) => set("termMonths")(Math.round(v))} />
        <NumberField label="Interés (TIN)" suffix="%" value={offer.purchase.annualRate} onChange={set("annualRate")} max={40} />
        <NumberField label="Gastos iniciales" suffix="€" value={offer.purchase.upfrontCosts} onChange={set("upfrontCosts")} />
        <NumberField label="Gastos al mes" suffix="€" value={offer.purchase.monthlyRunningCosts} onChange={set("monthlyRunningCosts")} />
      </div>
    </Card>
  );
}

export function OfferComparator() {
  const [profile] = useProfile();
  const [slug, setSlug] = useState<CategorySlug>("coche");
  const [offers, setOffers] = useState<Offer[]>(EXAMPLE_OFFERS);
  const guideline = CATEGORY_BY_SLUG[slug].guideline;
  const comparison = useMemo(() => compareOffers(profile, offers, guideline), [profile, offers, guideline]);

  const best = comparison.ranked[0];
  const cheapest = comparison.ranked.find((o) => o.id === comparison.cheapestId);

  const reason = (() => {
    if (!best || !cheapest || !comparison.cheapestIsNotBest) return null;
    if (best.result.totalPaid < cheapest.result.totalPaid)
      return `No es la más barata de etiqueta, pero acabas pagando ${formatEUR(cheapest.result.totalPaid - best.result.totalPaid)} menos en total.`;
    return `No es la más barata de etiqueta, pero te deja ${formatEUR(best.result.marginAfter - cheapest.result.marginAfter)} más libres cada mes.`;
  })();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SelectField
          label="¿Qué estás comparando?"
          value={slug}
          options={COMPARABLE.map((c) => ({ value: c.slug, label: c.name }))}
          onChange={setSlug}
          hint="La nota usa tus números guardados."
          className="w-full sm:max-w-xs"
        />
        <Button variant="tertiary" onClick={() => setOffers(EXAMPLE_OFFERS)} className="self-start sm:self-auto">
          Volver al ejemplo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {offers.map((o, i) => (
          <OfferEditor
            key={o.id}
            offer={o}
            onChange={(next) => setOffers((prev) => prev.map((p, j) => (j === i ? next : p)))}
            onRemove={offers.length > 2 ? () => setOffers((prev) => prev.filter((_, j) => j !== i)) : undefined}
          />
        ))}
        {offers.length < MAX_OFFERS && (
          <button
            type="button"
            onClick={() =>
              setOffers((prev) => [
                ...prev,
                {
                  id: `o${Date.now()}`,
                  name: `Oferta ${prev.length + 1}`,
                  purchase: { ...CATEGORY_BY_SLUG[slug].defaults, termMonths: CATEGORY_BY_SLUG[slug].defaults.termMonths || 24 },
                },
              ])
            }
            className="flex min-h-40 items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-strong text-[15px] font-medium text-muted transition-[border-color,color,transform] duration-160 ease-(--ease-out) hover:border-brand-600 hover:text-brand-700 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            <IconPlus size={18} aria-hidden="true" />
            Añadir otra oferta
          </button>
        )}
      </div>

      <section aria-labelledby="cmp-result" aria-live="polite">
        <p className="text-[13px] font-medium text-brand-700">Resultado</p>
        <h2 id="cmp-result" className="mt-2 text-[1.625rem] leading-tight font-semibold tracking-[-0.025em] text-ink md:text-[2rem]">
          {best ? `Te conviene ${best.name}` : "Añade al menos dos ofertas"}
        </h2>
        {reason && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">{reason}</p>}

        <ol className="mt-7 flex flex-col gap-3">
          {comparison.ranked.map((o, i) => (
            <li
              key={o.id}
              className={cn(
                "grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 rounded-card border bg-surface p-5 sm:grid-cols-[auto_1.4fr_repeat(3,1fr)] sm:items-center",
                i === 0 ? "border-brand-600 shadow-[0_0_0_1px_var(--color-brand-600)]" : "border-line",
              )}
            >
              <span
                className={cn(
                  "num flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                  i === 0 ? "bg-brand-600 text-white" : "bg-subtle text-ink-2",
                )}
              >
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-ink">
                  {o.name}
                  {o.id === comparison.cheapestId && <span className="ml-2 text-[13px] font-normal text-muted">la más barata de etiqueta</span>}
                </p>
                <VerdictPill verdict={o.result.verdict} score={o.result.score} className="mt-1.5" />
              </div>
              {[
                { label: "Cuota", value: o.result.monthlyPayment },
                { label: "Intereses", value: o.result.totalInterest },
                { label: "Pagas en total", value: o.result.totalPaid },
              ].map((x) => (
                <p key={x.label} className="col-start-2 flex justify-between gap-3 text-[14px] text-muted sm:col-start-auto sm:block sm:text-right">
                  {x.label}
                  <span className="num block font-semibold text-ink">{formatEUR(x.value)}</span>
                </p>
              ))}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
