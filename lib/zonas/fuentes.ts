import type { Address, Dwelling } from "./tipos";

/**
 * Servicios públicos que consultamos en el momento (solo servidor):
 *
 * - CartoCiudad (Instituto Geográfico Nacional): la dirección en coordenadas, municipio INE
 *   y referencia catastral del portal.
 * - Sede del Catastro (OVC): las viviendas del edificio con su superficie construida y su año.
 *
 * Ninguno pide clave. Guardamos la respuesta un día para no molestarles con lo mismo.
 */

const DAY = 60 * 60 * 24;
const TIMEOUT = 6000;

async function getJson(url: string, revalidate = DAY): Promise<unknown> {
  const res = await fetch(url, {
    // CartoCiudad responde 406 si se pide application/json: hay que aceptar cualquier cosa.
    headers: { Accept: "*/*", "User-Agent": "MeDa (https://medaono.com)" },
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const text = await res.text();
  // CartoCiudad responde en JSONP aunque no se pida: callback([...]).
  const json = text.startsWith("callback(") ? text.slice(9, text.lastIndexOf(")")) : text;
  return JSON.parse(json);
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

interface Candidate {
  id?: unknown;
  address?: unknown;
  muni?: unknown;
  muniCode?: unknown;
  province?: unknown;
  postalCode?: unknown;
  lat?: unknown;
  lng?: unknown;
  refCatastral?: unknown;
  type?: unknown;
}

const plain = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * CartoCiudad ordena por parecido con la calle y a veces deja la ciudad correcta abajo.
 * Cuenta cuántas palabras de la búsqueda aparecen también en el municipio o la provincia.
 */
function score(query: string, a: Address): number {
  const words = plain(query).split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  const where = plain(`${a.muniName} ${a.provName} ${a.postalCode}`);
  return words.filter((w) => where.includes(w)).length;
}

/** Direcciones que encajan con lo que ha escrito la persona. */
export async function searchAddresses(query: string, limit = 6): Promise<Address[]> {
  const q = query.trim();
  if (q.length < 4) return [];
  const url = `https://www.cartociudad.es/geocoder/api/geocoder/candidatesJsonp?q=${encodeURIComponent(q)}&limit=${limit * 4}`;
  const raw = await getJson(url);
  if (!Array.isArray(raw)) return [];
  const out: Address[] = [];
  for (const c of raw as Candidate[]) {
    const lat = num(c.lat);
    const lng = num(c.lng);
    const muniCode = str(c.muniCode);
    // Solo direcciones: CartoCiudad también devuelve estancos, monumentos y topónimos.
    const type = str(c.type).toLowerCase();
    if (lat === null || lng === null || muniCode.length !== 5 || (type !== "portal" && type !== "callejero")) continue;
    const ref = str(c.refCatastral);
    out.push({
      id: str(c.id) || `${lat},${lng}`,
      label: str(c.address) || str(c.muni),
      muniCode,
      muniName: str(c.muni),
      provName: str(c.province),
      postalCode: str(c.postalCode),
      lat,
      lng,
      refCatastral: ref.length >= 14 ? ref.slice(0, 14) : null,
    });
  }
  return out
    .map((a, i) => ({ a, i, s: score(q, a) }))
    .sort((x, y) => y.s - x.s || x.i - y.i)
    .slice(0, limit)
    .map((x) => x.a);
}

const FLOORS: Record<string, string> = { BJ: "bajo", EN: "entreplanta", SM: "semisótano", ST: "sótano", AT: "ático", PR: "principal" };

function floorLabel(pt: string): string {
  if (!pt) return "";
  const known = FLOORS[pt.toUpperCase()];
  if (known) return known;
  const n = Number(pt);
  return Number.isFinite(n) ? (n === 0 ? "bajo" : `${n}º`) : pt;
}

interface CatastroUnit {
  rc?: { pc1?: unknown; pc2?: unknown; car?: unknown; cc1?: unknown; cc2?: unknown };
  dt?: { locs?: { lous?: { lourb?: { loint?: { es?: unknown; pt?: unknown; pu?: unknown } } } }; lourb?: { loint?: { es?: unknown; pt?: unknown; pu?: unknown } } };
  debi?: { luso?: unknown; sfc?: unknown; ant?: unknown };
}

function toDwelling(u: CatastroUnit): Dwelling | null {
  const rc = u.rc ?? {};
  const ref = [rc.pc1, rc.pc2, rc.car, rc.cc1, rc.cc2].map(str).join("");
  const area = Number(str(u.debi?.sfc));
  const use = str(u.debi?.luso);
  if (ref.length < 14 || !Number.isFinite(area) || area <= 0) return null;
  const loint = u.dt?.locs?.lous?.lourb?.loint ?? u.dt?.lourb?.loint ?? {};
  const stair = str(loint.es);
  const floor = floorLabel(str(loint.pt));
  const door = str(loint.pu);
  const year = Number(str(u.debi?.ant));
  const parts = [stair && stair !== "1" ? `Esc. ${stair}` : "", floor, door ? `puerta ${door}` : ""].filter(Boolean);
  return {
    ref,
    label: parts.join(" · ") || "Vivienda única",
    floor,
    door,
    area: Math.round(area),
    year: Number.isFinite(year) && year > 1500 ? year : null,
    use,
  };
}

/** Viviendas del edificio según Catastro, de la planta más baja a la más alta. */
export async function buildingDwellings(refCatastral: string): Promise<Dwelling[]> {
  const rc = refCatastral.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z0-9]{14}$/.test(rc)) return [];
  const url = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC?RefCat=${rc}`;
  const raw = (await getJson(url)) as { consulta_dnprcResult?: { lrcdnp?: { rcdnp?: CatastroUnit[] }; bico?: { bi?: CatastroUnit } } };
  const result = raw?.consulta_dnprcResult;
  const units = result?.lrcdnp?.rcdnp ?? (result?.bico?.bi ? [result.bico.bi] : []);
  const homes = units
    .map(toDwelling)
    .filter((d): d is Dwelling => d !== null && /residencial|vivienda/i.test(d.use));
  // Trasteros y garajes se cuelan como residencial: fuera lo que no puede ser una vivienda.
  return homes.filter((d) => d.area >= 25).slice(0, 120);
}
