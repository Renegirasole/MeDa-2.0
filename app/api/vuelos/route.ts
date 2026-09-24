import { NextResponse } from "next/server";
import { flightPrice } from "@/lib/viajes/fuentes";

/**
 * Precio real de vuelo ida y vuelta, por persona.
 *
 *   GET /api/vuelos?o=SVQ&d=ROM&ida=2026-10-15&vuelta=2026-10-18
 *     → { flight: { perPerson, exactDates, ... } | null }
 *
 * Primero las fechas exactas; si no hay datos, el más barato de ese mes. Sin
 * `TRAVELPAYOUTS_TOKEN`, o sin datos de la ruta, devuelve null y el
 * planificador se queda con su estimación.
 */

export const runtime = "nodejs";

const IATA = /^[A-Z]{3}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const from = (p.get("o") ?? "").toUpperCase();
  const to = (p.get("d") ?? "").toUpperCase();
  const depart = p.get("ida") ?? "";
  const ret = p.get("vuelta") ?? "";
  if (!IATA.test(from) || !IATA.test(to) || from === to) return NextResponse.json({ flight: null });
  const dates = DAY.test(depart) && DAY.test(ret) ? ([depart, ret] as const) : ([undefined, undefined] as const);

  try {
    const flight = await flightPrice(from, to, ...dates);
    return NextResponse.json({ flight }, { headers: { "Cache-Control": CACHE } });
  } catch {
    return NextResponse.json({ flight: null });
  }
}
