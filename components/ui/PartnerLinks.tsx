"use client";

import type { OutboundLink } from "@/lib/affiliates";
import { track } from "@/lib/analytics";
import { IconExternal } from "./icons";
import { cn } from "./cn";

/**
 * Monetización visible y honesta: siempre con su etiqueta de partner
 * y la promesa de que no cambia la nota. El primer enlace es el principal.
 */
export function PartnerLinks({
  links,
  title,
  context,
  className,
}: {
  links: OutboundLink[];
  title: string;
  /** Dónde está el bloque (categoría o "viajes"), para la analítica */
  context: string;
  className?: string;
}) {
  if (links.length === 0) return null;
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        <span className="rounded-full bg-subtle px-2 py-0.5 text-[12px] font-medium text-muted">Partners</span>
      </div>
      <ul className="mt-3 flex flex-col divide-y divide-line overflow-hidden rounded-(--radius-control) border border-line">
        {links.map((l, i) => (
          <li key={l.href}>
            <PartnerLinkRow link={l} position={i + 1} context={context} primary={i === 0} />
          </li>
        ))}
      </ul>
      <AffiliateNote className="mt-2.5" />
    </div>
  );
}

/** Un enlace a partner. Se reutiliza en bloques con otra forma (la reserva paso a paso de viajes). */
export function PartnerLinkRow({
  link: l,
  position,
  context,
  primary = false,
  className,
}: {
  link: OutboundLink;
  /** Posición en su bloque, empezando en 1, para la analítica */
  position: number;
  context: string;
  primary?: boolean;
  className?: string;
}) {
  return (
    <a
      href={l.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => track("clic_partner", { partner: l.partner, origen: context, tipo: l.kind, posicion: position })}
      className={cn(
        "group flex min-h-14 items-center justify-between gap-3 bg-surface px-4 py-3 text-ink transition-[background-color,transform] duration-150 ease-(--ease-out) hover:bg-canvas active:scale-[0.99]",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600",
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn("text-[15px] leading-snug", primary && "font-semibold")}>
          {l.label}
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </span>
        <span className="text-[13px] leading-snug text-muted">
          {l.partner}
          {l.detail && <> · {l.detail}</>}
        </span>
      </span>
      <IconExternal
        size={18}
        aria-hidden="true"
        className={cn(
          "shrink-0 transition-transform duration-200 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink",
          primary ? "text-brand-700" : "text-muted",
        )}
      />
    </a>
  );
}

export function AffiliateNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-[12px] leading-snug text-muted", className)}>
      Enlaces de afiliado: si compras o pides información, podemos recibir una comisión sin coste para ti. Por eso los
      partners con los que tenemos acuerdo salen primero. Tu nota no cambia nunca.
    </p>
  );
}
