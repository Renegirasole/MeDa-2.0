import type { ReactNode } from "react";
import { cn } from "./cn";

/** Cifra con su etiqueta. `lead` para las dos cifras que más importan. */
export function Stat({
  label,
  value,
  hint,
  lead = false,
  tone = "light",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  lead?: boolean;
  tone?: "light" | "night";
  className?: string;
}) {
  const night = tone === "night";
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className={cn("text-[13px]", night ? "text-night-muted" : "text-muted")}>{label}</dt>
      <dd className={cn("num font-semibold tracking-[-0.03em]", lead ? "text-[1.75rem] leading-tight" : "text-xl", night ? "text-white" : "text-ink")}>
        {value}
      </dd>
      {hint && <dd className={cn("text-[13px] leading-snug", night ? "text-night-muted" : "text-muted")}>{hint}</dd>}
    </div>
  );
}
