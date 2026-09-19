import Link from "next/link";
import type { ReactNode } from "react";
import type { Guide } from "@/lib/guides";
import { SITE, TEAM } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pages/PageHeader";
import { ArrowGlyph, buttonClass } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Disclosure } from "@/components/ui/Disclosure";
import { IconCalendar, IconLock } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

export interface Faq {
  q: string;
  a: string;
}

const authors = TEAM.map((p) => p.name).join(" y ");

/** Lo que la plantilla necesita de una guía (también sirve para las páginas programáticas). */
export type GuideMeta = Pick<Guide, "title" | "description" | "published" | "updated" | "minutes">;

/**
 * Plantilla de guía (modo lectura): respuesta arriba, cuerpo a 65 caracteres,
 * calculadora siempre a mano y datos estructurados de artículo y preguntas frecuentes.
 */
export function GuideShell({
  guide,
  path,
  crumbs = [{ href: "/guias", label: "Guías" }],
  answer,
  cta,
  faqs,
  children,
}: {
  guide: GuideMeta;
  /** Ruta de la página, para los datos estructurados */
  path: string;
  crumbs?: { href: string; label: string }[];
  /** «La respuesta corta»: lo que alguien con prisa se lleva */
  answer: ReactNode;
  cta: { href: string; label: string; note: string };
  faqs: Faq[];
  children: ReactNode;
}) {
  const url = `${SITE.url}${path}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      url,
      inLanguage: "es-ES",
      datePublished: guide.published,
      dateModified: guide.updated,
      image: `${SITE.url}/opengraph-image`,
      author: TEAM.map((p) => ({ "@type": "Person", name: p.name, url: `${SITE.url}/quienes-somos` })),
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url, logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` } },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <PageHeader title={guide.title} crumbs={crumbs} />
      <Container className="-mt-4 pb-24 md:-mt-6">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
          <span>
            Por{" "}
            <Link href="/quienes-somos" className="font-medium text-ink underline-offset-4 hover:underline">
              {authors}
            </Link>
          </span>
          <span aria-hidden="true" className="text-line-strong">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar size={15} aria-hidden="true" />
            Actualizada el <time dateTime={guide.updated}>{formatDate(guide.updated)}</time>
          </span>
          <span aria-hidden="true" className="text-line-strong">
            ·
          </span>
          <span>{guide.minutes} min de lectura</span>
        </p>

        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-16">
          <article className="flex min-w-0 flex-col gap-14">
            <section aria-labelledby="respuesta" className="rounded-card bg-night p-6 text-white sm:p-9">
              <h2 id="respuesta" className="text-[13px] font-medium text-night-muted">
                La respuesta corta
              </h2>
              <div className="mt-4">{answer}</div>
              {/* En móvil el lateral queda al final: la calculadora, también aquí */}
              <a href={cta.href} className={buttonClass("inverse", "md", "mt-8 w-full lg:hidden")}>
                {cta.label}
                <ArrowGlyph />
              </a>
            </section>

            {children}

            <section aria-labelledby="faq" className="border-t border-line pt-10">
              <h2 id="faq" className="text-[1.625rem] leading-tight font-semibold tracking-[-0.025em] text-ink md:text-[2rem]">
                Preguntas frecuentes
              </h2>
              <div className="mt-6 flex flex-col divide-y divide-line border-y border-line">
                {faqs.map((f) => (
                  <Disclosure key={f.q} summary={f.q} className="py-2">
                    <p className="max-w-[65ch] pb-3 text-[16px] leading-relaxed text-ink-2">{f.a}</p>
                  </Disclosure>
                ))}
              </div>
            </section>

            <p className="max-w-[65ch] text-[14px] leading-relaxed text-muted">
              Cifras orientativas calculadas con las reglas públicas de MeDa (
              <Link href="/como-calculamos" className="underline underline-offset-4 hover:text-ink">
                cómo calculamos
              </Link>
              ). No son asesoramiento financiero: antes de firmar, compara ofertas y revisa la TAE.
            </p>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-line bg-surface p-6 shadow-card">
              <p className="text-lg leading-snug font-semibold tracking-[-0.02em] text-ink">Tu caso no es el del ejemplo</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{cta.note}</p>
              <a href={cta.href} className={buttonClass("primary", "md", "mt-5 w-full")}>
                {cta.label}
                <ArrowGlyph />
              </a>
              <p className="mt-3 flex items-center gap-2 text-[13px] text-muted">
                <IconLock size={14} aria-hidden="true" /> Gratis, sin registro. Tus números no salen de tu móvil.
              </p>
            </div>
          </aside>
        </div>
      </Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}

/** Sección del cuerpo: titular propio y texto a medida de lectura. */
export function GuideSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-24 border-t border-line pt-10">
      <h2 id={`${id}-t`} className="max-w-[26ch] text-[1.625rem] leading-tight font-semibold tracking-[-0.025em] text-balance text-ink md:text-[2rem]">
        {title}
      </h2>
      <div className="mt-5 flex max-w-[65ch] flex-col gap-4 text-[17px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

/** Tabla de cifras: columnas numéricas alineadas a la derecha, fila destacada opcional. */
export function DataTable({
  caption,
  head,
  rows,
  highlight,
}: {
  caption: string;
  head: string[];
  rows: ReactNode[][];
  /** Índice de la fila a destacar (el caso de la guía) */
  highlight?: number;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[520px] border-collapse text-left text-[15px]">
        <caption className="mb-3 text-left text-[13px] text-muted">{caption}</caption>
        <thead>
          <tr className="border-b border-line-strong">
            {head.map((h, i) => (
              <th key={h} scope="col" className={cn("py-2.5 pr-4 text-[13px] font-medium text-muted", i > 0 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className={cn("border-b border-line", ri === highlight && "bg-brand-50")}>
              {r.map((c, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row" className={cn("py-3 pr-4 pl-2 font-medium text-ink", ri === highlight && "text-brand-700")}>
                    {c}
                  </th>
                ) : (
                  <td key={ci} className="num py-3 pr-4 text-right text-ink-2 last:pr-2">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
