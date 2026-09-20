"use client";

import { useEffect, useMemo, useState } from "react";
import { evaluateOne, PASSING_SCORE, planTrip, type PlanTier, type PurchaseInput, type TripPlan } from "@/lib/engine";
import { TRAVEL_REFERENCE_UPDATED } from "@/lib/data/travel";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { TIER_COPY, TRIP_LINE_COPY } from "@/lib/copy";
import { travelLinks } from "@/lib/affiliates";
import { formatEUR } from "@/lib/format";
import { useProfile } from "@/lib/storage/hooks";
import { encodeSelection, selectionName, type PlaceSelection } from "@/lib/viajes/lugares";
import { destinationTransferSlug, resolveTrip, TripError } from "@/lib/viajes/resolver";
import { esimSlug, needsEsim } from "@/lib/viajes/paises";
import { useFlightPrice } from "@/lib/viajes/hooks";
import { Card } from "@/components/ui/Card";
import { NumberField, Segmented } from "@/components/ui/Field";
import { PartnerLinks } from "@/components/ui/PartnerLinks";
import { VerdictPill } from "@/components/ui/ScoreScale";
import { PlaceField } from "./PlaceField";
import { cn } from "@/components/ui/cn";

export interface TripQuery {
  origin: PlaceSelection;
  destination: PlaceSelection;
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

/**
 * El precio real que devuelve la API es el vuelo más barato de la ruta: en el
 * plan barato sustituye a la estimación y en los demás sirve de suelo, porque
 * un plan mejor nunca puede costar menos que el billete más barato que existe.
 */
function withRealFlight(plans: TripPlan[], travelers: number, perPerson: number): TripPlan[] {
  return plans.map((plan) => {
    const lines = plan.lines.map((line) => {
      if (line.id !== "transport") return line;
      const value = plan.tier === "budget" ? perPerson : Math.max(line.perPerson, perPerson);
      return { ...line, perPerson: Math.round(value) };
    });
    const total = lines.reduce((a, l) => a + l.perPerson, 0);
    return { ...plan, lines, perPerson: total, total: total * travelers };
  });
}

export function TravelPlanner({ initial }: { initial: TripQuery }) {
  const [q, setQ] = useState<TripQuery>(initial);
  const [payer, setPayer] = useState<"share" | "all">("share");
  const [profile] = useProfile();

  const trip = useMemo(() => {
    try {
      return { ...resolveTrip(q.origin, q.destination), error: null as string | null };
    } catch (e) {
      return { error: e instanceof TripError ? e.message : "No hemos podido calcular ese viaje.", origin: null, destination: null, km: 0, mode: "avion" as const, estimated: false };
    }
  }, [q.origin, q.destination]);

  const flying = trip.mode === "avion";
  const flight = useFlightPrice(trip.origin?.iata, trip.destination?.iata, flying && !trip.error);

  const plans = useMemo(() => {
    if (!trip.origin || !trip.destination) return [];
    const base = planTrip(trip.origin, trip.destination, q);
    return flight ? withRealFlight(base, q.travelers, flight.perPerson) : base;
  }, [trip.origin, trip.destination, q, flight]);

  const scored = plans.map((plan) => ({
    plan,
    result: evaluateOne(profile, cashPurchase(payer === "all" ? plan.total : plan.perPerson), GUIDELINE),
  }));
  const passing = scored.filter((s) => s.result.score >= PASSING_SCORE);
  const recommended: PlanTier | null = passing.length > 0 ? passing[passing.length - 1].plan.tier : null;

  useEffect(() => {
    const params = new URLSearchParams({
      o: encodeSelection(q.origin),
      d: encodeSelection(q.destination),
      n: String(q.nights),
      p: String(q.travelers),
    });
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [q]);

  const set = <K extends keyof TripQuery>(k: K) => (v: TripQuery[K]) => setQ((prev) => ({ ...prev, [k]: v }));

  const links =
    trip.destination && trip.origin && recommended
      ? travelLinks({
          destination: trip.destination.name,
          country: trip.destination.country,
          originCountry: trip.origin.country,
          transferSlug: destinationTransferSlug(trip.destination),
          esimSlug: needsEsim(trip.origin.country, trip.destination.country) ? esimSlug(trip.destination.country) : null,
          tier: recommended,
          flying,
          flightHref: flight?.link ?? null,
          travelers: q.travelers,
        })
      : [];

  return (
    <div className="flex flex-col gap-10">
      <Card className="p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <PlaceField
            label="Sales desde"
            placeholder="Tu ciudad"
            kind="origin"
            value={q.origin}
            onChange={set("origin")}
            catalogTitle="Ciudades con datos revisados"
          />
          <PlaceField
            label="Te vas a"
            placeholder="Cualquier ciudad del mundo"
            kind="destination"
            value={q.destination}
            onChange={set("destination")}
            catalogTitle="Destinos con guía propia"
          />
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

      {trip.error ? (
        <p className="text-[15px] leading-relaxed text-ink-2">{trip.error}</p>
      ) : (
        <section aria-labelledby="trip-plans">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="trip-plans" className="text-[1.625rem] leading-tight font-semibold tracking-[-0.025em] text-ink md:text-[2rem]">
              {selectionName(q.origin)} → {selectionName(q.destination)}
            </h2>
            <p className="text-[14px] text-muted">
              {q.nights} {q.nights === 1 ? "noche" : "noches"} · {q.travelers} {q.travelers === 1 ? "persona" : "personas"} ·{" "}
              {flying ? "en avión" : "por tierra"} · {trip.km} km
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
                          <dt className="text-muted">
                            {TRIP_LINE_COPY[l.id]}
                            {l.id === "transport" && flight && <span className="ml-1.5 text-[12px] text-brand-700">precio real</span>}
                          </dt>
                          <dd className="num text-ink">{formatEUR(l.perPerson)}</dd>
                        </div>
                      ))}
                    </dl>

                    {plan.highlights.length > 0 && (
                      <div className="mt-6 border-t border-line pt-5">
                        <p className="text-[13px] font-medium text-muted">Qué ver</p>
                        <ul className="mt-2 flex flex-col gap-1.5 text-[14px] leading-snug text-ink-2">
                          {plan.highlights.map((h) => (
                            <li key={h}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {!trip.error && (
        <div className="grid gap-8 border-t border-line pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <p className="font-semibold text-ink">{flight ? "Vuelo con precio real" : "Precios de referencia, no en tiempo real"}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {flight
                ? `El vuelo es el más barato encontrado para ${trip.destination?.name} en ${flight.month}${flight.airline ? ` (${flight.airline})` : ""}. El resto son precios de referencia revisados en ${TRAVEL_REFERENCE_UPDATED}.`
                : trip.estimated
                  ? `No tenemos ${trip.destination?.name} revisado a mano: las cifras son una estimación con los precios medios del país. El precio final lo verás al reservar.`
                  : `Revisados en ${TRAVEL_REFERENCE_UPDATED}. La nota usa tus números guardados en este dispositivo. El precio final lo verás al reservar.`}
            </p>
          </div>
          {recommended ? (
            <PartnerLinks links={links} title="Reserva al mejor precio" context="viajes" />
          ) : (
            <p className="text-[15px] leading-relaxed text-ink-2">
              Ningún plan te da ahora mismo, así que no te mandamos a reservar. Prueba menos noches u otro destino.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
