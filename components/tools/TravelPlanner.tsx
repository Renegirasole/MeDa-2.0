"use client";

import { useEffect, useMemo, useState } from "react";
import { evaluateOne, PASSING_SCORE, planTrip, type PurchaseInput } from "@/lib/engine";
import { DESTINATIONS, DESTINATION_BY_ID, ORIGINS, ORIGIN_BY_ID, TRAVEL_REFERENCE_UPDATED } from "@/lib/data/travel";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { TIER_COPY, TRIP_LINE_COPY } from "@/lib/copy";
import { travelLinks } from "@/lib/affiliates";
import { formatEUR } from "@/lib/format";
import { useProfile } from "@/lib/storage/hooks";
import { Card } from "@/components/ui/Card";
import { NumberField, Segmented, SelectField } from "@/components/ui/Field";
import { PartnerLinks } from "@/components/ui/PartnerLinks";
import { VerdictPill } from "@/components/ui/ScoreScale";
import { cn } from "@/components/ui/cn";

export interface TripQuery {
  origin: string;
  destination: string;
  nights: number;
  travelers: number;
}

const GUIDELINE = CATEGORY_BY_SLUG.viaje.guideline;

const cashPurchase = (price: number): PurchaseInput => ({
  price,
  downPayment: 0,
  termMonths: 0,
  annualRate: 0,
  upfrontCosts: 0,
  monthlyFee: 0,
  monthlyRunningCosts: 0,
});

export function TravelPlanner({ initial }: { initial: TripQuery }) {
  const [q, setQ] = useState<TripQuery>(initial);
  const [payer, setPayer] = useState<"share" | "all">("share");
  const [profile] = useProfile();

  const origin = ORIGIN_BY_ID[q.origin] ?? ORIGINS[0];
  const dest = DESTINATION_BY_ID[q.destination] ?? DESTINATIONS[0];
  const plans = useMemo(() => planTrip(origin, dest, q), [origin, dest, q]);
  const scored = plans.map((plan) => ({
    plan,
    result: evaluateOne(profile, cashPurchase(payer === "all" ? plan.total : plan.perPerson), GUIDELINE),
  }));
  const passing = scored.filter((s) => s.result.score >= PASSING_SCORE);
  const recommended = passing.length > 0 ? passing[passing.length - 1].plan.tier : null;

  useEffect(() => {
    const params = new URLSearchParams({ o: origin.id, d: dest.id, n: String(q.nights), p: String(q.travelers) });
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [origin.id, dest.id, q.nights, q.travelers]);

  const set = <K extends keyof TripQuery>(k: K) => (v: TripQuery[K]) => setQ((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="flex flex-col gap-10">
      <Card className="p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField label="Sales desde" value={origin.id} options={ORIGINS.map((o) => ({ value: o.id, label: o.name }))} onChange={set("origin")} />
          <SelectField label="Te vas a" value={dest.id} options={DESTINATIONS.map((d) => ({ value: d.id, label: d.name }))} onChange={set("destination")} />
          <NumberField label="Noches" value={q.nights} onChange={(v) => set("nights")(Math.min(30, Math.max(1, Math.round(v))))} min={1} max={30} />
          <NumberField label="Personas" value={q.travelers} onChange={(v) => set("travelers")(Math.min(10, Math.max(1, Math.round(v))))} min={1} max={10} />
        </div>
        {q.travelers > 1 && (
          <div className="mt-6 max-w-sm">
            <Segmented
              label="¿Qué pagas tú?"
              value={payer}
              options={[
                { value: "share", label: "Mi parte" },
                { value: "all", label: "Todo el viaje" },
              ]}
              onChange={setPayer}
            />
          </div>
        )}
      </Card>

      <section aria-labelledby="trip-plans">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="trip-plans" className="text-[1.625rem] leading-tight font-semibold tracking-[-0.025em] text-ink md:text-[2rem]">
            {origin.name} → {dest.name}
          </h2>
          <p className="text-[14px] text-muted">
            {q.nights} {q.nights === 1 ? "noche" : "noches"} · {q.travelers} {q.travelers === 1 ? "persona" : "personas"} · precio por persona
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {scored.map(({ plan, result }) => {
            const isRecommended = plan.tier === recommended;
            return (
              <li key={plan.tier} className="relative">
                {isRecommended && (
                  <span className="absolute -top-3 left-5 z-10 rounded-full bg-brand-600 px-2.5 py-0.5 text-[12px] font-semibold text-white md:left-6">
                    Te recomendamos
                  </span>
                )}
                <Card className={cn("flex h-full flex-col p-5 sm:p-6", isRecommended && "border-brand-600 shadow-[0_0_0_1px_var(--color-brand-600)]")}>
                  <h3 className="font-semibold text-ink">{TIER_COPY[plan.tier].label}</h3>
                  <p className="num mt-4 text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink">{formatEUR(plan.perPerson)}</p>
                  <p className="num mt-1.5 text-[13px] text-muted">
                    por persona{q.travelers > 1 ? ` · ${formatEUR(plan.total)} en total` : ""}
                  </p>
                  <VerdictPill verdict={result.verdict} score={result.score} className="mt-4" />

                  <dl className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5 text-[14px]">
                    {plan.lines.map((l) => (
                      <div key={l.id} className="flex justify-between gap-3">
                        <dt className="text-muted">{TRIP_LINE_COPY[l.id]}</dt>
                        <dd className="num text-ink">{formatEUR(l.perPerson)}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 border-t border-line pt-5">
                    <p className="text-[13px] font-medium text-muted">Qué ver</p>
                    <ul className="mt-2 flex flex-col gap-1.5 text-[14px] leading-snug text-ink-2">
                      {plan.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-8 border-t border-line pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <p className="font-semibold text-ink">Precios de referencia, no en tiempo real</p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Revisados en {TRAVEL_REFERENCE_UPDATED}. La nota usa tus números guardados en este dispositivo. El precio final lo
            verás al reservar.
          </p>
        </div>
        {recommended ? (
          <PartnerLinks links={travelLinks(dest.name)} title="Reserva al mejor precio" context="viajes" />
        ) : (
          <p className="text-[15px] leading-relaxed text-ink-2">
            Ningún plan te da ahora mismo, así que no te mandamos a reservar. Prueba menos noches u otro destino.
          </p>
        )}
      </div>
    </div>
  );
}
