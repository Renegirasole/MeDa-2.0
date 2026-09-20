import { NextResponse } from "next/server";
import { MIN_QUERY } from "@/lib/viajes/lugares";
import { searchPlaces } from "@/lib/viajes/fuentes";

/**
 * Ciudades con aeropuerto de todo el mundo.
 *
 *   GET /api/lugares?q=zurich → { places: [...] }
 *
 * Si el proveedor falla se devuelve una lista vacía: el buscador sigue
 * mostrando las ciudades del catálogo y la web no se rompe.
 */

export const runtime = "nodejs";

const CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < MIN_QUERY) return NextResponse.json({ places: [] });

  try {
    const places = await searchPlaces(q);
    return NextResponse.json({ places }, { headers: { "Cache-Control": CACHE } });
  } catch {
    return NextResponse.json({ places: [], error: true });
  }
}
