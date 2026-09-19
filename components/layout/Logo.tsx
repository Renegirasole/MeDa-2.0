import Link from "next/link";
import { cn } from "@/components/ui/cn";

/** Marca: la Escala MeDa en miniatura, con la aguja en la zona "te da". Funciona a 16 px y en fondo oscuro. */
export function LogoMark({ size = 28, tone = "light" }: { size?: number; tone?: "light" | "night" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="10"
        fill={tone === "light" ? "var(--color-night)" : "var(--color-night-2)"}
        stroke={tone === "light" ? "none" : "var(--color-night-line)"}
      />
      <path d="M7.5 21a8.5 8.5 0 0 1 4.25-7.36" fill="none" stroke="var(--color-alert-300)" strokeWidth="3.2" />
      <path d="M12.9 13.1a8.5 8.5 0 0 1 6.2 0" fill="none" stroke="var(--color-caution-300)" strokeWidth="3.2" />
      <path d="M20.25 13.64A8.5 8.5 0 0 1 24.5 21" fill="none" stroke="var(--color-brand-300)" strokeWidth="3.2" />
      <path d="M16 21l5.2-4.6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="21" r="2" fill="white" />
    </svg>
  );
}

export function Logo({ tone = "light", className }: { tone?: "light" | "night"; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex min-h-11 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600",
        className,
      )}
      aria-label="MeDa, ir al inicio"
    >
      <LogoMark tone={tone} />
      <span className={cn("text-[1.2rem] font-semibold tracking-[-0.03em]", tone === "light" ? "text-ink" : "text-white")}>MeDa</span>
    </Link>
  );
}
