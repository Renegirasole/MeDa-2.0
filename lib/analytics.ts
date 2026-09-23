"use client";

import { track as vercelTrack } from "@vercel/analytics";
import { SITE } from "@/lib/site";

/**
 * Único punto de medición. Sin cookies ni datos personales: nunca se envían
 * ingresos, gastos, ahorros ni precios exactos, solo categorías y tramos.
 *
 * Destinos:
 * - Vercel Analytics (siempre). En el plan Hobby solo cuenta visitas, no estos eventos.
 * - PostHog, si existe NEXT_PUBLIC_POSTHOG_KEY. Sin cookies ni almacenamiento: cada carga de
 *   página es un visitante anónimo nuevo y no se crean perfiles de persona.
 * - Google Ads, solo el clic a partner y solo si hay campaña configurada.
 */
export type AnalyticsEvent =
  | "calculo_empezado"
  | "calculo_completado"
  | "veredicto"
  | "clic_partner"
  | "compartir"
  | "experimento_visto"
  | "lista_email";

type Props = Record<string, string | number | boolean>;

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com").replace(/\/$/, "");

export const posthogEnabled = POSTHOG_KEY !== "";

/** Identificador anónimo que vive solo en memoria: se pierde al recargar. */
let visitId: string | null = null;
function anonymousId() {
  visitId ??= typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `v-${Date.now()}-${Math.random()}`;
  return visitId;
}

function sendPosthog(event: string, props?: Props) {
  if (!posthogEnabled || typeof window === "undefined") return;
  const body = JSON.stringify({
    api_key: POSTHOG_KEY,
    event,
    distinct_id: anonymousId(),
    timestamp: new Date().toISOString(),
    properties: {
      ...props,
      $process_person_profile: false,
      $current_url: window.location.origin + window.location.pathname,
      $pathname: window.location.pathname,
      $referring_domain: document.referrer ? new URL(document.referrer).hostname : "$direct",
    },
  });
  const url = `${POSTHOG_HOST}/i/v0/e/`;
  // sendBeacon sobrevive a los clics que cambian de página (partners).
  if (!navigator.sendBeacon?.(url, new Blob([body], { type: "text/plain" }))) {
    void fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** La conversión que importa para Ads es el clic a partner: es lo único que monetiza. */
const ADS_CONVERSION =
  SITE.googleAdsId && SITE.googleAdsPartnerLabel ? `${SITE.googleAdsId}/${SITE.googleAdsPartnerLabel}` : "";

function sendGoogleAds(event: AnalyticsEvent, props?: Props) {
  if (event !== "clic_partner" || !ADS_CONVERSION || typeof window === "undefined") return;
  window.gtag?.("event", "conversion", { send_to: ADS_CONVERSION, partner: props?.partner, origen: props?.origen });
}

export function track(event: AnalyticsEvent, props?: Props) {
  try {
    vercelTrack(event, props);
    sendPosthog(event, props);
    sendGoogleAds(event, props);
  } catch {
    // La medición nunca debe romper la herramienta.
  }
}

/** Visita a una página (PostHog necesita las suyas para los embudos; Vercel ya las cuenta solo). */
export function trackPageview() {
  try {
    sendPosthog("$pageview");
  } catch {
    // Igual que arriba.
  }
}
