"use client";

import { useMemo, useState } from "react";
import { appraiseByArea, appraiseByKm, MIN_COMPARABLES } from "@/lib/engine";
import { APPRAISAL_BY_SLUG, type AppraisalSlug } from "@/lib/data/appraisal";
import { formatEUR, formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/Field";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import { Step } from "./Step";

interface Row {
  id: number;
  price: number;
  measure: number;
}

const emptyRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i, price: 0, measure: 0 }));

export function Appraiser({ slug }: { slug: AppraisalSlug }) {
  const cfg = APPRAISAL_BY_SLUG[slug];
  const [subject, setSubject] = useState(0);
  const [rows, setRows] = useState<Row[]>(emptyRows(MIN_COMPARABLES));
  const measureLabel = cfg.mode === "area" ? "Metros" : "Kilómetros";
  const measureSuffix = cfg.mode === "area" ? "m²" : "km";

  const result = useMemo(() => {
    if (cfg.mode === "area") return appraiseByArea(rows.map((r) => ({ price: r.price, area: r.measure })), subject, cfg.roundStep);
    return appraiseByKm(rows.map((r) => ({ price: r.price, km: r.measure })), subject, cfg.roundStep);
  }, [cfg, rows, subject]);

  const filled = rows.filter((r) => r.price > 0 && (cfg.mode === "km" || r.measure > 0)).length;
  const unit = cfg.priceSuffix === "€/mes" ? " al mes" : "";
  const progress = Math.min(1, filled / MIN_COMPARABLES);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        <Step n={1} title={cfg.mode === "area" ? "Tu piso" : "Tu coche"}>
          <NumberField label={cfg.subjectLabel} suffix={measureSuffix} value={subject} onChange={setSubject} size="lg" className="max-w-sm" />
        </Step>

        <Step n={2} title="Anuncios parecidos de tu zona">
          <p className="-mt-2 mb-6 max-w-xl text-[15px] leading-relaxed text-muted">
            {cfg.mode === "area"
              ? "Busca pisos parecidos en tu barrio y apunta precio y metros. Con 3 vale; con 6 o más, mejor."
              : "Busca el mismo modelo y año, y apunta precio y kilómetros. Con 3 vale; con 6 o más, mejor."}
          </p>
          <ol className="flex flex-col gap-4">
            {rows.map((r, i) => (
              <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-3">
                <NumberField
                  label={`${cfg.priceLabel} ${i + 1}`}
                  suffix={cfg.priceSuffix}
                  value={r.price}
                  onChange={(v) => setRows((p) => p.map((x) => (x.id === r.id ? { ...x, price: v } : x)))}
                />
                <NumberField
                  label={measureLabel}
                  suffix={measureSuffix}
                  value={r.measure}
                  onChange={(v) => setRows((p) => p.map((x) => (x.id === r.id ? { ...x, measure: v } : x)))}
                />
                <button
                  type="button"
                  onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}
                  disabled={rows.length <= MIN_COMPARABLES}
                  aria-label={`Quitar anuncio ${i + 1}`}
                  className="mb-0.5 inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-alert-50 hover:text-alert-700 focus-visible:outline-2 focus-visible:outline-brand-600 disabled:opacity-30"
                >
                  <IconTrash size={18} />
                </button>
              </li>
            ))}
          </ol>
          {rows.length < 12 && (
            <Button variant="tertiary" className="mt-4 -ml-4" onClick={() => setRows((p) => [...p, { id: Date.now(), price: 0, measure: 0 }])}>
              <IconPlus size={18} aria-hidden="true" />
              Añadir anuncio
            </Button>
          )}
        </Step>
      </div>

      <Card className="p-5 sm:p-7 lg:sticky lg:top-24" aria-live="polite">
        <p className="text-[13px] font-medium text-muted">Tu precio</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">{cfg.question}</h2>
        {result ? (
          <>
            <dl className="mt-6 flex flex-col divide-y divide-line">
              {[
                { label: "Para vender rápido", value: result.quick },
                { label: "Precio de mercado", value: result.market, main: true },
                { label: "Si no tienes prisa", value: result.ambitious },
              ].map((x) => (
                <div key={x.label} className={cn("flex items-baseline justify-between gap-4", x.main ? "py-5" : "py-3.5")}>
                  <dt className={x.main ? "font-medium text-ink" : "text-[15px] text-muted"}>{x.label}</dt>
                  <dd className={cn("num tracking-[-0.03em] text-ink", x.main ? "text-[2.25rem] font-semibold" : "text-xl font-medium")}>
                    {formatEUR(x.value)}
                    {unit && <span className="text-sm font-normal tracking-normal text-muted">{unit}</span>}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-line pt-4 text-[14px] leading-relaxed text-muted">
              {cfg.mode === "area" && result.unitPrice !== null
                ? `Calculado con ${result.used} anuncios. En tu zona se pide una mediana de ${formatNumber(result.unitPrice)} € por m².`
                : `Calculado con ${result.used} anuncios, ajustando por kilómetros.`}{" "}
              Los precios de anuncio suelen estar algo por encima del precio final de cierre.
            </p>
          </>
        ) : (
          <div className="mt-6">
            <div className="h-1.5 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
              <div
                className="h-full w-full origin-left rounded-full bg-brand-500 transition-transform duration-300 ease-(--ease-out)"
                style={{ transform: `scaleX(${Math.max(0.02, subject > 0 ? progress : 0)})` }}
              />
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
              {subject <= 0
                ? `Empieza por los ${cfg.mode === "area" ? "metros de tu piso" : "kilómetros de tu coche"}.`
                : `Añade al menos ${MIN_COMPARABLES} anuncios completos. Llevas ${filled}.`}
            </p>
            <p className="mt-2 text-[13px] text-muted">Solo usamos los anuncios que metes: sin datos inventados.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
