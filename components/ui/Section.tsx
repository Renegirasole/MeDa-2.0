import type { ReactNode } from "react";
import { cn } from "./cn";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/** Etiqueta pequeña sobre un titular: dice en qué parte del producto estás. */
export function Eyebrow({ children, className, tone = "light" }: { children: ReactNode; className?: string; tone?: "light" | "night" }) {
  return (
    <p className={cn("text-[13px] font-medium tracking-wide", tone === "light" ? "text-brand-700" : "text-brand-300", className)}>
      {children}
    </p>
  );
}

interface SectionProps {
  id?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  intro?: ReactNode;
  /** Acción alineada con la cabecera en escritorio */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Section({ id, eyebrow, title, intro, aside, className, children }: SectionProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className={cn("scroll-mt-20 py-20 md:py-28", className)}>
      <Container>
        {title && (
          <header className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
              <h2 id={headingId} className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-ink md:text-[2.75rem]">
                {title}
              </h2>
              {intro && <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>}
            </div>
            {aside && <div className="shrink-0">{aside}</div>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
