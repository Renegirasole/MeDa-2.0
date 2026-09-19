import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, type Pillar } from "@/lib/guides";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";
import { ArrowGlyph } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Guías con números",
  description:
    "Guías de dinero con cifras de verdad: qué sueldo necesitas para una hipoteca, cuánto cuesta un coche al mes y cuánto colchón necesitas. Calculadas con las reglas de MeDa.",
  alternates: { canonical: "/guias" },
};

const PILLARS: Pillar[] = ["Vivienda", "Coche y moto", "Dinero joven"];

export default function GuidesPage() {
  const groups = PILLARS.map((p) => ({ pillar: p, guides: GUIDES.filter((g) => g.pillar === p) })).filter((g) => g.guides.length > 0);
  return (
    <>
      <PageHeader
        eyebrow="Guías"
        title="Respuestas con números, no con opiniones"
        intro="Cada guía contesta una pregunta que se busca mucho, con las cifras calculadas por el mismo motor que las calculadoras."
      />
      <Container className="pb-24">
        <div className="flex flex-col gap-14">
          {groups.map(({ pillar, guides }) => (
            <section key={pillar} aria-labelledby={`p-${pillar}`} className="border-t border-line pt-8">
              <h2 id={`p-${pillar}`} className="text-[13px] font-medium text-brand-700">
                {pillar}
              </h2>
              <ul className="mt-4 flex flex-col divide-y divide-line">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guias/${g.slug}`}
                      className="group/btn -mx-4 grid gap-2 rounded-card px-4 py-6 transition-colors duration-150 hover:bg-surface md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10"
                    >
                      <span>
                        <span className="block text-[1.375rem] leading-snug font-semibold tracking-[-0.02em] text-balance text-ink md:text-[1.625rem]">
                          {g.title}
                        </span>
                        <span className="mt-2 block max-w-[65ch] text-[16px] leading-relaxed text-muted">{g.teaser}</span>
                      </span>
                      <span className="flex items-center gap-3 text-[14px] text-muted">
                        {g.minutes} min · {formatDate(g.updated)}
                        <span className="text-ink">
                          <ArrowGlyph />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
