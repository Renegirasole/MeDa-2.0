"use client";

import { useMemo } from "react";
import { evaluate } from "@/lib/engine";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { formatEUR } from "@/lib/format";
import { useCombo, useProfile } from "@/lib/storage/hooks";
import { Card } from "@/components/ui/Card";
import { ArrowGlyph, ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Disclosure } from "@/components/ui/Disclosure";
import { IconStack, IconTrash } from "@/components/ui/icons";
import { ResultCard } from "./ResultCard";
import { FactorList } from "./FactorList";
import { Explanation } from "./Explanation";

/** Tope de la referencia combinada: nunca más de la mitad de los ingresos en gastos nuevos. */
const MAX_COMBINED_GUIDELINE = 0.5;

function Skeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" aria-hidden="true">
      <div className="h-72 animate-pulse rounded-card bg-subtle" />
      <div className="h-96 animate-pulse rounded-card bg-subtle" />
    </div>
  );
}

export function Combiner() {
  const [profile, , { hydrated }] = useProfile();
  const [items, setItems] = useCombo();

  const guideline = Math.min(
    MAX_COMBINED_GUIDELINE,
    items.reduce((a, i) => a + CATEGORY_BY_SLUG[i.slug].guideline, 0),
  );
  const result = useMemo(() => evaluate(profile, items.map((i) => i.purchase), guideline), [profile, items, guideline]);

  if (!hydrated) return <Skeleton />;

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-start gap-5 p-7 md:flex-row md:items-center md:gap-8 md:p-10">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <IconStack size={28} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">Tu lista está vacía</h2>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted">
            Calcula cualquier compra y pulsa «Añadir a mi lista». Aquí verás si te da todo a la vez: el coche, el gimnasio y el
            viaje de verano, por ejemplo.
          </p>
        </div>
        <ButtonLink href="/calculadoras" size="lg">
          Empezar un cálculo
          <ArrowGlyph />
        </ButtonLink>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-6">
        <Card className="p-5 sm:p-7">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink">Lo que quieres a la vez</h2>
            <p className="text-[13px] text-muted">
              {items.length} {items.length === 1 ? "gasto" : "gastos"}
            </p>
          </div>
          <ul className="flex flex-col divide-y divide-line">
            {items.map((item) => {
              const cat = CATEGORY_BY_SLUG[item.slug];
              const single = evaluate(profile, [item.purchase], cat.guideline);
              return (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-subtle text-ink">
                    <CategoryIcon name={cat.icon} size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{item.label}</p>
                    <p className="num text-[14px] text-muted">
                      {formatEUR(single.monthlyTotal)} al mes · {formatEUR(single.cashOutlay)} de ahorros
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                    aria-label={`Quitar ${item.label} de la lista`}
                    className="inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-alert-50 hover:text-alert-700 focus-visible:outline-2 focus-visible:outline-brand-600"
                  >
                    <IconTrash size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
          <ButtonLink href="/calculadoras" variant="tertiary" className="mt-2 -ml-4">
            Añadir otro gasto
          </ButtonLink>
        </Card>
        <Card className="p-5 sm:p-7">
          <h2 className="mb-6 text-lg font-semibold text-ink">Por qué te sale esta nota</h2>
          <FactorList result={result} />
          <Disclosure summary="Leer la explicación completa" className="mt-4 border-t border-line pt-3">
            <Explanation result={result} what="todo junto" />
          </Disclosure>
        </Card>
      </div>
      <div className="lg:sticky lg:top-24">
        <ResultCard result={result} eyebrow="Todo junto" />
      </div>
    </div>
  );
}
