import { planTrip } from "@/lib/engine";
import { DESTINATION_BY_ID, ORIGIN_BY_ID } from "@/lib/data/travel";
import { TRIP_EXAMPLE } from "@/lib/data/examples";
import { TIER_COPY, TRIP_LINE_COPY } from "@/lib/copy";
import { formatEUR } from "@/lib/format";
import { ArrowGlyph, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { IconPlane } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

export function TravelTeaser() {
  const origin = ORIGIN_BY_ID[TRIP_EXAMPLE.origin];
  const dest = DESTINATION_BY_ID[TRIP_EXAMPLE.destination];
  const plans = planTrip(origin, dest, TRIP_EXAMPLE);
  const href = `/viajes?o=c:${origin.id}&d=c:${dest.id}&n=${TRIP_EXAMPLE.nights}&p=${TRIP_EXAMPLE.travelers}`;

  return (
    <Section
      id="viajes"
      eyebrow="Planificador de viajes"
      title="Del sofá de casa a la vuelta, sabiendo lo que cuesta"
      intro="Cómo llegar al aeropuerto, vuelo o tren, dónde dormir, qué comer y qué ver. En tres planes, por persona, y con tu nota."
      aside={
        <ButtonLink href={href} size="lg">
          Planificar un viaje
          <ArrowGlyph />
        </ButtonLink>
      }
      className="border-t border-line"
    >
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
          <p className="flex items-center gap-2.5 font-semibold text-ink">
            <IconPlane size={20} className="text-muted" aria-hidden="true" />
            {origin.name} → {dest.name}
          </p>
          <p className="text-[14px] text-muted">
            {TRIP_EXAMPLE.nights} noches · {TRIP_EXAMPLE.travelers} personas · precio por persona
          </p>
        </div>
        <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {plans.map((plan) => (
            <div key={plan.tier} className={cn("p-5 md:p-7", plan.tier === "value" && "bg-canvas/60")}>
              <p className="text-[14px] font-semibold text-ink">{TIER_COPY[plan.tier].label}</p>
              <p className="num mt-2 text-[2.25rem] leading-none font-semibold tracking-[-0.04em] text-ink">{formatEUR(plan.perPerson)}</p>
              <dl className="mt-6 flex flex-col gap-2 text-[14px]">
                {plan.lines.map((l) => (
                  <div key={l.id} className="flex justify-between gap-3">
                    <dt className="text-muted">{TRIP_LINE_COPY[l.id]}</dt>
                    <dd className="num text-ink-2">{formatEUR(l.perPerson)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 border-t border-line pt-4 text-[14px] leading-snug text-ink-2">{plan.highlights[0]}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="mt-4 text-[13px] text-muted">Precios orientativos de referencia. Te decimos si te da antes de reservar.</p>
    </Section>
  );
}
