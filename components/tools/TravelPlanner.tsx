"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { evaluateOne, PASSING_SCORE, type AffordabilityResult, type PlanTier, type PurchaseInput } from "@/lib/engine";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { TIER_COPY, VERDICT_COPY } from "@/lib/copy";
import { attractionLink, cityDiscoveryLinks, tripSteps } from "@/lib/affiliates";
import { track } from "@/lib/analytics";
import { formatEUR, formatNumber, formatScore } from "@/lib/format";
import { useProfile } from "@/lib/storage/hooks";
import { encodeSelection, selectionName, type PlaceSelection } from "@/lib/viajes/lugares";
import { addDays, applyRealFlight, planDetailedTrip, TripError, type LineKey, type TripMode, type TripPlan, type TripPlanning } from "@/lib/viajes/plan";
import { esimSlug, needsEsim } from "@/lib/viajes/paises";
import { useFlightPrice } from "@/lib/viajes/hooks";
import { Card } from "@/components/ui/Card";
import { DateField, NumberField, Segmented } from "@/components/ui/Field";
import { AffiliateNote, PartnerLinkRow } from "@/components/ui/PartnerLinks";
import { toneFor, VerdictPill } from "@/components/ui/ScoreScale";
import {
  IconBed,
  IconBus,
  IconCar,
  IconCheck,
  IconFood,
  IconInfo,
  IconPin,
  IconPlane,
  IconTicket,
  IconTrain,
  IconTram,
  IconVan,
} from "@/components/ui/icons";
import { PlaceField } from "./PlaceField";
import { cn } from "@/components/ui/cn";

export interface TripQuery {
  origin: PlaceSelection;
  destination: PlaceSelection;
  /** YYYY-MM-DD */
  depart: string;
  /** YYYY-MM-DD */
  return: string;
  travelers: number;
}

type Icon = ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>;

const LINE_ICON: Record<Exclude<LineKey, "main">, Icon> = {
  access: IconPin,
  transfer: IconVan,
  lodging: IconBed,
  food: IconFood,
  local: IconTram,
  activities: IconTicket,
};
const MODE_ICON: Record<TripMode, Icon> = { avion: IconPlane, tren: IconTrain, bus: IconBus, coche: IconCar };

const GUIDELINE = CATEGORY_BY_SLUG.viaje.guideline;
const MAX_NIGHTS = 60;

const cashPurchase = (price: number): PurchaseInput => ({
  price,
  downPayment: 0,
  termMonths: 0,
  annualRate: 0,
  upfrontCosts: 0,
  monthlyFee: 0,
  monthlyRunningCosts: 0,
});

/** Si no llega con lo ahorrado: meses guardando el margen de cada mes para cubrirlo. */
const monthsToSave = (r: AffordabilityResult): number | null =>
  r.savingsAfter < 0 && r.freeCashBefore > 0 ? Math.ceil(-r.savingsAfter / r.freeCashBefore) : null;

const shortDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });

