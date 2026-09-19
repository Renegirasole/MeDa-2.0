import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

/**
 * Jerarquía de acciones:
 * - primary: la acción principal de la pantalla. Una por vista.
 * - secondary: alternativa razonable.
 * - tertiary: acción de apoyo, sin caja.
 * - destructive: borra algo. Siempre discreta hasta el hover.
 * - inverse: principal sobre panel oscuro.
 */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "inverse";
type Size = "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none " +
  "transition-[transform,background-color,border-color,color,box-shadow] duration-160 ease-(--ease-out) active:scale-[0.97] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 " +
  "disabled:pointer-events-none disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] hover:bg-brand-700",
  secondary: "border border-line-strong bg-surface text-ink hover:border-ink/40",
  tertiary: "text-ink-2 hover:bg-subtle hover:text-ink",
  destructive: "text-alert-700 hover:bg-alert-50",
  inverse: "bg-white text-ink hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export const buttonClass = (variant: ButtonVariant = "primary", size: Size = "md", className?: string) =>
  cn(base, variants[variant], sizes[size], variant === "tertiary" || variant === "destructive" ? "px-4" : null, className);

interface CommonProps {
  variant?: ButtonVariant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

/** Flecha que avanza al pasar el ratón: indica "te llevamos a otra pantalla". */
export function ArrowGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="transition-transform duration-200 ease-(--ease-out) group-hover/btn:translate-x-0.5"
    >
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
