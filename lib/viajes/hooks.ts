"use client";

import { useEffect, useState } from "react";
import { isPlace, MIN_QUERY, normalize, type Place } from "./lugares";
import type { FlightPrice } from "./fuentes";

/** Estado de la búsqueda de ciudades del mundo mientras se escribe. */
export type PlacesState = { status: "idle" } | { status: "loading" } | { status: "ok"; places: Place[] } | { status: "error" };

const DEBOUNCE_MS = 250;
const placeCache = new Map<string, Place[]>();

/** Busca ciudades con aeropuerto en /api/lugares, con retardo para no lanzar una petición por tecla. */
export function usePlaces(text: string): PlacesState {
  const term = text.trim();
  const key = term.length >= MIN_QUERY ? normalize(term) : null;
  const [result, setResult] = useState<{ key: string; value: PlacesState } | null>(null);

  useEffect(() => {
    if (!key || placeCache.has(key)) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/lugares?q=${encodeURIComponent(key)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((json: { places?: unknown; error?: boolean }) => {
          if (json.error) {
            setResult({ key, value: { status: "error" } });
            return;
          }
          const places = Array.isArray(json.places) ? json.places.filter(isPlace) : [];
          placeCache.set(key, places);
          setResult({ key, value: { status: "ok", places } });
        })
        .catch((e: unknown) => {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setResult({ key, value: { status: "error" } });
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key]);

  if (!key) return { status: "idle" };
  const cached = placeCache.get(key);
  if (cached) return { status: "ok", places: cached };
  if (!result || result.key !== key) return { status: "loading" };
  return result.value;
}

const flightCache = new Map<string, FlightPrice | null>();

/**
 * Precio real de vuelo de la ruta, si lo hay. Nunca bloquea el cálculo: la
 * estimación se muestra igual mientras llega (o si no llega nunca).
 */
export function useFlightPrice(from: string | undefined, to: string | undefined, enabled: boolean): FlightPrice | null {
  const key = enabled && from && to && from !== to ? `${from}-${to}` : null;
  const [price, setPrice] = useState<{ key: string; value: FlightPrice | null } | null>(null);

  useEffect(() => {
    if (!key) return;
    if (flightCache.has(key)) {
      setPrice({ key, value: flightCache.get(key) ?? null });
      return;
    }
    const controller = new AbortController();
    const [o, d] = key.split("-");
    fetch(`/api/vuelos?o=${o}&d=${d}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json: { flight?: FlightPrice | null }) => {
        const value = json.flight && typeof json.flight.perPerson === "number" ? json.flight : null;
        flightCache.set(key, value);
        setPrice({ key, value });
      })
      .catch(() => setPrice({ key, value: null }));
    return () => controller.abort();
  }, [key]);

  return key && price?.key === key ? price.value : null;
}
