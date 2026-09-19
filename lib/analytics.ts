"use client";

import { track as vercelTrack } from "@vercel/analytics";

/**
 * Único punto de medición. Sin cookies ni datos personales: nunca se envían
 * ingresos, gastos, ahorros ni precios exactos, solo categorías y tramos.
 * Para cambiar de proveedor (p. ej. PostHog) basta con tocar este archivo.
 */
export type AnalyticsEvent =
  | "calculo_empezado"
  | "calculo_completado"
  | "veredicto"
  | "clic_partner"
  | "compartir";

type Props = Record<string, string | number | boolean>;

export function track(event: AnalyticsEvent, props?: Props) {
  try {
    vercelTrack(event, props);
  } catch {
    // La medición nunca debe romper la herramienta.
  }
}
