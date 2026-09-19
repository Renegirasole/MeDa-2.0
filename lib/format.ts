// "always": en es-ES, por defecto 3400 sale sin punto y 16.805 con él. Siempre agrupado.
const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });
const num = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0, useGrouping: "always" });
const pct = new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 0 });
const one = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const upToOne = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

export const formatEUR = (v: number) => (Number.isFinite(v) ? eur.format(Math.round(v)) : "—");
export const formatNumber = (v: number) => (Number.isFinite(v) ? num.format(v) : "—");
export const formatPct = (v: number) => (Number.isFinite(v) ? pct.format(v) : "—");
export const formatScore = (v: number) => one.format(v);
export const formatMonths = (v: number) => {
  const n = upToOne.format(Math.max(0, v));
  return `${n} ${v === 1 ? "mes" : "meses"}`;
};

const longDate = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
/** "2026-09-19" → "19 de septiembre de 2026" */
export const formatDate = (iso: string) => longDate.format(new Date(`${iso}T00:00:00Z`));
