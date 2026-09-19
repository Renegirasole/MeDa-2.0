"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "./cn";

const labelClass = "text-[14px] font-medium text-ink-2";
const hintClass = "text-[13px] leading-snug text-muted";

const controlBase =
  "flex items-center rounded-(--radius-control) border bg-surface transition-[border-color,box-shadow] duration-150 " +
  "focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: ReactNode;
  /** Mensaje de error junto al campo. Tiene prioridad sobre la pista. */
  error?: string | null;
  min?: number;
  max?: number;
  /** "lg" para la cifra protagonista de un formulario */
  size?: "md" | "lg";
  className?: string;
}

const parse = (raw: string) => {
  const n = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const display = (v: number) => (Number.isInteger(v) ? String(v) : String(v).replace(".", ","));

export function NumberField({ label, value, onChange, suffix, hint, error, min = 0, max, size = "md", className }: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div
        className={cn(
          controlBase,
          size === "lg" ? "h-16 px-4" : "h-12 px-3.5",
          error ? "border-alert-500" : "border-line-strong hover:border-ink/30",
        )}
      >
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "num w-full min-w-0 flex-1 bg-transparent text-ink outline-none",
            size === "lg" ? "text-[1.75rem] font-semibold tracking-[-0.02em]" : "text-base",
          )}
          value={draft ?? display(value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d.,]/g, "");
            setDraft(raw);
            let n = parse(raw);
            if (n < min) n = min;
            if (max !== undefined && n > max) n = max;
            onChange(n);
          }}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={() => setDraft(null)}
        />
        {suffix && <span className={cn("ml-2 shrink-0 text-muted", size === "lg" ? "text-lg" : "text-sm")}>{suffix}</span>}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-[13px] leading-snug font-medium text-alert-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={hintClass}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
  hint?: ReactNode;
  className?: string;
}

export function SelectField<T extends string>({ label, value, options, onChange, hint, className }: SelectFieldProps<T>) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className={cn(controlBase, "relative h-12 border-line-strong hover:border-ink/30")}>
        <select
          id={id}
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-full w-full appearance-none bg-transparent pr-10 pl-3.5 text-base text-ink outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" className="pointer-events-none absolute right-3.5 text-muted">
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {hint && (
        <p id={`${id}-hint`} className={hintClass}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}

/** Elección entre 2–3 opciones. La píldora se desliza con transform. */
export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={cn(labelClass, "mb-2")}>{label}</legend>
      <div className="relative grid auto-cols-fr grid-flow-col rounded-(--radius-control) bg-subtle p-1">
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 rounded-[0.55rem] bg-surface shadow-[0_1px_2px_rgb(13_23_18/0.08),0_2px_8px_-2px_rgb(13_23_18/0.08)] transition-transform duration-200 ease-(--ease-out)"
          style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
        />
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "relative h-11 rounded-[0.55rem] px-4 text-[15px] font-medium transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-brand-600",
                active ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
