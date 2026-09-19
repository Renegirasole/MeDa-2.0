import Link from "next/link";
import { CATEGORIES } from "@/lib/data/categories";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Section } from "@/components/ui/Section";
import { IconArrowRight } from "@/components/ui/icons";

interface Props {
  id?: string;
  /** null = sin cabecera (cuando la página ya tiene su propio h1) */
  title?: string | null;
  className?: string;
}

/** Elegir qué quieres comprar: diez puertas de entrada, todas iguales. */
export function CalculatorGrid({ id = "calculadoras", title = "¿Para qué quieres saber si te da?", className }: Props) {
  return (
    <Section
      id={id}
      className={className}
      eyebrow={title ? "Calculadoras" : undefined}
      title={title ?? undefined}
      intro={title ? "Cada una ya incluye los gastos que se suelen olvidar: seguro, comunidad, matrícula, mantenimiento…" : undefined}
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/calculadoras/${c.slug}`}
              className="group flex h-full min-h-40 flex-col rounded-card border border-line bg-surface p-4 transition-[border-color,box-shadow,transform] duration-160 ease-(--ease-out) hover:border-ink/20 hover:shadow-card active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:p-5"
            >
              <span className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-subtle text-ink transition-colors duration-200 group-hover:bg-brand-50 group-hover:text-brand-700">
                  <CategoryIcon name={c.icon} size={22} />
                </span>
                <IconArrowRight
                  size={18}
                  aria-hidden="true"
                  className="text-line-strong transition-[transform,color] duration-200 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:text-ink"
                />
              </span>
              <span className="mt-auto pt-6 font-semibold text-ink">{c.name}</span>
              <span className="mt-1 text-[13px] leading-snug text-muted">{c.teaser}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
