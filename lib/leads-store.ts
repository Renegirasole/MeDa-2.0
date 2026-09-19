import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { del, get, list, put } from "@vercel/blob";
import { CONSENT_VERSION, type Lead, type LeadInput } from "@/lib/leads";

/**
 * Almacén de la lista «Avísame» (solo servidor): Vercel Blob privado en Fráncfort (fra1).
 * Un archivo por persona, con el hash del email como nombre: sin índice que filtre la lista.
 */
const PREFIX = "avisos/";

export const leadsConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export const leadId = (email: string) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex");

function secret() {
  const s = process.env.AVISOS_SECRET;
  if (!s) throw new Error("Falta AVISOS_SECRET");
  return s;
}

/** Firma del enlace de baja: nadie puede dar de baja a otro sin el enlace de su email. */
export const unsubscribeToken = (id: string) => createHmac("sha256", secret()).update(id).digest("hex").slice(0, 32);

export function validUnsubscribe(id: string, token: string) {
  if (!/^[a-f0-9]{64}$/.test(id) || !/^[a-f0-9]{32}$/.test(token)) return false;
  const expected = Buffer.from(unsubscribeToken(id));
  const got = Buffer.from(token);
  return expected.length === got.length && timingSafeEqual(expected, got);
}

async function read(pathname: string): Promise<Lead | null> {
  const res = await get(pathname, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  return JSON.parse(await new Response(res.stream).text()) as Lead;
}

/** Alta o actualización (mismo email = mismo archivo; se queda con el último objetivo). */
export async function saveLead(input: LeadInput): Promise<{ id: string; created: boolean }> {
  const id = leadId(input.email);
  const pathname = `${PREFIX}${id}.json`;
  const now = new Date().toISOString();
  const prev = await read(pathname).catch(() => null);
  const lead: Lead = {
    ...input,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    consent: { version: CONSENT_VERSION, at: now },
  };
  await put(pathname, JSON.stringify(lead), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return { id, created: !prev };
}

export async function deleteLead(id: string) {
  await del(`${PREFIX}${id}.json`);
}

/** Toda la lista, para el envío mensual. */
export async function allLeads(): Promise<Array<Lead & { id: string }>> {
  const out: Array<Lead & { id: string }> = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    for (const b of page.blobs) {
      const lead = await read(b.pathname).catch(() => null);
      if (lead) out.push({ ...lead, id: b.pathname.slice(PREFIX.length, -".json".length) });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}
