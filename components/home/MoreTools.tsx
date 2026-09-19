import Link from "next/link";
import { compareOffers } from "@/lib/engine";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { APPRAISALS } from "@/lib/data/appraisal";
import { EXAMPLE_OFFERS } from "@/lib/data/examples";
import { DEFAULT_PROFILE } from "@/lib/storage/profile";
import { formatEUR, formatPct } from "@/lib/format";
import { ArrowGlyph, ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { VerdictPill } from "@/components/ui/ScoreScale";
import { IconArrowRight, IconCar, IconHouse, IconKey } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

const APPRAISAL_ICONS = { "vender-piso": IconHouse, "alquilar-piso": IconKey, "vender-coche": IconCar } as const;
const APPRAISAL_TEXT = {
  "vender-piso": "Según pisos parecidos de tu zona",
  "alquilar-piso": "Competitivo para no tenerlo vacío",
  "vender-coche": "Según el mismo modelo y sus kilómetros",
} as const;

/** Comparar y tasar: dos herramientas, un bloque asimétrico. */
export function MoreTools() {
  const cmp = compareOffers(DEFAULT_PROFILE, EXAMPLE_OFFERS, CATEGORY_BY_SLUG.coche.guideline);

  return (
    <Section id="mas-herramientas" eyebrow="Más herramientas" title="Para cuando ya tienes ofertas, o eres tú quien vende" className="border-t border-line">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Comparar ofertas */}
        <article id="comparar" aria-labelledby="comparar-title" className="flex flex-col rounded-[1.5rem] border border-line bg-surface p-6 sm:p-8">
          <h3 id="comparar-title" className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            Comparar ofertas
          </h3>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
            El mismo coche en tres concesionarios. La más barata de etiqueta no siempre es la que te conviene.
          </p>
          <ol className="mt-6 flex flex-col gap-2">
            {cmp.ranked.map((o, i) => (
              <li
                key={o.id}
                className={cn(
                  "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border px-4 py-3",
                  i === 0 ? "border-brand-600 bg-brand-50/40" : "border-line",
                )}
              >
                <span className={cn("num flex size-7 items-center justify-center rounded-full text-[13px] font-semibold", i === 0 ? "bg-brand-600 text-white" : "bg-subtle text-ink-2")}>
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-ink">
                    {o.name}
                    {o.id === cmp.cheapestId && <span className="ml-2 text-[12px] font-normal text-muted">la más barata</span>}
                  </p>
                  <p className="num truncate text-[13px] text-muted">
                    {formatEUR(o.purchase.price)} al {formatPct(o.purchase.annualRate / 100)} · pagas {formatEUR(o.result.totalPaid)}
                  </p>
                </div>
                <VerdictPill verdict={o.result.verdict} score={o.result.score} className="max-sm:hidden" />
              </li>
            ))}
          </ol>
          <ButtonLink href="/comparar" variant="secondary" className="mt-7 self-start">
            Comparar mis ofertas
            <ArrowGlyph />
          </ButtonLink>
        </article>

        {/* Tasador */}
        <article id="tasador" aria-labelledby="tasador-title" className="flex flex-col rounded-[1.5rem] bg-night p-6 text-white sm:p-8">
          <h3 id="tasador-title" className="text-2xl font-semibold tracking-[-0.02em]">
            ¿A cuánto lo pongo?
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-night-muted">
            Para cuando vendes o alquilas: tres precios según tu zona, sin datos inventados.
          </p>
          <ul className="mt-6 flex flex-col divide-y divide-night-line">
            {APPRAISALS.map((a) => {
              const Icon = APPRAISAL_ICONS[a.slug];
              return (
                <li key={a.slug}>
                  <Link
                    href={`/tasador/${a.slug}`}
                    className="group flex min-h-16 items-center gap-4 py-3 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-300"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-night-2 text-brand-300">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{a.name}</span>
                      <span className="block text-[13px] text-night-muted">{APPRAISAL_TEXT[a.slug]}</span>
                    </span>
                    <IconArrowRight
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 text-night-muted transition-[transform,color] duration-200 ease-(--ease-out) group-hover:translate-x-1 group-hover:text-white"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </article>
      </div>
    </Section>
  );
}
