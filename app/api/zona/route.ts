import { NextResponse } from "next/server";
import { findZone, ZONE_SOURCES } from "@/lib/zonas/datos";
import { buildingDwellings, searchAddresses } from "@/lib/zonas/fuentes";
import { listingStats } from "@/lib/zonas/portales";
import type { ZoneMode } from "@/lib/zonas/tipos";

/**
 * Tasación por zona.
 *
 *   GET /api/zona?q=calle mayor 10 alcala      → direcciones que encajan
 *   GET /api/zona?muni=28079&lat=..&lng=..&rc= → datos de la zona y viviendas del edificio
 *
 * Solo datos públicos y agregados: nada de lo que escribe la persona se guarda.
 */

export const runtime = "nodejs";

const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

const CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const query = p.get("q");

  if (query !== null) {
    try {
      const addresses = await searchAddresses(query);
      return NextResponse.json({ addresses }, { headers: { "Cache-Control": CACHE } });
    } catch {
      return bad("No hemos podido buscar la dirección. Inténtalo en un momento.", 502);
    }
  }

  const muni = p.get("muni") ?? "";
  if (!/^\d{5}$/.test(muni)) return bad("Falta el municipio.");
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  const zone = findZone(muni, Number.isFinite(lat) ? lat : null, Number.isFinite(lng) ? lng : null);
  if (!zone) return bad("No tenemos datos de esa zona.", 404);

  const rc = p.get("rc");
  const mode: ZoneMode = p.get("modo") === "alquiler" ? "alquiler" : "venta";
  // El Catastro se cae a ratos y el portal puede no estar configurado: ninguno es imprescindible.
  const [dwellings, listings] = await Promise.all([
    rc ? buildingDwellings(rc).catch(() => []) : Promise.resolve([]),
    Number.isFinite(lat) && Number.isFinite(lng) ? listingStats(mode, lat, lng).catch(() => null) : Promise.resolve(null),
  ]);

  // La zona va entera: son datos públicos y agregados, y así el precio se recalcula
  // en el navegador mientras se cambian los metros, sin volver a preguntar.
  return NextResponse.json({ zone, dwellings, listings, sources: ZONE_SOURCES }, { headers: { "Cache-Control": CACHE } });
}
