import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * Divulgación progresiva con <details> nativo: accesible por teclado,
 * funciona sin JS y no anima la altura (solo el contenido entra con un fundido).
 */
export function Disclosure({
  summary,
  meta,
  children,
  defaultOpen,
  className,
}: {
  summary: ReactNode;
  /** Texto corto a la derecha: "opcional", "3 datos"… */
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={cn("group/disclosure", className)}>
      <summary className="-mx-2 flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg px-2 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-subtle focus-visible:outline-2 focus-visible:outline-brand-600">
        <span className="flex-1">{summary}</span>
        {meta && <span className="text-[13px] font-normal text-muted">{meta}</span>}
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="disclosure-chevron shrink-0 text-muted transition-transform duration-200 ease-(--ease-out)"
        >
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="disclosure-body pt-4">{children}</div>
    </details>
  );
}
