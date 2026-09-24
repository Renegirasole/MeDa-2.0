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

export type FlightState = { status: "idle" } | { status: "loading" } | { status: "ok"; flight: FlightPrice } | { status: "none" };

/**
 * Precio real de vuelo de la ruta y las fechas, si lo hay. Nunca bloquea el
 * cálculo: la estimación se enseña igual mientras llega (o si no llega).
 */
export function useFlightPrice(q: { from?: string | null; to?: string | null; depart: string; ret: string; enabled: boolean }): FlightState {
  const key = q.enabled && q.from && q.to && q.from !== q.to ? `${q.from}-${q.to}-${q.depart}-${q.ret}` : null;
  const [result, setResult] = useState<{ key: string; value: FlightPrice | null } | null>(null);

  useEffect(() => {
    if (!key || flightCache.has(key)) return;
    const controller = new AbortController();
    const [o, d, depart, ret] = [q.from, q.to, q.depart, q.ret];
    const params = new URLSearchParams({ o: o ?? "", d: d ?? "", ida: depart, vuelta: ret });
    fetch(`/api/vuelos?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json: { flight?: FlightPrice | null }) => {
        const value = json.flight && typeof json.flight.perPerson === "number" && json.flight.perPerson > 0 ? json.flight : null;
        flightCache.set(key, value);
        setResult({ key, value });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setResult({ key, value: null });
      });
    return () => controller.abort();
    // `key` ya lleva la ruta y las fechas: es todo lo que usa el efecto.
  }, [key]);

  if (!key) return { status: "idle" };
  const cached = flightCache.has(key) ? flightCache.get(key) : result?.key === key ? result.value : undefined;
  if (cached === undefined) return { status: "loading" };
  return cached ? { status: "ok", flight: cached } : { status: "none" };
}
