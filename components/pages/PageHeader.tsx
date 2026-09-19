import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import { Container, Eyebrow } from "@/components/ui/Section";

interface Crumb {
  href: string;
  label: string;
}

/** Cabecera de página: dónde estás (migas o etiqueta), qué es y qué hacer. */
export function PageHeader({
  title,
  intro,
  eyebrow,
  crumbs = [],
  aside,
}: {
  title: string;
  intro?: ReactNode;
  eyebrow?: string;
  crumbs?: Crumb[];
  aside?: ReactNode;
}) {
  const breadcrumbLd =
    crumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [...crumbs, { href: "", label: title }].map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: `${SITE.url}${c.href}` } : {}),
          })),
        }
      : null;

  return (
    <Container className="pt-8 pb-10 md:pt-14 md:pb-14">
      {crumbs.length > 0 ? (
        <nav aria-label="Migas de pan" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-[14px] text-muted">
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-1.5">
                <Link href={c.href} className="-my-3 inline-flex min-h-11 items-center transition-colors duration-150 hover:text-ink">
                  {c.label}
                </Link>
                <span aria-hidden="true" className="text-line-strong">
                  /
                </span>
              </li>
            ))}
          </ol>
        </nav>
      ) : (
        eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
      )}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-ink md:text-[3.5rem]">{title}</h1>
          {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{intro}</p>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {breadcrumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />}
    </Container>
  );
}
