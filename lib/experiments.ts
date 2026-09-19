"use client";

import { useEffect, useState } from "react";

/**
 * Experimentos A/B sin cookies ni almacenamiento.
 * La variante se sortea en cada carga de página y vive solo en memoria: no hace falta
 * consentimiento, a cambio de que alguien que vuelva pueda ver otra variante.
 * Por eso la métrica se mide por visita (cálculos completados / visitas a la calculadora).
 *
 * Ficha de cada experimento: docs/EXPERIMENTOS.md.
 */
export const EXPERIMENTS = {
  /**
   * Hipótesis 1 del plan (ICE 8,0), segunda ronda:
   * «gris»: la nota de ejemplo se ve en gris con «Ejemplo» (lo que hay desde la semana 1, control).
   * «bloqueada»: no se enseña ninguna nota hasta que pones tus números.
   */
  nota_ejemplo: { variants: ["gris", "bloqueada"], active: true },
} as const;

export type ExperimentName = keyof typeof EXPERIMENTS;
export type Variant<E extends ExperimentName> = (typeof EXPERIMENTS)[E]["variants"][number];

const assigned = new Map<ExperimentName, string>();

/** Sorteo 50/50 (o a partes iguales). Inactivo = siempre el control (la primera variante). */
export function assign<E extends ExperimentName>(name: E, random: () => number = Math.random): Variant<E> {
  const exp = EXPERIMENTS[name];
  const prev = assigned.get(name);
  if (prev) return prev as Variant<E>;
  const v = (exp.active ? exp.variants[Math.floor(random() * exp.variants.length)] : exp.variants[0]) as Variant<E>;
  assigned.set(name, v);
  return v;
}

/**
 * Variante en un componente. Durante el render del servidor y la hidratación devuelve null
 * (se pinta el control, así el HTML coincide); justo después, la sorteada.
 */
export function useVariant<E extends ExperimentName>(name: E): Variant<E> | null {
  const [v, setV] = useState<Variant<E> | null>(null);
  useEffect(() => setV(assign(name)), [name]);
  return v;
}
