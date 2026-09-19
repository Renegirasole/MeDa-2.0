import type { FinancialProfile, PurchaseInput } from "@/lib/engine";
import { clamp, safeNumber } from "@/lib/engine";
import { isCategorySlug, type CategorySlug } from "@/lib/data/categories";

export const PROFILE_KEY = "meda:profile:v1";
export const COMBO_KEY = "meda:combo:v1";

export const DEFAULT_PROFILE: FinancialProfile = {
  monthlyIncome: 2100,
  monthlyExpenses: 1050,
  monthlyDebtPayments: 0,
  savings: 8000,
  emergencyMonths: 3,
  upcomingExpenses: 0,
};

const MAX_EUR = 100_000_000;
const eur = (v: unknown) => clamp(safeNumber(v), 0, MAX_EUR);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function parseProfile(v: unknown): FinancialProfile | null {
  if (!isRecord(v)) return null;
  return {
    monthlyIncome: eur(v.monthlyIncome),
    monthlyExpenses: eur(v.monthlyExpenses),
    monthlyDebtPayments: eur(v.monthlyDebtPayments),
    savings: eur(v.savings),
    emergencyMonths: clamp(safeNumber(v.emergencyMonths, 3), 0, 24),
    upcomingExpenses: eur(v.upcomingExpenses),
  };
}

export function parsePurchase(v: unknown): PurchaseInput | null {
  if (!isRecord(v)) return null;
  return {
    price: eur(v.price),
    downPayment: eur(v.downPayment),
    termMonths: clamp(Math.round(safeNumber(v.termMonths)), 0, 480),
    annualRate: clamp(safeNumber(v.annualRate), 0, 40),
    upfrontCosts: eur(v.upfrontCosts),
    monthlyFee: eur(v.monthlyFee),
    monthlyRunningCosts: eur(v.monthlyRunningCosts),
  };
}

export interface ComboItem {
  id: string;
  slug: CategorySlug;
  label: string;
  purchase: PurchaseInput;
}

export function parseCombo(v: unknown): ComboItem[] | null {
  if (!Array.isArray(v)) return null;
  const items: ComboItem[] = [];
  for (const raw of v.slice(0, 10)) {
    if (!isRecord(raw)) continue;
    const purchase = parsePurchase(raw.purchase);
    const slug = typeof raw.slug === "string" ? raw.slug : "";
    if (!purchase || !isCategorySlug(slug)) continue;
    items.push({
      id: typeof raw.id === "string" ? raw.id.slice(0, 40) : crypto.randomUUID(),
      slug,
      label: typeof raw.label === "string" ? raw.label.slice(0, 60) : slug,
      purchase,
    });
  }
  return items;
}
