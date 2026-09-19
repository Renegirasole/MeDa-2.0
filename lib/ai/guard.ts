import type { Facts } from "./facts";

/**
 * Verifica que el texto de la IA no contiene cifras que no estén en los datos.
 * Si hay una sola cifra nueva, se descarta la respuesta entera.
 */
const NUMBER_RE = /\d+(?:[.,\s]\d{3})*(?:[.,]\d+)?/g;
const ALWAYS_ALLOWED = new Set(["10", "12"]);

const normalize = (token: string) => token.replace(/[\s.]/g, "").replace(",", ".").replace(/\.0+$/, "");

export function allowedNumbers(facts: Facts): Set<string> {
  const set = new Set(ALWAYS_ALLOWED);
  for (const value of Object.values(facts)) {
    for (const m of value.match(NUMBER_RE) ?? []) set.add(normalize(m));
  }
  return set;
}

export interface GuardResult {
  ok: boolean;
  unknown: string[];
}

export function verifyNumbers(text: string, facts: Facts): GuardResult {
  const allowed = allowedNumbers(facts);
  const unknown = (text.match(NUMBER_RE) ?? []).map(normalize).filter((n) => !allowed.has(n));
  return { ok: unknown.length === 0, unknown };
}

export function sanitizeAiText(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*#_`>]/g, "")
    .trim()
    .slice(0, 1200);
}
