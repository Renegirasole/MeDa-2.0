/**
 * Comprueba la llave de la API de idealista antes de tocar producción.
 *
 * Uso:
 *   1. Pon IDEALISTA_API_KEY e IDEALISTA_SECRET en .env.local (o en el entorno).
 *   2. npx tsx scripts/probar-idealista.ts [lat] [lng] [venta|alquiler]
 *      Por defecto usa una dirección céntrica de Madrid y modo venta.
 *
 * Dice si la llave funciona, cuántos anuncios hay cerca y qué €/m² saldrían.
 * No escribe nada en la caché ni toca la web.
 */
import { readFileSync } from "node:fs";
import { aggregateListings, RADIUS_M } from "../lib/zonas/portales";
import type { ZoneMode } from "../lib/zonas/tipos";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = /^([A-Z0-9_]+)\s*=\s*"?(.*?)"?$/.exec(line);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    // Sin .env.local: se usan las variables del entorno.
  }
}

async function main() {
  loadEnvLocal();
  const [latArg, lngArg, modeArg] = process.argv.slice(2);
  const lat = Number(latArg ?? 40.4168);
  const lng = Number(lngArg ?? -3.7038);
  const mode: ZoneMode = modeArg === "alquiler" ? "alquiler" : "venta";

  const key = process.env.IDEALISTA_API_KEY;
  const secret = process.env.IDEALISTA_SECRET;
  if (!key || !secret) {
    console.error("Falta IDEALISTA_API_KEY o IDEALISTA_SECRET. Ponlas en .env.local y vuelve a probar.");
    process.exit(1);
  }

  const basic = Buffer.from(`${key}:${secret}`).toString("base64");
  const tokenRes = await fetch("https://api.idealista.com/oauth/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: "grant_type=client_credentials&scope=read",
  });
  if (!tokenRes.ok) {
    console.error(`La llave no vale: el token devuelve ${tokenRes.status}. Revisa que la clave y el secreto estén completos.`);
    process.exit(1);
  }
  const { access_token: token } = (await tokenRes.json()) as { access_token?: string };
  console.log("Llave correcta: token obtenido.");

  const res = await fetch("https://api.idealista.com/3.5/es/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams({
      country: "es",
      operation: mode === "alquiler" ? "rent" : "sale",
      propertyType: "homes",
      center: `${lat},${lng}`,
      distance: String(RADIUS_M),
      maxItems: "50",
      numPage: "1",
      order: "distance",
      sort: "asc",
    }),
  });
  if (!res.ok) {
    console.error(`La búsqueda devuelve ${res.status}. Si es 403, la llave aún no tiene permiso de búsqueda; si es 429, se acabó el cupo de hoy.`);
    process.exit(1);
  }
  const data = (await res.json()) as { total?: number; elementList?: unknown[] };
  const stats = aggregateListings((data.elementList ?? []) as Parameters<typeof aggregateListings>[0]);
  console.log(`Anuncios de ${mode} a menos de ${RADIUS_M} m: ${data.elementList?.length ?? 0} (total en la zona: ${data.total ?? "?"})`);
  if (!stats) {
    console.log("No hay anuncios suficientes en ese punto para dar un precio: el Tasador usaría el dato oficial. Prueba otra coordenada.");
    return;
  }
  const unit = mode === "alquiler" ? "€/m² al mes" : "€/m²";
  console.log(`P25 ${stats.p25} · mediana ${stats.median} · P75 ${stats.p75} ${unit} (${stats.count} anuncios, piso típico de ${stats.medianArea} m²)`);
  console.log("Listo: ya puedes poner las dos variables en Vercel y desplegar.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
