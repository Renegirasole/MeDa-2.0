import { cn } from "./cn";

/**
 * Línea de evolución, pequeña y sin ejes: la forma de la subida o la bajada.
 * La cifra exacta va siempre en el texto de al lado; el dibujo es un apoyo, no el dato.
 */
export function Sparkline({
  values,
  labels,
  title,
  className,
}: {
  values: number[];
  labels: string[];
  /** Descripción para quien no ve el dibujo */
  title: string;
  className?: string;
}) {
  if (values.length < 2) return null;
  const w = 320;
  const h = 72;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (values.length - 1);
  const y = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2);
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)},${h} L${x(0).toFixed(1)},${h} Z`;

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[72px] w-full text-brand-600" role="img" aria-label={title} preserveAspectRatio="none">
        <path d={area} fill="currentColor" opacity="0.1" />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="3" fill="currentColor" />
      </svg>
      <figcaption className="flex justify-between text-[12px] text-muted">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </figcaption>
    </figure>
  );
}
