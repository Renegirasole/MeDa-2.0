import { NextResponse } from "next/server";
import { flightPrice } from "@/lib/viajes/fuentes";

/**
 * Precio real de vuelo ida y vuelta, por persona.
 *
 *   GET /api/vuelos?o=MAD&d=ROM → { flight: { perPerson, month, ... } | null }
 *
 * Sin `TRAVELPAYOUTS_TOKEN`, o si no hay datos de esa ruta, devuelve null y el
 * planificador se queda con su estimación por distancia.
 */

export const runtime = "nodejs";

const IATA = /^[A-Z]{3}$/;
const CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const from = (p.get("o") ?? "").toUpperCase();
  const to = (p.get("d") ?? "").toUpperCase();
  if (!IATA.test(from) || !IATA.test(to) || from === to) return NextResponse.json({ flight: null });

  try {
    const flight = await flightPrice(from, to);
    return NextResponse.json({ flight }, { headers: { "Cache-Control": CACHE } });
  } catch {
    return NextResponse.json({ flight: null });
  }
}