export function TravelPlanner({ initial, today }: { initial: TripQuery; today: string }) {
  const [q, setQ] = useState<TripQuery>(initial);
  const [payer, setPayer] = useState<"share" | "all">("share");
  const [chosen, setChosen] = useState<PlanTier | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [profile] = useProfile();

  const base = useMemo((): { planning: TripPlanning; error: null } | { planning: null; error: string } => {
    try {
      return { planning: planDetailedTrip(q), error: null };
    } catch (e) {
      return { planning: null, error: e instanceof TripError ? e.message : "No hemos podido calcular ese viaje." };
    }
  }, [q]);

  const summary = base.planning?.summary;
  const flight = useFlightPrice({
    from: summary?.airport?.iata,
    to: summary?.destination.priceCode,
    depart: q.depart,
    ret: q.return,
    enabled: Boolean(summary?.flying),
  });
  const planning = base.planning && flight.status === "ok" ? applyRealFlight(base.planning, flight.flight) : base.planning;

  const scored = (planning?.plans ?? []).map((plan) => ({
    plan,
    result: evaluateOne(profile, cashPurchase(payer === "all" ? plan.total : plan.perPerson), GUIDELINE),
  }));
  const passing = scored.filter((s) => s.result.score >= PASSING_SCORE);
  const recommended: PlanTier | null = passing.length > 0 ? passing[passing.length - 1].plan.tier : null;
  const tier: PlanTier = chosen ?? recommended ?? "value";
  const current = scored.find((s) => s.plan.tier === tier);

  useEffect(() => {
    const params = new URLSearchParams({
      o: encodeSelection(q.origin),
      d: encodeSelection(q.destination),
      ida: q.depart,
      vuelta: q.return,
      p: String(q.travelers),
    });
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [q]);

  const tripKey = summary ? `${summary.origin.id}-${summary.destination.id}-${summary.nights}-${summary.travelers}` : null;
  useEffect(() => {
    if (!tripKey || !summary) return;
    track("calculo_completado", {
      categoria: "viaje",
      modo: summary.flying ? "avion" : "tierra",
      noches: summary.nights,
      viajeros: summary.travelers,
      destino: summary.destination.guide ? summary.destination.id : "mundo",
    });
    // Una vez por viaje distinto, no en cada cambio de «qué pagas tú».
  }, [tripKey]);

  const set = <K extends keyof TripQuery>(k: K) => (v: TripQuery[K]) => setQ((prev) => ({ ...prev, [k]: v }));
  const setDepart = (depart: string) =>
    setQ((prev) => {
      // Se conserva la duración del viaje al mover la ida.
      const nights = Math.max(1, Math.round((Date.parse(prev.return) - Date.parse(prev.depart)) / 86_400_000) || 1);
      return { ...prev, depart, return: addDays(depart, nights) };
    });

  const dateError = base.error && /vuelta|noches/.test(base.error) ? base.error : null;

  return (
    <div className="flex flex-col gap-10">
      <Card className="p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <PlaceField label="Sales desde" placeholder="Tu ciudad" kind="origin" value={q.origin} onChange={set("origin")} catalogTitle="Ciudades de España" />
          <PlaceField
            label="Te vas a"
            placeholder="Cualquier ciudad del mundo"
            kind="destination"
            value={q.destination}
            onChange={set("destination")}
            catalogTitle="Destinos con guía propia"
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-3">
          <DateField label="Ida" value={q.depart} min={today} onChange={setDepart} />
          <DateField label="Vuelta" value={q.return} min={addDays(q.depart, 1)} max={addDays(q.depart, MAX_NIGHTS)} onChange={set("return")} error={dateError} />
          <NumberField
            label="Personas"
            value={q.travelers}
            onChange={(v) => set("travelers")(Math.min(12, Math.max(1, Math.round(v))))}
            min={1}
            max={12}
            className="col-span-2 lg:col-span-1"
          />
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

      {!planning || !summary || !current ? (
        !dateError && <p className="text-[15px] leading-relaxed text-ink-2">{base.error}</p>
      ) : (
        <>
          <section aria-labelledby="trip-title">
            <p className="text-[14px] font-medium text-muted">
              {shortDate(q.depart)} – {shortDate(q.return)} · {summary.nights} {summary.nights === 1 ? "noche" : "noches"} · {summary.travelers}{" "}
              {summary.travelers === 1 ? "persona" : "personas"}
            </p>
            <h2 id="trip-title" className="mt-1 text-[1.625rem] leading-tight font-semibold tracking-[-0.025em] text-ink md:text-[2rem]">
              {selectionName(q.origin)} → {selectionName(q.destination)}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              ≈{formatNumber(summary.km)} km en línea recta ·{" "}
              {summary.flying && summary.airport
                ? summary.airportEstimated
                  ? `vuelas desde los aeropuertos de ${summary.origin.name} (${summary.airport.iata})`
                  : `mejor volar desde ${summary.airport.name} (${summary.airport.iata}), a ≈${formatNumber(summary.kmToAirport)} km`
                : "se puede ir por tierra"}
            </p>
            {summary.alternativeAirport && (
              <p className="mt-1 text-[13px] text-muted">
                También puedes mirar vuelos desde {summary.alternativeAirport.name} ({summary.alternativeAirport.iata}): está más cerca, pero suele
                tener menos rutas.
              </p>
            )}
          </section>

          <div role="tablist" aria-label="Planes del viaje" className="-mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {scored.map(({ plan, result }) => {
              const active = plan.tier === tier;
              return (
                <button
                  key={plan.tier}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="trip-plan"
                  onClick={() => setChosen(plan.tier)}
                  className={cn(
                    "relative flex flex-col items-start rounded-(--radius-control) border p-3 pt-4 text-left transition-[border-color,box-shadow,background-color] duration-150 sm:p-4",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                    active ? "border-brand-600 bg-surface shadow-[0_0_0_1px_var(--color-brand-600)]" : "border-line bg-surface hover:border-ink/30",
                  )}
                >
                  {plan.tier === recommended && (
                    <span className="absolute -top-2.5 left-2.5 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-white sm:left-3">
                      Recomendado
                    </span>
                  )}
                  <span className="block text-[13px] font-medium text-muted">{TIER_COPY[plan.tier].label}</span>
                  <span className="num mt-1 block text-[1.25rem] leading-tight font-semibold tracking-[-0.02em] text-ink sm:text-[1.5rem]">
                    {formatEUR(plan.perPerson)}
                  </span>
                  <span className="block text-[12px] text-muted">por persona</span>
                  <span className={cn("num mt-2 inline-flex rounded-full px-2 py-0.5 text-[12px] font-semibold", toneFor(result.verdict).soft)}>
                    {formatScore(result.score)}
                    <span className="hidden sm:inline">&nbsp;· {VERDICT_COPY[result.verdict].label}</span>
                    <span className="sr-only sm:hidden"> · {VERDICT_COPY[result.verdict].label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <PlanDetail id="trip-plan" plan={current.plan} result={current.result} travelers={summary.travelers} flightStatus={flight.status} />

          {current.result.score >= PASSING_SCORE ? (
            <Card className="p-5 sm:p-7">
              <h3 className="font-semibold text-ink">Reserva este plan paso a paso</h3>
              <p className="mt-1 text-[14px] leading-snug text-muted">
                Cada enlace abre la búsqueda ya filtrada con tus fechas y viajeros. Marca cada paso cuando lo tengas.
              </p>
              <ol className="mt-6 flex flex-col gap-6">
                {tripSteps({
                  tier,
                  mode: current.plan.mode,
                  origin: { name: summary.origin.name, country: summary.origin.country },
                  destination: {
                    name: summary.destination.name,
                    country: summary.destination.country,
                    iata: summary.destination.iata,
                    civitatisSlug: summary.destination.guide?.civitatisSlug ?? null,
                    transferSlug: summary.destination.transferSlug,
                    esimSlug: needsEsim(summary.origin.country, summary.destination.country) ? esimSlug(summary.destination.country) : null,
                  },
                  airport: summary.airport ? { iata: summary.airport.iata, city: summary.airport.city } : null,
                  depart: q.depart,
                  return: q.return,
                  travelers: summary.travelers,
                  flight: flight.status === "ok" && flight.flight.link ? { href: flight.flight.link, perPerson: flight.flight.perPerson } : null,
                }).map((step, i) => {
                  const key = `${tier}-${i}`;
                  const isDone = Boolean(done[key]);
                  return (
                    <li key={key} className="flex gap-3.5">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isDone}
                        aria-label={`Marcar el paso ${i + 1} como hecho`}
                        onClick={() => setDone((prev) => ({ ...prev, [key]: !isDone }))}
                        className={cn(
                          "num flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors duration-150",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                          isDone ? "border-brand-600 bg-brand-600 text-white" : "border-line-strong bg-surface text-muted hover:border-ink/40",
                        )}
                      >
                        {isDone ? <IconCheck size={16} aria-hidden="true" /> : i + 1}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn("pt-1 text-[15px] font-semibold text-ink", isDone && "text-muted line-through")}>{step.title}</p>
                        <ul className="mt-2.5 grid gap-px overflow-hidden rounded-(--radius-control) border border-line bg-line sm:grid-cols-2">
                          {step.links.map((link, j) => (
                            <li key={link.href} className={cn(step.links.length % 2 === 1 && j === step.links.length - 1 && "sm:col-span-2")}>
                              <PartnerLinkRow link={link} position={j + 1} context={`viajes-paso-${i + 1}`} primary={j === 0} className="h-full" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <AffiliateNote className="mt-6" />
            </Card>
          ) : (
            <p className="rounded-(--radius-control) bg-subtle px-4 py-3.5 text-[15px] leading-relaxed text-ink-2">
              {recommended ? (
                <>
                  Con este plan no te da, así que no te mandamos a reservarlo. El plan {TIER_COPY[recommended].label.toLowerCase()} sí te da:{" "}
                  <button type="button" onClick={() => setChosen(recommended)} className="font-semibold text-brand-700 underline underline-offset-2">
                    ver ese plan
                  </button>
                  .
                </>
              ) : (
                "Ningún plan te da ahora mismo, así que no te mandamos a reservar. Prueba menos noches, otras fechas u otro destino."
              )}
            </p>
          )}

          {summary.destination.guide ? (
            <Card className="p-5 sm:p-7">
              <h3 className="font-semibold text-ink">Qué ver en {summary.destination.name}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {summary.destination.guide.attractions.map((a, i) => (
                  <li key={a.name} className="flex flex-col gap-3 rounded-(--radius-control) border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{a.name}</p>
                      <p className="mt-0.5 text-[14px] leading-snug text-muted">{a.description}</p>
                    </div>
                    <PartnerLinkRow
                      link={attractionLink(a.name, summary.destination.name)}
                      position={i + 1}
                      context="viajes-que-ver"
                      className="shrink-0 rounded-(--radius-control) border border-line sm:min-w-44"
                    />
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <Card className="p-5 sm:p-7">
              <h3 className="font-semibold text-ink">Qué ver y hacer en {summary.destination.name}</h3>
              <p className="mt-1 text-[14px] text-muted">Tours y entradas, ya filtrados para {summary.destination.name}.</p>
              <ul className="mt-4 grid gap-px overflow-hidden rounded-(--radius-control) border border-line bg-line sm:grid-cols-2">
                {cityDiscoveryLinks(summary.destination.name).map((link, i) => (
                  <li key={link.href}>
                    <PartnerLinkRow link={link} position={i + 1} context="viajes-que-ver" primary={i === 0} className="h-full" />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <p className="text-center text-[13px] leading-relaxed text-muted">
            MeDa no vende viajes: te enlaza a cada proveedor para que reserves directamente con él. Son estimaciones orientativas, no una
            oferta ni asesoramiento financiero.
            {summary.countryAverage && ` En ${summary.destination.name} usamos los precios medios de su país.`}
          </p>
        </>
      )}
    </div>
  );
}

function PlanDetail({
  id,
  plan,
  result,
  travelers,
  flightStatus,
}: {
  id: string;
  plan: TripPlan;
  result: AffordabilityResult;
  travelers: number;
  flightStatus: "idle" | "loading" | "ok" | "none";
}) {
  const months = monthsToSave(result);
  const hasReal = plan.lines.some((l) => l.source === "real");
  return (
    <Card id={id} role="tabpanel" className="p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[1.25rem] font-semibold tracking-[-0.015em] text-ink">{TIER_COPY[plan.tier].label}</h3>
          <p className="mt-0.5 text-[14px] text-muted">{plan.description}</p>
        </div>
        <VerdictPill verdict={result.verdict} score={result.score} />
      </div>
      <p className="sr-only">{VERDICT_COPY[result.verdict].label}</p>

      {months !== null && (
        <p className="mt-4 rounded-(--radius-control) bg-caution-50 px-3.5 py-2.5 text-[14px] leading-snug text-caution-700">
          Con lo que tienes ahorrado no te llega. Guardando tu margen de cada mes, lo tendrías en {months} {months === 1 ? "mes" : "meses"}.
        </p>
      )}

      <ul className="mt-5 divide-y divide-line">
        {plan.lines.map((line) => {
          const Icon = line.key === "main" ? MODE_ICON[plan.mode] : LINE_ICON[line.key];
          return (
            <li key={line.key} className="flex items-center gap-3.5 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-2">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px] leading-snug font-medium text-ink">
                  {line.title}
                  {line.source === "real" && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">precio real</span>
                  )}
                  {line.key === "main" && flightStatus === "loading" && <span className="text-[12px] font-normal text-muted">buscando precio real…</span>}
                </span>
                <span className="block text-[13px] leading-snug text-muted">{line.detail}</span>
              </span>
              <span className="num text-[15px] font-semibold text-ink">{formatEUR(line.amount)}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-1 flex items-baseline justify-between border-t border-ink/80 pt-3">
        <span className="font-semibold text-ink">Total{travelers > 1 ? ` · ${travelers} personas` : ""}</span>
        <span className="num text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">{formatEUR(plan.total)}</span>
      </div>
      <p className="mt-4 flex gap-2 text-[13px] leading-snug text-muted">
        <IconInfo size={16} aria-hidden="true" className="mt-px shrink-0" />
        {hasReal
          ? "El vuelo sale de precios reales vistos en búsquedas de estos días; el resto son estimaciones con precios medios. Confirma el precio final al reservar."
          : "Estimación orientativa con precios medios. Los precios reales cambian cada día: consúltalos en cada paso de la reserva."}
      </p>
    </Card>
  );
}
