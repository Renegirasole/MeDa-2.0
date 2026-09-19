import { VERDICT_THRESHOLDS, type Verdict } from "@/lib/engine";
import { VERDICT_COPY } from "@/lib/copy";
import { formatScore } from "@/lib/format";
import { cn } from "./cn";

type Tone = "leaf" | "caution" | "alert";

const TONES: Record<Tone, { text: string; textNight: string; fill: string; soft: string; ring: string }> = {
  leaf: { text: "text-brand-700", textNight: "text-brand-300", fill: "bg-brand-500", soft: "bg-brand-50 text-brand-700", ring: "border-brand-500" },
  caution: { text: "text-caution-700", textNight: "text-caution-300", fill: "bg-caution-500", soft: "bg-caution-50 text-caution-700", ring: "border-caution-500" },
  alert: { text: "text-alert-700", textNight: "text-alert-300", fill: "bg-alert-500", soft: "bg-alert-50 text-alert-700", ring: "border-alert-500" },
};

export const toneFor = (v: Verdict) => TONES[VERDICT_COPY[v].tone];

/** Tono para una subnota de 0 a 10 (factores, planes). */
export const toneForScore = (score: number) => TONES[score >= 7 ? "leaf" : score >= 4 ? "caution" : "alert"];

/**
 * Zonas de la escala, sacadas de los umbrales del motor:
 * 0–5 "Mejor espera", 5–7 "Justo", 7–10 "Te da".
 */
const threshold = (v: Verdict) => VERDICT_THRESHOLDS.find(([, verdict]) => verdict === v)?.[0] ?? 0;
const ZONES = [
  { from: 0, to: threshold("tight"), label: "Mejor espera", tone: "alert" as Tone },
  { from: threshold("tight"), to: threshold("yes"), label: "Justo", tone: "caution" as Tone },
  { from: threshold("yes"), to: 10, label: "Te da", tone: "leaf" as Tone },
];

const ZONE_BG: Record<"light" | "night", Record<Tone, string>> = {
  light: { alert: "bg-alert-50", caution: "bg-caution-50", leaf: "bg-brand-50" },
  night: { alert: "bg-alert-300/30", caution: "bg-caution-300/30", leaf: "bg-brand-300/30" },
};

interface Props {
  score: number;
  verdict: Verdict;
  tone?: "light" | "night";
  size?: "md" | "lg";
  /** Muestra los nombres de las zonas bajo la regla */
  labels?: boolean;
  /** Nota calculada con datos de ejemplo: se pinta en gris para que no parezca tuya */
  muted?: boolean;
  className?: string;
}

/** La Escala MeDa: nota, veredicto y dónde caes respecto a los umbrales. */
export function ScoreScale({ score, verdict, tone = "light", size = "lg", labels = true, muted = false, className }: Props) {
  const t = toneFor(verdict);
  const night = tone === "night";
  const clamped = Math.min(10, Math.max(0, score));
  return (
    <div className={className} role="img" aria-label={`${muted ? "Ejemplo: " : ""}Nota ${formatScore(score)} sobre 10: ${VERDICT_COPY[verdict].label}`}>
      <div className="flex items-end justify-between gap-4">
        <p className={cn("font-semibold tracking-[-0.02em]", size === "lg" ? "text-2xl md:text-[1.75rem]" : "text-xl", "transition-colors duration-200", muted ? "text-muted" : night ? t.textNight : t.text)}>
          {VERDICT_COPY[verdict].label}
        </p>
        <p className={cn("num flex items-baseline gap-1 leading-none transition-colors duration-200", muted ? "text-muted" : night ? "text-white" : "text-ink")}>
          {/* key: al cambiar la nota, la cifra entra con un fundido corto (solo opacidad) */}
          <span key={formatScore(score)} className={cn("animate-num font-semibold tracking-[-0.05em]", size === "lg" ? "text-[3.5rem] md:text-[4rem]" : "text-[2.75rem]")}>
            {formatScore(score)}
          </span>
          <span className={cn("text-lg", night ? "text-night-muted" : "text-muted")}>/10</span>
        </p>
      </div>

      <div className="mt-5 overflow-x-clip px-2 py-1" aria-hidden="true">
        <div className="relative">
          <div className="flex h-2.5 gap-[3px]">
            {ZONES.map((z) => (
              <span key={z.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", ZONE_BG[tone][z.tone])} style={{ flexGrow: z.to - z.from }} />
            ))}
          </div>
          {/* Capa a lo ancho que se desplaza: el marcador queda en su borde izquierdo */}
          <div
            className="absolute inset-0 transition-transform duration-300 ease-(--ease-out)"
            style={{ transform: `translateX(${clamped * 10}%)` }}
          >
            <span
              className={cn(
                "absolute top-1/2 left-0 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-white shadow-[0_2px_6px_rgb(13_23_18/0.25)] transition-colors duration-200",
                muted ? "border-line-strong" : t.ring,
              )}
            />
          </div>
        </div>
        {labels && (
          <div className={cn("mt-2.5 flex gap-[3px] text-[12px]", night ? "text-night-muted" : "text-muted")}>
            {ZONES.map((z) => (
              <span key={z.label} style={{ flexGrow: z.to - z.from }} className="basis-0 truncate">
                {z.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function VerdictPill({ verdict, score, className }: { verdict: Verdict; score?: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold transition-colors duration-200",
        toneFor(verdict).soft,
        className,
      )}
    >
      {score !== undefined && <span className="num">{formatScore(score)}</span>}
      {score !== undefined && <span aria-hidden="true" className="opacity-50">·</span>}
      {VERDICT_COPY[verdict].label}
    </span>
  );
}

/** La Escala en miniatura (barra móvil): tres zonas y el punto en la nota. Decorativa: la nota va en texto al lado. */
export function MiniScale({ score, verdict, muted = false, className }: { score: number; verdict: Verdict; muted?: boolean; className?: string }) {
  const clamped = Math.min(10, Math.max(0, score));
  return (
    <span aria-hidden="true" className={cn("relative flex h-1.5 w-14 shrink-0 gap-px", className)}>
      {ZONES.map((z) => (
        <span key={z.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", muted ? "bg-night-line" : ZONE_BG.night[z.tone])} style={{ flexGrow: z.to - z.from }} />
      ))}
      <span className="absolute inset-0 transition-transform duration-300 ease-(--ease-out)" style={{ transform: `translateX(${clamped * 10}%)` }}>
        <span className={cn("absolute top-1/2 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white", muted ? "border-night-muted" : toneFor(verdict).ring)} />
      </span>
    </span>
  );
}
