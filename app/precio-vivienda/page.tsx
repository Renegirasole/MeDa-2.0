import type { Metadata } from "next";
import Link from "next/link";
import { HEADLINE_AREA, PRICE_SOURCES, TOWNS, townCase } from "@/lib/zonas/precios";
import { formatEUR, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Precio de la vivienda por ciudad",
  description:
    "Cuánto cuesta un piso en tu ciudad: precio del m², lo que vale uno de 80 m², la cuota, el sueldo que hace falta y el alquiler. Con datos oficiales.",
  alternates: { canonical: "/precio-vivienda" },
};

const unit = (v: number) => `${formatNumber(Math.round(v))} €`;

export default function TownPriceIndexPage() {
  const byProvince = new Map<string, typeof TOWNS>();
  for (const t of TOWNS) {
    const list = byProvince.get(t.provName) ?? [];
    list.push(t);
    byProvince.set(t.provName, list);
  }
  const provinces = [...byProvince.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  const dearest = [...TOWNS].sort((a, b) => b.saleUnit - a.saleUnit).slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="Precio de la vivienda"
        title="¿Cuánto cuesta un piso en tu ciudad?"
        intro={`Precio del metro cuadrado, cuota, sueldo necesario y alquiler en ${TOWNS.length} ciudades españolas. Valor tasado medio del ${PRICE_SOURCES.salePeriod} (Ministerio de Transportes) y alquileres declarados a Hacienda en ${PRICE_SOURCES.rentYear}.`}
      />
      <Container className="pb-24">
        <section aria-labelledby="caras" className="border-t border-line pt-8">
          <h2 id="caras" className="text-[13px] font-medium text-brand-700">
            Las más caras
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dearest.map((t) => {
              const c = townCase(t, HEADLINE_AREA);
              return (
                <li key={t.code}>
                  <Link
                    href={`/precio-vivienda/${t.slug}`}
                    className="flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-[border-color,box-shadow] duration-150 hover:border-ink/20 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    <span className="font-semibold text-ink">{t.name}</span>
                    <span className="num mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-ink">{unit(t.saleUnit)}/m²</span>
                    <span className="mt-1 text-[14px] text-muted">
                      {HEADLINE_AREA} m²: {formatEUR(c.price)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="todas" className="mt-14 border-t border-line pt-8">
          <h2 id="todas" className="text-[13px] font-medium text-brand-700">
            Todas las ciudades, por provincia
          </h2>
          <div className="mt-6 columns-1 gap-10 sm:columns-2 lg:columns-3">
            {provinces.map(([prov, list]) => (
              <div key={prov} className="mb-8 break-inside-avoid">
                <h3 className="text-[15px] font-semibold text-ink">{prov}</h3>
                <ul className="mt-2 flex flex-col">
                  {list.map((t) => (
                    <li key={t.code}>
                      <Link
                        href={`/precio-vivienda/${t.slug}`}
                        className="flex min-h-11 items-center justify-between gap-4 border-b border-line/70 text-[15px] text-ink-2 transition-colors duration-150 hover:text-brand-700"
                      >
                        <span>{t.name}</span>
                        <span className="num shrink-0 text-muted">{unit(t.saleUnit)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-12 max-w-[65ch] text-[15px] leading-relaxed text-muted">
          Solo están las ciudades de más de 25.000 habitantes, que son las que publica el Ministerio. Si buscas el precio de tu
          barrio o de tu piso concreto,{" "}
          <Link href="/tasador/vender-piso" className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
            el Tasador lo calcula con la dirección
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
