import type { FinancialProfile, PurchaseInput } from "@/lib/engine";
import { parseProfile, parsePurchase } from "@/lib/storage/profile";

/**
 * Compartir sin servidor: los datos viajan codificados en la URL.
 * Por privacidad, el perfil solo se incluye si el usuario lo elige.
 */
export interface SharePayload {
  purchase: PurchaseInput;
  profile?: FinancialProfile;
}

const toBase64Url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export function encodeShare(payload: SharePayload): string {
  return toBase64Url(JSON.stringify({ p: payload.purchase, f: payload.profile }));
}

export function decodeShare(token: string | undefined | null): SharePayload | null {
  if (!token || token.length > 2000) return null;
  try {
    const raw: unknown = JSON.parse(fromBase64Url(token));
    if (typeof raw !== "object" || raw === null) return null;
    const r = raw as Record<string, unknown>;
    const purchase = parsePurchase(r.p);
    if (!purchase) return null;
    const profile = r.f === undefined ? undefined : parseProfile(r.f) ?? undefined;
    return { purchase, profile };
  } catch {
    return null;
  }
}
