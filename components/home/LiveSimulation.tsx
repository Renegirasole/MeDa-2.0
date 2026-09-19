"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { evaluateOne } from "@/lib/engine";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { LIVE_EXAMPLE } from "@/lib/data/examples";
import { DEFAULT_PROFILE } from "@/lib/storage/profile";
import { encodeShare } from "@/lib/share";
import { formatEUR, formatNumber, formatPct } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { ScoreScale } from "@/components/ui/ScoreScale";
import { Stat } from "@/components/ui/Stat";

const car = CATEGORY_BY_SLUG.coche;

/** Cifra editable dentro de una frase: se entiende sin formulario. */
function InlineNumber({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const shown = draft ?? formatNumber(value);
  return (
    <input
      ref={ref}
      aria-label={label}
      inputMode="numeric"
      autoComplete="off"
      value={shown}
      style={{ width: `${Math.max(3, shown.length) + 1.2}ch` }}
      onFocus={() => {
        setDraft(String(value));
        requestAnimationFrame(() => ref.current?.select());
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
        setDraft(raw);
        onChange(Number(raw) || 0);
      }}
      onBlur={() => setDraft(null)}
      className="num mx-0.5 rounded-lg border-b-2 border-brand-300/70 bg-white/8 px-1 text-center font-semibold text-white outline-none transition-colors duration-150 hover:bg-white/12 focus:border-brand-300 focus:bg-white/15"
    />
  );
}

export function LiveSimulation() {
  const [income, setIncome] = useState(DEFAULT_PROFILE.monthlyIncome);
  const [expenses, setExpenses] = useState(DEFAULT_PROFILE.monthlyExpenses);
  const [savings, setSavings] = useState(DEFAULT_PROFILE.savings);
  const [price, setPrice] = useState<number>(LIVE_EXAMPLE.price);

  const profile = useMemo(
    () => ({ ...DEFAULT_PROFILE, monthlyIncome: income, monthlyExpenses: expenses, savings }),
    [income, expenses, savings],
  );
  const purchase = useMemo(() => ({ ...car.defaults, price }), [price]);
  const result = useMemo(() => evaluateOne(profile, purchase, car.guideline), [profile, purchase]);
  const href = `/calculadoras/coche#s=${encodeShare({ purchase, profile })}`;

  return (
    <Card tone="night" className="relative overflow-hidden p-6 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[13px] font-medium text-night-muted">Simulación en vivo</h2>
          <span className="flex items-center gap-1.5 text-[12px] text-night-muted">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-300" />
            Toca los números
          </span>
        </div>

        <p className="mt-5 text-[1.2rem] leading-[2.1] text-white/90 sm:text-[1.35rem]">
          Gano <InlineNumber label="Ingresos al mes" value={income} onChange={setIncome} /> € al mes, gasto{" "}
          <InlineNumber label="Gastos al mes" value={expenses} onChange={setExpenses} /> € y tengo{" "}
          <InlineNumber label="Ahorros" value={savings} onChange={setSavings} /> € ahorrados. Quiero {LIVE_EXAMPLE.item} de{" "}
          <InlineNumber label="Precio del coche" value={price} onChange={setPrice} /> €.
        </p>

        <div className="mt-7 border-t border-night-line pt-6" aria-live="polite">
          <ScoreScale score={result.score} verdict={result.verdict} tone="night" size="md" />
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <Stat tone="night" label="Coste real al mes" value={formatEUR(result.monthlyTotal)} />
            <Stat tone="night" label={result.marginAfter >= 0 ? "Te queda libre" : "Te falta"} value={formatEUR(Math.abs(result.marginAfter))} />
          </dl>
        </div>

        <p className="mt-6 text-[13px] leading-relaxed text-night-muted">
          A {car.defaults.termMonths} meses al {formatPct(car.defaults.annualRate / 100)}, con {formatEUR(car.defaults.downPayment)} de entrada
          y {formatEUR(car.defaults.monthlyRunningCosts)} al mes de seguro, gasolina y mantenimiento.{" "}
          <Link href={href} className="font-medium text-white underline underline-offset-4 hover:text-brand-300">
            Ver el cálculo completo
          </Link>
        </p>
      </div>
    </Card>
  );
}
