// "always": en es-ES, por defecto 3400 sale sin punto y 16.805 con él. Siempre agrupado.
const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });
const num = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0, useGrouping: "always" });
const pct = new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 0 });
const one = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const upToOne = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1, useGrouping: "always" });

export const formatEUR = (v: number) => (Number.isFinite(v) ? eur.format(Math.round(v)) : "—");
export const formatNumber = (v: number) => (Number.isFinite(v) ? num.format(v) : "—");
export const formatPct = (v: number) => (Number.isFinite(v) ? pct.format(v) : "—");
export const formatScore = (v: number) => one.format(v);
/** Cifra con un decimal solo si hace falta: 8,2 €/m², 13 €/m². */
export const formatDecimal = (v: number) => (Number.isFinite(v) ? upToOne.format(v) : "—");

/** €/m²: con decimal en el alquiler (8,2) y sin él en la venta (6.302). */
export const formatUnitPrice = (v: number) => (!Number.isFinite(v) ? "—" : Math.abs(v) >= 100 ? num.format(Math.round(v)) : upToOne.format(v));
export const formatMonths = (v: number) => {
  const n = upToOne.format(Math.max(0, v));
  return `${n} ${v === 1 ? "mes" : "meses"}`;
};

const longDate = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
/** "2026-09-19" → "19 de septiembre de 2026" */
export const formatDate = (iso: string) => longDate.format(new Date(`${iso}T00:00:00Z`));
