import { isCategorySlug, type CategorySlug } from "@/lib/data/categories";

/**
 * «Avísame cuando me dé»: lista de email con consentimiento.
 * Solo guardamos el email y el objetivo (qué y cuánto). Nunca ingresos, gastos ni ahorros.
 */

/** Versión del texto de consentimiento. Si cambia el texto, cambia la versión. */
export const CONSENT_VERSION = "2026-09-19";
export const CONSENT_TEXT =
  "Acepto que MeDa me escriba una vez al mes para recordarme este objetivo. Puedo darme de baja en cualquier momento.";

export interface LeadInput {
  email: string;
  category: CategorySlug;
  /** Precio o cuota mensual del objetivo, en euros */
  amount: number;
}

export interface Lead extends LeadInput {
  createdAt: string;
  updatedAt: string;
  consent: { version: string; at: string };
}

export type LeadError = "email" | "consent" | "category" | "amount" | "bot";

// Suficiente para detectar errores de tecleo; la prueba real es que el email llegue.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Valida lo que llega del formulario. `website` es un campo trampa: solo lo rellenan los bots. */
export function parseLead(raw: unknown): { ok: true; lead: LeadInput } | { ok: false; error: LeadError } {
  if (typeof raw !== "object" || raw === null) return { ok: false, error: "email" };
  const r = raw as Record<string, unknown>;
  if (typeof r.website === "string" && r.website.trim() !== "") return { ok: false, error: "bot" };
  const email = typeof r.email === "string" ? r.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) return { ok: false, error: "email" };
  if (r.consent !== true) return { ok: false, error: "consent" };
  if (typeof r.category !== "string" || !isCategorySlug(r.category)) return { ok: false, error: "category" };
  const amount = Number(r.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) return { ok: false, error: "amount" };
  return { ok: true, lead: { email, category: r.category, amount: Math.round(amount) } };
}

export const LEAD_ERROR_COPY: Record<Exclude<LeadError, "bot">, string> = {
  email: "Revisa el email: parece que falta algo.",
  consent: "Marca la casilla para que podamos escribirte.",
  category: "Algo ha fallado con el objetivo. Recarga la página y prueba otra vez.",
  amount: "Algo ha fallado con el importe. Recarga la página y prueba otra vez.",
};
