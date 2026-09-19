import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, type Pillar } from "@/lib/guides";
import { formatDate, formatEUR } from "@/lib/format";
import { CAR_SALARIES, carSlug, MORTGAGE_AMOUNTS, mortgageSlug, RENT_SALARIES, rentSlug } from "@/lib/programmatic";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";
import { ArrowGlyph } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Guías con números",
  description:
    "Guías de dinero con cifras de verdad: qué sueldo necesitas para una hipoteca y cuánto cuesta de verdad un coche al mes. Calculadas con el motor de MeDa.",
  alternates: { canonical: "/guias" },
};

const PILLARS: Pillar[] = ["Vivienda", "Coche y moto", "Dinero joven"];

/** Respuestas rápidas (páginas programáticas): una por cifra, enlazadas desde aquí para que Google las encuentre. */
const QUICK = [
  {
    title: "¿Cuánto ganar para una hipoteca de…?",
    links: MORTGAGE_AMOUNTS.map((v) => ({ href: `/cuanto-ganar-para/${mortgageSlug(v)}`, label: formatEUR(v) })),
  },
  {
    title: "¿Qué coche puedo comprar cobrando…?",
    links: CAR_SALARIES.map((v) => ({ href: `/que-puedo-permitirme/${carSlug(v)}`, label: formatEUR(v) })),
  },
  {
    title: "¿Cuánto alquiler puedo pagar cobrando…?",
    links: RENT_SALARIES.map((v) => ({ href: `/alquiler-maximo/${rentSlug(v)}`, label: formatEUR(v) })),
  },
];

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

          <section aria-labelledby="rapidas" className="border-t border-line pt-8">
            <h2 id="rapidas" className="text-[13px] font-medium text-brand-700">
              Respuestas rápidas
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3">
              {QUICK.map((q) => (
                <div key={q.title}>
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-ink">{q.title}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {q.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="num inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-3.5 text-[14px] text-ink-2 transition-colors duration-150 hover:border-ink/40 hover:text-ink"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Container>
    </>
  );
}
