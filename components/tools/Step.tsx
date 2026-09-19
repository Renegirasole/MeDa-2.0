import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

/** Paso numerado de un formulario: el usuario sabe dónde está y qué falta. */
export function Step({
  n,
  title,
  aside,
  children,
  className,
}: {
  n: number;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = `paso-${n}`;
  return (
    <Card className={cn("p-5 sm:p-7", className)}>
      <section aria-labelledby={id}>
        <header className="mb-6 flex items-center gap-3">
          <span className="num flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white">{n}</span>
          <h2 id={id} className="flex-1 scroll-mt-28 text-lg font-semibold tracking-[-0.01em] text-ink">
            {title}
          </h2>
          {aside}
        </header>
        {children}
      </section>
    </Card>
  );
}
