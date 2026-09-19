import type { ComponentProps } from "react";
import { cn } from "./cn";

/**
 * Superficie elevada. Solo cuando agrupar comunica algo:
 * un formulario, un resultado, una lista de opciones.
 */
export function Card({ className, tone = "light", ...rest }: ComponentProps<"div"> & { tone?: "light" | "night" }) {
  return (
    <div
      className={cn(
        "rounded-card",
        tone === "light" ? "border border-line bg-surface shadow-card" : "bg-night text-white shadow-raised",
        className,
      )}
      {...rest}
    />
  );
}
